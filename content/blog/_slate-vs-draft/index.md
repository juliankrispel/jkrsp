---
title: Slate.js vs Draft.js, a comparison of text editing libraries
date: "2021-05-12T18:00:00.284Z"
description: Slate.js vs Draft.js, a comparison of text editing libraries
draft: true
---

You're building the next big text-editing interface and need a powerful library that integrates with react.

A search that will most likely lead you to the inevitable fork in the road: Should you use [__Draft.js__](https://draftjs.org/) or [__Slate.js__](https://www.slatejs.org/)?

What follows is a comparison based on facts, opinions and experience working with both draft.js and slate.js as a text-editing consultant for several years.

tdlr;

|                           | Draft.js                                      | Slate.js                                                   |
| --                        | --                                            |  --                                                        |
| Licensing                 | MIT                                           | MIT                                                        |
| Type System               | Uses [Flow], 3rd party [typescript support]   | Written in typescript                                      |
| Immutable data            | [Immutable.js]                                | [immer]                                                    |
| ⚖️ Size                    | ~170kb incl deps                              | ~80kb incl deps                                            |
| Maturity / Stability      | very stable, used by facebook                 |  Still in beta, frequent breaking changes                  |
| Open source               | Seeminingly unmaintained                      | Well maintained, open to contributions                     |
| Size                      | ~170kb incl deps                              | ~80kb incl deps                                            |
| Documentation             | ✅ Covers basics and some in-depth topics     | 👎 Covers basics but doesn't get you very far               |
| Tree (e.g. Table) support | ❌ None                                       | ✅ Supports any kind of tree structure at any depth         |
| Mobile support            | ❌ None                                       | ✅ Supports a few mobile browsers, android in the works     |
| Collaborative editing     | ❌ None                                       | ❌ None but operations lend themselves to implement OT      |

### Licensing

Fortunately, both projects use MIT at the time of writing this article. This wasn't always the case for Draft.js hover (nor React.js for that matter). After significant [public outcry] over facebooks previous (predatory) licensing model draft.js [has been relicensed to use MIT](https://github.com/facebook/draft-js/pull/1967).

### Type system

Slate.js uses typescript and has excellent support for it. For example, with the current release users are able to define the types of nodes that [slate uses](https://docs.slatejs.org/concepts/12-typescript#defining-editor-element-and-text-types).

Draft.js on the other hand uses [Flow], Facebooks alternative type checker. 5 years on, it's clear that typescript has won the "type-wars" and there is little use of Flow outside of facebook.

However, [@typed/draft-js] is an npm package that enables typescript support for draft.js, which makes this much less of an issue.

### Documentation

This is a point where draft.js clearly wins. 

### Data structure

Draft.js uses immutable.js

### Maturity / Stability

Slate.js is still in beta and as such breaking changes are not uncommon.
Draft.js


### Open source

Imo the best measure of this is to compare https://github.com/facebook/draft-js/commits/master

### Size

Draft.js: ~ 170kb incl deps
Slate.js: ~ 80kb incl deps

Size matters. Currently Including dependencies slate.js clocks in at less than half the size of draft.js. Draft.js's dependency on immutable.js makes up a lot of that.




[Flow]: https://flow.org
[typescript support]: https://www.npmjs.com/package/@types/draft-js
[Immutable.js]: https://immutable-js.github.io/immutable-js/
[immer]: https://github.com/immerjs/immer
[public outcry]: https://www.freecodecamp.org/news/facebook-just-changed-the-license-on-react-heres-a-2-minute-explanation-why-5878478913b2/
[@typed/draft-js]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/draft-js