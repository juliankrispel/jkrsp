---
title: Making HTML from MS Office & Google Docs Semantic
pubDate: "2025-07-14T00:00:00.000Z"
description: How to convert messy HTML from Google Docs and Microsoft Office into clean, semantic HTML before parsing it in your app.
draft: false
---

If you’ve ever let users paste content from Google Docs or Microsoft Office into your web app, you know the pain: the HTML is a mess. Non-semantic tags, inline styles, and proprietary attributes make it hard for frameworks and editors to parse the content cleanly.

In this post, I’ll show you a practical approach to cleaning up and converting this HTML into semantic, accessible markup—before it ever hits your rich text editor or content pipeline.

---

## Why Bother Making HTML Semantic?

- **Accessibility:** Semantic tags (like `<strong>`, `<blockquote>`, `<ol>`, `<ul>`, `<li>`, etc.) help screen readers and assistive tech.
- **Cleaner Parsing:** Frameworks and editors (Lexical, Slate, ProseMirror, etc.) work better with semantic HTML.
- **Maintainability:** Semantic HTML is easier to style and debug.

---

## The Problem: What Google Docs & Office Output Looks Like

When you copy-paste from Google Docs or Microsoft Word, you get things like:

```html
<b style="font-weight: normal;">Not actually bold</b>
<span style="font-weight: 700;">Actually bold</span>
<p class="MsoListParagraph" style="mso-list: l0 level1 lfo1;">1. List item</p>
<o:p></o:p>
```

- Google Docs uses `<b>` for normal text and `<span style="font-weight: 700">` for bold.
- Microsoft Office uses class names like `MsoTitle` for headings, `MsoQuote` for quotes, and `MsoListParagraph` for list items.
- Both use lots of inline styles and non-semantic tags.

---

## The Solution: Walk & Transform the DOM

Here’s a TypeScript function that walks the DOM and replaces these non-semantic elements with proper HTML:

```ts
const orderedListBulletText = [
  "1", "2", "3", "4", "5", "6", "7",
  "8", "9", "0", "a", "b", "c", "d",
  "e", "f", "g", "h", "i", "j", "k",
  "l", "m", "n", "o", "p", "q", "r",
  "s", "t", "u", "v", "w", "x", "y",
  "z",
];

function walk(node: Node) {
  if (node instanceof HTMLElement) {
    const el = node;
    // Google Docs: <b style="font-weight: normal"> → <span>
    if (el.tagName === "B" && el.style.fontWeight === "normal") {
      const span = document.createElement("span");
      span.append(...el.childNodes);
      el.replaceWith(span);
      walk(span);
    // Google Docs: <span style="font-weight: 700"> → <strong>
    } else if (parseInt(el.style.fontWeight) >= 700) {
      const strong = document.createElement("strong");
      strong.append(...el.childNodes);
      el.replaceWith(strong);
      walk(strong);
    // MS Office: <p class="MsoTitle"> → <h1>
    } else if (el.className.startsWith("MsoTitle")) {
      const heading = document.createElement("h1");
      heading.append(...el.childNodes);
      el.replaceWith(heading);
      walk(heading);
    // MS Office: <p class="MsoQuote"> → <blockquote>
    } else if (
      el.className.startsWith("MsoIntenseQuote") ||
      el.className.startsWith("MsoQuote")
    ) {
      const quote = document.createElement("blockquote");
      quote.append(...el.childNodes);
      el.replaceWith(quote);
      walk(quote);
    // MS Office: <o:p> → remove
    } else if (el.tagName.toLowerCase() === "o:p") {
      el.remove();
    // MS Office: <span style="mso-list:ignore"> → remove
    } else if (el.getAttribute("style")?.toLowerCase() === "mso-list:ignore") {
      el.remove();
    }

    // ... (list transformation logic omitted for brevity)

    for (const child of el.childNodes) {
      walk(child);
    }
  }
}

export function makeHtmlSemantic(html: string): string {
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  walk(doc.body);
  return doc.body.innerHTML;
}
```

---

## How It Works

- **Tag Replacement:** Converts non-semantic tags to semantic ones (e.g., `<b>` to `<span>`, `<span style="font-weight: 700">` to `<strong>`, etc.).
- **Class & Style Detection:** Looks for MS Office/Google Docs-specific class names and styles.
- **List Handling:** (See full code) Detects and reconstructs ordered/unordered lists from paragraphs and inline styles.
- **Removes Junk:** Strips out proprietary tags like `<o:p>` and elements with `mso-list:ignore`.

---

## Usage Example

```ts
const dirtyHtml = /* HTML pasted from Google Docs or Word */;
const cleanHtml = makeHtmlSemantic(dirtyHtml);
// Now pass cleanHtml to your editor or parser
```

---

## Framework Usage Examples

### Lexical (React)

Here’s how you can intercept paste events in Lexical and clean up the HTML before it’s inserted:

```ts
import { $getSelection, PASTE_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertDataTransferForRichText } from '@lexical/clipboard';
import { useEffect } from 'react';
import { makeHtmlSemantic as cleanHtmlWithSemantics } from '../utils/makeHtmlSemantic';

export function CleanPastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const pastedHtml = clipboard.getData('text/html');
        const selection = $getSelection();
        if (pastedHtml && selection) {
          const cleanedClipboard = new DataTransfer();
          cleanedClipboard.setData('text/html', cleanHtmlWithSemantics(pastedHtml));
          $insertDataTransferForRichText(cleanedClipboard, selection, editor);
          return true;
        }
        return false;
      },
      2
    );
  }, [editor]);

  return null;
}
```

### Slate (React)

In Slate, you can override the `onPaste` event to preprocess HTML before inserting:

```ts
import { ReactEditor } from 'slate-react';
import { makeHtmlSemantic } from '../utils/makeHtmlSemantic';

function handlePaste(event: React.ClipboardEvent, editor: ReactEditor) {
  const html = event.clipboardData.getData('text/html');
  if (html) {
    event.preventDefault();
    const cleanHtml = makeHtmlSemantic(html);
    // Use your favorite HTML-to-Slate conversion here
    const fragment = deserializeHtmlToSlate(cleanHtml);
    editor.insertFragment(fragment);
  }
}

// ...
<Editable onPaste={event => handlePaste(event, editor)} />
```

### ProseMirror

For ProseMirror, you can use a custom paste handler in your plugin:

```js
import { Plugin } from 'prosemirror-state';
import { DOMParser } from 'prosemirror-model';
import { makeHtmlSemantic } from '../utils/makeHtmlSemantic';

const semanticPastePlugin = new Plugin({
  props: {
    handlePaste(view, event, slice) {
      const html = event.clipboardData?.getData('text/html');
      if (html) {
        const cleanHtml = makeHtmlSemantic(html);
        const parser = DOMParser.fromSchema(view.state.schema);
        const dom = document.createElement('div');
        dom.innerHTML = cleanHtml;
        const docFragment = parser.parse(dom);
        const tr = view.state.tr.replaceSelectionWith(docFragment);
        view.dispatch(tr);
        return true;
      }
      return false;
    },
  },
});
```

---

## Tips & Gotchas

- Always sanitize user HTML before inserting it into the DOM (use [DOMPurify](https://github.com/cure53/DOMPurify) or similar).
- This approach is a starting point—expand the function to handle more edge cases as needed.
- Test with real-world pasted content from both Google Docs and MS Office.

---

## Further Reading

- [DOMPurify](https://github.com/cure53/DOMPurify) (sanitize HTML)
- [MDN: Semantic HTML](https://developer.mozilla.org/en-US/docs/Glossary/Semantics)
- [Lexical](https://lexical.dev/), [Slate](https://docs.slatejs.org/), [ProseMirror](https://prosemirror.net/)

---

Cleaning up HTML from Google Docs and Microsoft Office is a pain, but with a little DOM-walking and some targeted replacements, you can make your content pipeline much more robust and accessible. 