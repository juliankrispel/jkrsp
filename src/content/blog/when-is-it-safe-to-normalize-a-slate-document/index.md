---
title: "When is it safe to normalize a Slate document?"
pubDate: "2026-07-19T12:00:00.000Z"
description: "Slate normalization can silently duplicate your users' content in collaborative editors. Which repairs are safe to run per-peer with Yjs, which never are, and the design rules that avoid the whole class of bug."
draft: false
keywords: ["slate", "slate-js", "yjs", "crdt", "normalization", "collaborative editing", "rich text editor", "normalizeNode", "prosemirror", "javascript", "typescript"]
author: "Julian Krispel"
category: "Web Development"
tags: ["slate", "yjs", "crdt", "rich-text-editor", "collaborative-editing", "normalization", "javascript", "typescript"]
readingTime: "12 min read"
difficulty: "Advanced"
---

tldr; Slate normalizers that only **delete nodes or set properties** are safe to run in a collaborative session. Normalizers that **insert, wrap, unwrap, lift, merge, move or split** will duplicate your users' content under concurrency — they need exactly one origin. The rest of this post is the scar tissue behind those two sentences.

I spend most of my time inside rich text editors — my own projects and my clients'. For the past while I've been deep in one in particular: a large collaborative document editor built on Slate, with Yjs for real-time sync. Working on it, I kept meeting one very specific kind of bug report: content that **duplicates itself**. A user pastes a slightly-wrong list shape into a shared document, and a moment later there are two lists. Sometimes three. Nobody pressed paste twice.

Every one of those bugs traced back to the same mechanism: **Slate normalization running in a collaborative session**. This is the writeup I wish I'd read before that editor shipped multiplayer — what normalization actually is, the precise physics of why it corrupts CRDT-backed documents, which repairs are safe and which never are, and the design that avoids the whole class of bug.

## What normalization is

Slate's philosophy of document validity is *reparative*: the document is allowed to be temporarily wrong, and a layer of normalizers converges it back to valid. Every editor and plugin can override `normalizeNode`; after each transaction Slate visits the "dirty" paths and calls the normalizer stack on each, and every repair the normalizer makes dirties more paths, which get normalized in turn, until the document reaches a fixpoint.

This is the opposite of ProseMirror, where validity is *constructive*: every editing step is coerced to fit the schema while it's being built (`ContentMatch`, `fillBefore`, `findWrapping`), so an invalid document state never exists to be observed. Slate chose flexibility instead — it famously removed its declarative schema years ago in favor of the imperative `normalizeNode` hook.

In a single-user editor this trade is mostly fine. You pay some tax:

- The content model exists nowhere. "What is a valid document?" is answered only by the union of every plugin's normalizer, in the order they happen to run. New engineers learn the model by reading repair code.
- Fixpoint iteration is order-dependent and unbounded. Two plugins can fight over the same node — repair A creates the shape repair B removes — and Slate ships a max-iteration error (`Could not completely normalize the editor`) for exactly that.
- Repairs happen implicitly, at a distance from the edit that caused them, which makes them hard to attribute and debug.

Annoying, but survivable. Then you add collaboration.

## The physics of the failure

Three facts combine into the bug class. Each is individually innocuous.

**1. Normalizers run on every peer — including after *remote* changes apply.** When a collaborator's edit arrives over Yjs, the binding applies it to your local Slate state, those paths become dirty, and your normalizers run on them. If the incoming state is invalid, every connected peer observes the same invalid shape and every peer's normalizer independently decides to fix it.

**2. Yjs converges concurrent deletes but never dedupes concurrent inserts.** Deleting the same item on two peers merges to "deleted once." But an insert always mints fresh CRDT items with fresh IDs — Yjs has no concept of "these two concurrently-inserted nodes are the same thing." Two peers inserting byte-identical content produce two copies, permanently.

**3. In the Slate↔Yjs binding, there is no identity-preserving move.** A Yjs shared type belongs to exactly one parent. Anything that relocates a node — `moveNodes`, `wrapNodes`, `unwrapNodes`, `liftNodes`, `mergeNodes`, `splitNodes` — is implemented at the CRDT layer as *delete here, re-insert there*. The re-insert is a fresh insert, subject to fact 2.

Now trace the ghost-list bug through those facts:

1. A malformed list shape enters a shared document (a paste, an importer, an API write).
2. It syncs. Peer A and peer B both apply the remote change; both normalizers wake up (fact 1).
3. Each normalizer performs the standard Slate repair: remove the offending node, re-insert it correctly wrapped.
4. The two removes converge — the bad node is gone once (fact 2, delete half).
5. The two re-inserts don't — each minted fresh IDs (facts 2 and 3). After the merge: **two** repaired lists.

Every peer did the *correct* repair. The duplication is not a bug in any normalizer; it's the composition of reactive per-peer repair with commutative merge.

### Determinism makes it worse, not better

My first instinct was: make the repair deterministic — same input, same output, no random IDs — and surely the peers will produce "the same" fix. I prototyped exactly that (a schema-driven `fillBefore`-style repair, pure and deterministic, with tests proving byte-identical output).

It doesn't help. Yjs dedupes by CRDT item identity, not by content. Two peers deterministically producing identical repairs just guarantees a *clean-looking* duplicate. Determinism is necessary for any shared repair path — and completely insufficient for safety. If your plan for collaborative normalization is "make it deterministic," you have re-derived the bug.

## Scar tissue

Four wounds, each of which sharpened the rules at the end of this post.

**The ghost lists.** As above. The tactical fix was to *skip* the generative branch of the list normalizer whenever the editor is Yjs-bound, and defer that cleanup to a reconcile pass at a save/publish boundary. It stopped the duplication, but let's be honest about what it is: suppression. The invalid shape now lives in the shared document until that boundary arrives. I'll come back to this.

**The over-correction that desynced peers.** Elsewhere in the same editor there was the opposite instinct: an unwanted op (a backspace that would have deleted content the user couldn't even see at the time), so the editor swallowed it. The swallow logic initially applied to *all* ops — including remote ones. Dropping a remote op is far worse than any duplication: your Slate state now disagrees with the shared Yjs state, and every subsequent op from that peer applies against a document that doesn't match, compounding into structural garbage. The rule I took away: **your policies apply to local ops only; remote ops must always apply verbatim.** By the time an op reaches you, it is history — refusing history desynchronizes you from it.

**Merge-emergent invalidity — the case no guard can catch.** After adding origin guards (only normalize local-origin changes), I assumed the bases were covered: whoever *authors* an invalid shape repairs it locally, everyone else stays hands-off. Then: a two-item list. User A deletes item one — locally valid, one item remains. User B concurrently deletes item two — also locally valid. The merge produces an **empty list, which neither peer authored**. No local-origin guard will ever fire for it, because no local edit created it. And if both peers reactively "fix" it by inserting a placeholder item, you're back at the duplication bug — two placeholders. Invalid states can be *born from the merge itself*. Any design that only handles authored invalidity is incomplete.

**Origins don't cross the wire.** Like most editors these days, this one also has automated writers — integrations and AI agents pushing edits through the sync layer. I learned that op origins — "this change was already validated/normalized, trust it" — are a local concept. Yjs updates carry no metadata a peer could use to distinguish "pre-repaired by a trusted origin" from anything else. You cannot tag your way out; whatever policy peers apply to remote changes, they apply to all of them.

## The taxonomy: which repairs are actually safe

The safety line does not run where you'd guess. It's not "small repairs are safe, big ones aren't." It runs along a CRDT property: **does the repair only ever delete things and set properties, or does it insert?**

| Repair, at the Slate level | At the CRDT level | Concurrent execution on N peers |
|---|---|---|
| `removeNodes` (drop an illegal/empty node) | pure delete | ✅ converges — deleting twice = deleted once |
| `removeNodes` of a subtree | pure delete | ✅ converges |
| `setNodes` (fix a property to a canonical value) | register write | ✅ converges (same value; last-writer-wins on the same key) |
| `unsetNodes` | register write | ✅ converges |
| `insertNodes` (fill a missing required child) | fresh insert | ❌ duplicates |
| `wrapNodes` (wrap a bare node in its required parent) | delete + fresh insert | ❌ duplicates the subtree |
| `unwrapNodes`, `liftNodes` | children delete + fresh insert | ❌ duplicates children |
| `mergeNodes` (merge adjacent lists) | children delete + fresh insert | ❌ duplicates children |
| `moveNodes`, `splitNodes` | delete + fresh insert | ❌ duplicates |

Note how brutal that table is. Almost the entire standard normalization repertoire — wrap, unwrap, lift, merge — is in the unsafe column, because the binding has no identity-preserving move. Repairs that *look* purely structural ("I'm not creating content, just relocating it!") are generative at the layer that decides convergence.

So the rules:

**Rule 1 — Convergent repairs may run per-peer.** If a repair consists *only* of removals and property writes, it is safe to run reactively on every peer, even in response to remote changes. Concurrent execution converges by CRDT construction. Delete the empty wrapper, drop the illegal child, clamp the invalid attribute: fine.

**Rule 2 — Generative repairs must have exactly one origin.** Anything that inserts (including every move-shaped transform) must be derived and applied *once*. Options, in order of preference:

- **Repair at the gate.** If invalid shapes enter through a channel you control — paste handlers, importers, an API, an agent endpoint — validate and repair *there*, before the content touches the shared document. The invalid shape never syncs; no peer ever reacts to it.
- **Repair at a server authority.** For invalidity that appears *in* the shared document (including merge-emergent shapes no client authored), the actor holding the authoritative document — your sync server — is the natural single origin. It validates the merged state, derives the repair, applies it once; clients receive it as ordinary remote ops. This is, not coincidentally, the property ProseMirror's native collab gets from its central authority and rebase model — and loses again when run over Yjs. A CRDT gives you commutativity but no validation authority; if you need one, you have to reintroduce it deliberately.
- **Repair at a boundary.** Defer: tolerate the invalid shape during the live session and canonicalize at a natural serialization point — publish, save, an idle reconcile — where a single actor rewrites the document. Weakest option (the live doc is wrong in the meantime, and edits can build on the wrong shape) but a legitimate backstop.

**Rule 3 — Local-origin guards are necessary and insufficient.** Guard generative normalizers so they only react to local-origin changes (`isLocal`-style checks around the binding's remote-apply). This correctly makes the *author* of an invalid shape the single origin for its repair. But it cannot cover merge-emergent invalidity — no one is the author — so Rule 2's server or boundary must exist as well.

**Rule 4 — Never drop or rewrite remote ops.** Whatever your local policy, remote operations apply verbatim. The alternative is divergence from the shared state, which is strictly worse than any shape you were trying to prevent.

**Rule 5 — Determinism and idempotency are prerequisites, not solutions.** Any repair that runs anywhere near shared state must be deterministic (no random IDs, no clocks) and idempotent — those properties make single-origin repair *correct*. They do not make multi-origin repair safe. (And check idempotency adversarially: my append-only fill repair was idempotent on well-ordered input and quietly wasn't on out-of-order input.)

## Designing your way out

The rules above are defensive. The deeper fix is architectural:

**Separate knowing from fixing.** The root enabler of all this scar tissue is that in stock Slate, the content model *is* the repair code. Extract it: a declarative, machine-readable schema — element vocabulary, containment expressions, property constraints — with a **check-only** validator that reports structured violations and mutates nothing. The version I've been building is a plain JSON schema plus a small content-expression grammar, importable by the browser editor, the sync server, and agents alike, with drift-guard tests pinning it to the editor's runtime types. Once "is this valid?" is a pure function, *who repairs and when* becomes a policy decision you can actually make per deployment context — instead of a side effect of whichever plugin's `normalizeNode` fires first.

**Classify violations by repair class.** For each rule in your model, decide: convergent repair (run anywhere, Rule 1), generative repair (single origin, Rule 2), or *tolerated* (report it, don't fix it — some legacy shapes are best left alone). Making severity explicit in the validator forces the conversation normalization lets you skip.

**Prefer consuming valid content over repairing invalid content.** Every producer of document content — paste, import, API, AI agent — validates against the model *before* writing. It is always cheaper to reject or fix content at a gate with one owner than to repair it in a document with N concurrent observers.

**If you're single-user, relax — mostly.** No CRDT, no concurrent repair, no duplication: normalize freely. You still inherit the single-player warts (scattered model, fixpoint fights), so the declarative model is still worth having. But the moment a second replica appears — a collaborator, a server-side writer, an agent — every generative normalizer you wrote becomes a latent duplication bug. Audit them *before* you ship multiplayer, not after; retrofitting origin guards under fire is exactly how this scar tissue got collected.

## The checklist

Before a Slate normalizer ships into a collaborative editor, ask:

1. **Does it only delete and set properties?** → Safe everywhere.
2. **Does it insert, wrap, unwrap, lift, merge, move, or split?** → It's generative. It needs exactly one origin:
   - authored invalidity → guard to local-origin only, or repair at the input gate;
   - merge-emergent invalidity → server authority or boundary reconcile. A local guard *cannot* catch this.
3. **Could it ever run in response to a remote change?** → If it's generative, that's the duplication bug. If your "fix" is dropping the remote op instead — that's the desync bug. Neither.
4. **Is it deterministic and idempotent?** → Required, but don't let that lull you: identical deterministic repairs on two peers merge into identical duplicates.
5. **Do you know, in one written-down place, what "valid" means?** → If validity only exists as repair code, you can't reason about any of the above. Start there.

Normalization isn't evil. It's a single-replica invariant-maintenance strategy, and it's a good one — in a single-replica world. Slate never promised otherwise; the flaw is ours if we carry the mechanism across the CRDT boundary unexamined. Know which of your repairs converge, give the rest exactly one origin, and write your content model down where every replica can read it.

*Thanks to the merge semantics of Yjs for teaching me all of this the only way it apparently can be learned.*
