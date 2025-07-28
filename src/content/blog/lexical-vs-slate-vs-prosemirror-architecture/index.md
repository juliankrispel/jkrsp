---
title: "Lexical vs Slate vs ProseMirror: Architecture Comparison Guide"
pubDate: "2025-07-03T00:00:00.000Z"
description: "Compare Lexical, Slate, and ProseMirror architectures for rich text editors. Analysis of document models, extensibility, performance, and real-world code examples to help you choose the right framework."
draft: true
keywords: ["lexical", "slate", "prosemirror", "rich text editor", "architecture", "comparison", "javascript", "typescript", "react", "document model"]
author: "Julian Krispel"
category: "Web Development"
tags: ["lexical", "slate", "prosemirror", "rich-text-editor", "architecture", "javascript", "typescript", "react", "comparison"]
readingTime: "15 min read"
difficulty: "Advanced"
---

# Lexical vs Slate vs ProseMirror - An Architectural Comparison

If you're building a rich text editor in JavaScript, you've likely come across Lexical, Slate, and ProseMirror. Each framework takes a unique approach to document modeling, extensibility, and integration. This post breaks down their core architectures, strengths, and trade-offs to help you choose the right tool for your next project.

---

## TL;DR Table

| Feature/Aspect         | Lexical                | Slate                  | ProseMirror           |
|-----------------------|------------------------|------------------------|-----------------------|
| **Core Model**        | Immutable tree         | Mutable tree           | Mutable tree + schema |
| **Extensibility**     | Plugins, custom nodes  | Plugins, custom nodes  | Plugins, custom nodes |
| **Schema**            | Optional, flexible     | No enforced schema     | Strong, enforced      |
| **React Integration** | First-class            | First-class            | Community wrappers    |
| **Collab Support**    | Planned, not core      | Community, not core    | Core, Yjs/OT support  |
| **Performance**       | High, optimized        | Good, but less so      | High, but complex     |
| **Learning Curve**    | Moderate               | Low                    | Steep                 |

---

## 1. Document Model & State Management

### Lexical
- Uses an **immutable tree** for editor state (like React state).
- Updates are batched and applied via transactions.
- Encourages functional, predictable updates.
- **Example: Minimal Lexical Editor**

```jsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';

const editorConfig = { namespace: 'Demo', theme: {}, onError: e => { throw e; }, nodes: [] };

<LexicalComposer initialConfig={editorConfig}>
  <RichTextPlugin contentEditable={<ContentEditable />} />
</LexicalComposer>
```
- **Gotcha:** You must use `editor.update(() => { ... })` for all state changes. Direct mutation is not allowed.

### Slate
- Uses a **mutable tree** (array of nodes) for editor state.
- Directly manipulates the value (array of nodes) in React state.
- Simpler, but can lead to accidental mutations.
- **Example: Minimal Slate Editor**

```jsx
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor } from 'slate';

const editor = useMemo(() => withReact(createEditor()), []);
const [value, setValue] = useState([{ children: [{ text: '' }] }]);

<Slate editor={editor} value={value} onChange={setValue}>
  <Editable placeholder="Type..." />
</Slate>
```
- **Gotcha:** Accidentally mutating the value array can cause bugs. Always use `setValue`.

### ProseMirror
- Uses a **mutable tree** with a strong, enforced schema.
- State is managed via transactions and steps (for undo/redo, collab).
- More complex, but powerful for advanced use cases.
- **Example: Minimal ProseMirror Setup**

```js
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { schema } from 'prosemirror-schema-basic';

const state = EditorState.create({ schema });
const view = new EditorView(document.querySelector('#editor'), { state });
```
- **Gotcha:** You must define a schema up front. This can be verbose but enables powerful validation.

---

## 2. Extensibility & Plugins

### Lexical
- Plugins are React components or functions that register listeners, commands, or custom nodes.
- **Example: Registering a Command Plugin**

```js
function MyPlugin() {
  const editor = useLexicalComposerContext()[0];
  useEffect(() => {
    return editor.registerCommand('MY_COMMAND', (payload) => {
      // handle command
      return true;
    }, COMMAND_PRIORITY_EDITOR);
  }, [editor]);
```
- **Real Plugin:** [@lexical/react/LexicalHistoryPlugin](https://lexical.dev/docs/concepts/plugins#historyplugin)

### Slate
- Plugins are functions that enhance the editor object.
- **Example: Simple Slate Plugin**

```js
const withMentions = editor => {
  const { insertText } = editor;
  editor.insertText = text => {
    if (text === '@') {
      // trigger mention logic
    }
    insertText(text);
  };
  return editor;
};
const editor = withMentions(withReact(createEditor()));
```
- **Real Plugin:** [slate-yjs for collaboration](https://github.com/bitphinix/slate-yjs)

### ProseMirror
- Plugins are classes that hook into the editor's lifecycle.
- **Example: ProseMirror Plugin for Word Count**

```js
import { Plugin } from 'prosemirror-state';
const wordCountPlugin = new Plugin({
  view() {
    return {
      update(view) {
        const text = view.state.doc.textContent;
        // update word count UI
      }
    };
  }
});
```
- **Real Plugin:** [prosemirror-menu](https://prosemirror.net/examples/menu/)

---

## 3. Schema & Validation

### Lexical
- Schema is optional. You can define custom nodes, but the core doesn't enforce a document schema.
- **Example: Custom Node**

```js
import { DecoratorNode } from 'lexical';
class MyNode extends DecoratorNode { /* ... */ }
```
- **When to use:** Great for rapid prototyping or when you want flexibility.

### Slate
- No enforced schema. You validate structure in your own code or plugins.
- **Example: Custom Validation**

```js
const isValid = value => value.every(node => node.type !== 'forbidden');
```
- **When to use:** When you want to allow any structure and handle validation yourself.

### ProseMirror
- Strong schema system. Every document must conform to the schema.
- **Example: Defining a Node in Schema**

```js
const mySchema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'text*' },
    // ...
  },
  marks: { bold: {}, italic: {} }
});
```
- **When to use:** When you need strict document structure and validation (e.g., collaborative editing).

---

## 4. React Integration

### Lexical
- Built for React. All core packages have React bindings.
- **Example:** See the minimal Lexical example above.
- **Real Project:** [Lexical Playground](https://playground.lexical.dev/)

### Slate
- Built for React. The editor is a React component.
- **Example:** See the minimal Slate example above.
- **Real Project:** [Editable Markdown Editor](https://github.com/ianstormtaylor/slate/tree/main/site/examples/markdown)

### ProseMirror
- Core is framework-agnostic. Community React wrappers exist.
- **Example: Using prosemirror-react-view**

```js
import { ProseMirror } from 'prosemirror-react-view';
<ProseMirror state={state} dispatchTransaction={...} />
```
- **Real Project:** [TipTap (ProseMirror-based, Vue/React)](https://tiptap.dev/)

---

## 5. Collaboration & Real-time Editing

### Lexical
- Collaboration is planned, but not core yet. Some community efforts exist.
- **Example:** [lexical-collaboration](https://github.com/lexical-collaboration/lexical-collaboration)

### Slate
- No official collab, but community plugins (e.g., Yjs) exist.
- **Example:** [slate-yjs](https://github.com/bitphinix/slate-yjs)

### ProseMirror
- Collaboration is a first-class feature, with official plugins for Yjs and operational transform (OT).
- **Example:** [prosemirror-collab](https://prosemirror.net/examples/collab/)

---

## 6. Performance

### Lexical
- Highly optimized for large documents and frequent updates. Uses immutability for efficient change detection.
- **Example:** Handles 100k+ word docs smoothly in the [Lexical Playground](https://playground.lexical.dev/).

### Slate
- Good for most use cases, but can slow down with very large documents.
- **Tip:** Use `React.memo` and optimize rendering for large docs.

### ProseMirror
- High performance, but complexity can make optimization harder.
- **Example:** Used in [Atlassian Confluence](https://www.atlassian.com/software/confluence) for large-scale collaborative editing.

---

## 7. Learning Curve & Ecosystem

- **Lexical:** Moderate. Modern API, and as of 2025, the plugin ecosystem has grown rapidly. There are now robust official and community plugins for most common editor features (tables, markdown, collaboration, mentions, images, etc.), as well as integrations for frameworks beyond React. While ProseMirror still has the largest and most mature ecosystem for highly specialized or legacy plugins, Lexical's community is active and covers most modern use cases.
  - **Example Plugin:** [lexical-table](https://github.com/facebook/lexical/tree/main/packages/lexical-table)
- **Slate:** Easiest to get started with. Lots of tutorials, but less structure for large apps.
  - **Example Plugin:** [slate-plugins-next](https://github.com/udecode/slate-plugins)
- **ProseMirror:** Steep learning curve, but extremely powerful and flexible for advanced editors.
  - **Example Plugin:** [prosemirror-tables](https://github.com/ProseMirror/prosemirror-tables)

---

## Resources

- [Lexical Documentation](https://lexical.dev/docs)
- [Slate Documentation](https://docs.slatejs.org/)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Lexical GitHub](https://github.com/facebook/lexical)
- [Slate GitHub](https://github.com/ianstormtaylor/slate)
- [ProseMirror GitHub](https://github.com/ProseMirror/prosemirror)

---

## Conclusion

- **Lexical** is great for modern, high-performance React apps needing flexibility and future-proofing.
- **Slate** is ideal for simple to moderately complex editors, especially if you want a gentle learning curve.
- **ProseMirror** is best for advanced, collaborative, or highly structured editors where schema and extensibility are critical.

Choose the tool that fits your needs, and happy editing! 