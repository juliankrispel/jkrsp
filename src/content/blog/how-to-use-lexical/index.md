---
title: Getting Started with Lexical
pubDate: "2025-06-11T00:00:00.000Z"
description: Getting Started with Lexical - A Beginner's Guide
draft: false
---

Lexical is a powerful, extensible text editor framework developed by Meta, designed for performance, reliability, and flexibility. If you're looking to build a rich text editor in your React application, Lexical provides a modern, modular approach that's easy to integrate and customize.

In this post, we'll walk through the basics of setting up Lexical with React, using the `lexical` and `@lexical/react` packages, and show you how to create a simple, extensible rich text editor.

---

## Why Lexical?

- **Performance:** Lexical is built for speed, even with large documents.
- **Extensibility:** Easily add plugins and custom nodes.
- **Accessibility:** Designed with accessibility in mind.
- **React Integration:** First-class support for React.

---

## Setting Up Your Project

First, install the necessary packages:

```bash
npm install lexical @lexical/react
```

Or, if you're using Yarn:

```bash
yarn add lexical @lexical/react
```

---

## Creating a Basic Editor

Let's look at a minimal example, inspired by the `examples/react-rich` demo in the Lexical repo.

```jsx
import React from 'react';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';

// Optional: Your custom theme and plugins
import ExampleTheme from './ExampleTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';

const placeholder = 'Enter some rich text...';

const editorConfig = {
  namespace: 'React.js Demo',
  theme: ExampleTheme,
  onError(error) {
    throw error;
  },
  // Add custom nodes if needed
  nodes: [],
};

export default function App() {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="editor-placeholder">{placeholder}</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <TreeViewPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
```

---

## Key Components

- **LexicalComposer:** The root provider for your editor, takes an `initialConfig` object.
- **RichTextPlugin:** Handles the main editing area, including content editable and placeholder.
- **ContentEditable:** The actual editable div.
- **HistoryPlugin:** Adds undo/redo support.
- **AutoFocusPlugin:** Focuses the editor on mount.
- **ToolbarPlugin, TreeViewPlugin:** Example custom plugins for toolbar and document tree view.

---

## Customization

Lexical is highly customizable. You can:

- **Add Plugins:** Create your own plugins for features like toolbars, markdown, collaboration, etc.
- **Define Custom Nodes:** Extend the editor with new node types (e.g., tables, mentions).
- **Style the Editor:** Use your own themes and CSS.

---

## Next Steps

- Explore the [Lexical documentation](https://lexical.dev/docs) for more advanced features.
- Check out the `examples/` directory in the Lexical repo for real-world usage.
- Try building your own plugins and custom nodes!

---

Lexical makes it easy to build a modern, performant, and accessible rich text editor in React. With its modular architecture and React-first approach, you can start simple and scale up to complex editing experiences.

Happy editing!

---

## Using Lexical with Other Frameworks

While Lexical is designed with React in mind, its core editor can be used with other frameworks or even plain JavaScript. Here are some quick examples:

### Vanilla JavaScript

You can use Lexical's core API to create an editor without any framework:

```js
import { createEditor } from 'lexical';

const editor = createEditor();
const editableDiv = document.getElementById('editor');

// Listen for updates
editor.registerUpdateListener(({editorState}) => {
  // Handle editor state changes
  const json = editorState.toJSON();
  console.log(json);
});

// Set initial content
editor.setEditorState(editor.parseEditorState('<p>Hello, Lexical!</p>'));

// Attach to DOM (you'll need to handle rendering and events)
// See https://lexical.dev/docs/standalone for more details
```

### Vue

There are community projects and wrappers for Vue. One example is [lexical-vue](https://github.com/lexical-vue/lexical-vue):

```vue
<script setup>
import { LexicalComposer, RichTextPlugin } from 'lexical-vue';

const config = {
  namespace: 'VueDemo',
  theme: {},
  onError: (e) => { throw e; },
};
</script>

<template>
  <LexicalComposer :initialConfig="config">
    <RichTextPlugin />
  </LexicalComposer>
</template>
```

### Svelte

You can use Lexical's core API directly in Svelte components. For more advanced integration, check out [svelte-lexical](https://github.com/lexical-svelte/svelte-lexical):

```svelte
<script>
  import { onMount } from 'svelte';
  import { createEditor } from 'lexical';
  let editor;
  onMount(() => {
    editor = createEditor();
    // Set up listeners, state, etc.
  });
</script>

<div id="editor" contenteditable="true"></div>
```

---

For more, see:
- [Lexical Standalone Guide](https://lexical.dev/docs/standalone)
- [lexical-vue on GitHub](https://github.com/lexical-vue/lexical-vue)
- [svelte-lexical on GitHub](https://github.com/lexical-svelte/svelte-lexical)

Lexical's modular core makes it possible to build editors in any environment. If you're using a different framework, check for community wrappers or use the core API directly!