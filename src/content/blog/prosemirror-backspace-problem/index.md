---
title: "Fix ProseMirror Backspace Issues: Custom Keymap Handling Guide"
pubDate: "2025-07-28T12:00:00.284Z"
image: backspace.png
description: "Learn how to fix ProseMirror's confusing backspace behavior in lists and paragraphs. Guide with code examples, npm package, and real-world solutions for rich text editors."
draft: false
keywords: ["prosemirror", "backspace", "rich text editor", "keymap", "lists", "tiptap", "remirror", "javascript", "typescript"]
author: "Julian Krispel"
category: "Web Development"
tags: ["prosemirror", "rich-text-editor", "javascript", "typescript", "npm", "tutorial"]
readingTime: "8 min read"
difficulty: "Intermediate"
---

tldr; I published an npm package for better default backspace handling
- [*prosemirror-better-backspace* on npm](https://www.npmjs.com/package/prosemirror-better-backspace)
- [*prosemirror-better-backspace* on github](https://github.com/juliankrispel/prosemirror-better-backspace)

## Introduction

ProseMirror is a popular choice among rich text editor frameworks. It's modular, extensible, and widely used. However, like the other two big rich text editing frameworks, it has it's quirks. One of the most common pain points developers encounter is implementing a better UX for backspace, as prosemirrors default is utterly confusing, especially when lists are involved. 

## Real-World Problems

This issue has been widely discussed in the developer community across multiple ProseMirror project, including remirror and the highly popular [tiptap](https://tiptap.dev/)

- **[TipTap Issue #2493](https://github.com/ueberdosis/tiptap/issues/2493)**: Backspace on parent items in nested lists doesn't work properly - when trying to delete content in nested bullet structures, the parent item disappears but nothing else happens
- **[TipTap Issue #3367](https://github.com/ueberdosis/tiptap/issues/3367)**: Backspace doesn't work properly - pressing backspace at the start of a paragraph after a bullet list converts the paragraph into a bullet list, and removing bullet lists with backspace only deletes the bullet mark but keeps the list active
- **[TipTap Issue #3128](https://github.com/ueberdosis/tiptap/issues/3128)**: "Bulleted List Limbo" - when backspacing on empty list items, users get stuck in a confusing state where they think they've exited the list but haven't
- **[TipTap Issue #1311](https://github.com/ueberdosis/tiptap/issues/1311)**: Backspace behavior in lists is inconsistent and doesn't match user expectations
- **[ProseMirror Issue #370](https://github.com/ProseMirror/prosemirror/issues/370)**: Backspace after list items doesn't behave as expected
- **[ProseMirror Discussion #4229](https://discuss.prosemirror.net/t/backspace-after-list/4229)**: Extended discussion about backspace behavior after list items
- **[ProseMirror Discussion #3784](https://discuss.prosemirror.net/t/backspace-inside-empty-paragraph-creates-a-new-list-node/3784)**: Backspace inside empty paragraphs creates unwanted list nodes
- **[Remirror Issue #1264](https://github.com/remirror/remirror/issues/1264)**: Custom backspace handlers being overridden by list extensions

## My expectations as a user

Judging from what my clients and their customers often converge on, here is what I believe users expect:

1. **Empty List Items**: When backspacing on an empty list item, users expect the item to be lifted up one level or converted to a paragraph
2. **Empty Paragraphs**: When backspacing on an empty paragraph, users expect it to merge with the previous text container, which could be inside a list item or any other text-containing element of your choosing.
3. **Plugin Priority**: Order matters. Custom keymap handlers often get overridden by other extensions

## The Technical Challenge

### Plugin Order Matters

In ProseMirror, keymap plugins are processed in the order they're added to the editor. This means that if other extensions add their own keymap handlers after your custom plugin, your handlers will never be called.

```typescript
// This approach often fails when other plugins are present
const state = EditorState.create({
  schema,
  plugins: [
    createBackspacePlugin(schema), // Your custom plugin
    // ... other plugins
    // Other extensions' plugins are added here and override yours
  ],
});
```

### The Extension Integration Challenge

When working with ProseMirror extensions, the challenge is even more complex because:

1. **Extension Systems**: Many extensions use their own plugin systems that wrap ProseMirror plugins
2. **List Extensions**: List extensions have their own backspace handlers
3. **Plugin Priority**: Extensions often have higher priority than custom plugins

## My Solution

I developed a custom backspace plugin that handles these edge cases:

```typescript
export function createBackspacePlugin(schema: Schema): Plugin {
  return keymap({
    Backspace: (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
      const { $from, empty } = state.selection;
      
      // Handle empty list items
      if (isInListItem($from)) {
        liftListItem(schema.nodes.list_item)(state, dispatch);
        return true;
      }
      
      // Handle empty paragraphs
      if (isEmptyParagraph($from)) {
        mergeWithPreviousContainer(state, dispatch);
        return true;
      }
      
      return false;
    },
  });
}
```


### Key Features

1. **List Item Lifting**: Automatically lifts empty list items up one level
2. **Paragraph Merging**: Merges empty paragraphs with previous text containers, whatever their parent elements may be
3. **Smart Detection**: Only triggers on specific conditions to avoid interfering with normal typing

## Integration Challenges

### Extension System Integration

The main challenge when integrating with ProseMirror extensions is that their extension systems require proper implementation of abstract methods:

```typescript
class BackspaceExtension extends Extension {
  get name() {
    return 'backspace' as const;
  }

  createProsemirrorPlugins() {
    return [createBackspacePlugin(this.store.schema)];
  }

  // Required abstract member implementation
  get [Symbol.for('__INTERNAL_REMIRROR_IDENTIFIER_KEY__')]() {
    return this.name;
  }
}
```

These interfaces can look very different depending on the framework you use (I have seen hand-rolled ones too)

### Plugin Priority Issues

Even with proper extension implementation, plugin priority remains a challenge, make sure you pay attention to that in order to avoid any bugs, the backspace extension needs to come first.

```typescript
// This doesn't always work because list extensions
// might still override your custom handlers
extensions: () => [
  new BackspaceExtension(), // Your custom extension
  new ListItemExtension(),  // List extension
  new BulletListExtension(),
],
```

## Alternative Approaches

### 1. Direct Keymap Handling

Some developers bypass the keymap system entirely:

```typescript
return new Plugin({
  props: {
    handleKeyDown: (view, event) => {
      if (event.key === 'Backspace') {
        // Custom backspace logic
        return true;
      }
      return false;
    }
  }
});
```

### 2. Plugin Key Approach

Using a PluginKey for better control:

```typescript
const backspaceKey = new PluginKey('custom-backspace');
return new Plugin({
  key: backspaceKey,
  // ... plugin implementation
});
```

### 3. Extension-Specific Solutions

For ProseMirror extensions, you could create custom extensions that properly integrate with the extension's plugin system, although that's at least a whole other blogpost

## Best Practices

1. **Test Early**: Always test custom keymap handlers in the context of your full editor setup
2. **Plugin Order**: Be aware of plugin processing order and plan accordingly
3. **Extension Integration**: When using ProseMirror extensions, understand their extension system
4. **Fallback Handling**: Provide fallback behavior when custom handlers don't trigger
5. **Debugging**: Add extensive logging to understand when and why handlers are called

All in all, the ProseMirror backspace problem seems to currently be a well documented but kind of unsolved issue that affects many developers building rich text editors, especially when users demand a more standard behaviour. While the core ProseMirror framework provides excellent extensibility, integrating custom keymap handlers with extensions requires careful consideration of plugin priority, extension systems, and framework-specific constraints.

Both the ProseMirror plugin system and the specific extension's architecture. By properly implementing custom extensions and being aware of plugin processing order, you can create intuitive backspace behavior for your users.

## References

- [ProseMirror Keymap Documentation](https://prosemirror.net/docs/ref/#keymap)
- [ProseMirror Plugin System](https://prosemirror.net/docs/ref/#state.Plugin)
- [ProseMirror Discussion Forum](https://discuss.prosemirror.net/)
- [ProseMirror GitHub Issues](https://github.com/ProseMirror/prosemirror/issues)
- [prosemirror-better-backspace](https://www.npmjs.com/package/prosemirror-better-backspace) - A dedicated plugin for enhanced backspace behavior