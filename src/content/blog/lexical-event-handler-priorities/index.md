---
title: "How Lexical's Event Handler Priorities Solve the Plugin Order Problem"
pubDate: "2025-08-12:15:47.000Z"
description: "Learn how Lexical's priority-based event handling system eliminates the plugin order dependency that plagues Slate and ProseMirror editors."
draft: false
keywords: ["lexical", "event handlers", "priority", "plugin order", "slate", "prosemirror", "rich text editor", "architecture"]
author: "Julian Krispel"
category: "Web Development"
tags: ["lexical", "event-handlers", "priority", "plugin-order", "slate", "prosemirror", "rich-text-editor", "architecture"]
readingTime: "8 min read"
difficulty: "Intermediate"
---

If you've ever built a rich text editor with Slate or ProseMirror, you've likely encountered the **plugin order problem**: the order in which you register plugins determines which event handlers get called first, and this can lead to unpredictable behavior and hard-to-debug issues.

Lexical solves this problem elegantly with its **priority-based event handling system**. Instead of relying on plugin registration order, you explicitly define the priority of your event handlers, giving you precise control over execution order.

---

## The Plugin Order Problem

### In Slate and ProseMirror

Both Slate and ProseMirror process event handlers in the order they're registered. This creates several issues:

**Slate Example:**
```tsx
const editor = useMemo(() => {
  const e = withReact(createEditor());
  
  // Plugin A registers first
  const { insertText } = e;
  e.insertText = (text) => {
    if (text === '@') {
      // Handle mention
      return;
    }
    insertText(text);
  };
  
  // Plugin B registers second - this will override Plugin A!
  const { insertText: originalInsertText } = e;
  e.insertText = (text) => {
    if (text === '#') {
      // Handle hashtag
      return;
    }
    originalInsertText(text);
  };
  
  return e;
}, []);
```

**ProseMirror Example:**
```ts
const state = EditorState.create({
  schema,
  plugins: [
    // Plugin A - might get overridden
    keymap({
      '@': (state, dispatch) => {
        // Handle mention
        return true;
      }
    }),
    // Plugin B - might override Plugin A
    keymap({
      '@': (state, dispatch) => {
        // Different mention handling
        return true;
      }
    })
  ]
});
```

The problem is clear: **the last plugin to register wins**, regardless of which behavior you actually want.

---

## Lexical's Priority-Based Solution

Lexical introduces a **priority system** that decouples execution order from registration order. When you register a command handler, you specify a priority level:

```tsx
import { 
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW 
} from 'lexical';

// High priority handler
editor.registerCommand(
  KEY_ENTER_COMMAND,
  (event) => {
    // Handle enter key
    return true; // Stop propagation
  },
  COMMAND_PRIORITY_CRITICAL
);

// Lower priority handler
editor.registerCommand(
  KEY_ENTER_COMMAND,
  (event) => {
    // This runs only if higher priority handlers don't handle it
    return false; // Continue propagation
  },
  COMMAND_PRIORITY_LOW
);
```

---

## Priority Levels Explained

Lexical provides several priority constants:

### `COMMAND_PRIORITY_CRITICAL` (0)
- **Highest priority** - runs first
- Use for essential functionality that must always execute
- Examples: table navigation, core editor behavior

### `COMMAND_PRIORITY_EDITOR` (1)
- **High priority** - runs early
- Use for important editor features
- Examples: formatting commands, selection handling

### `COMMAND_PRIORITY_LOW` (2)
- **Low priority** - runs later
- Use for optional features and enhancements
- Examples: analytics, logging, non-critical UI updates

### Custom Priorities
You can also use custom numbers for fine-grained control:
```tsx
editor.registerCommand(
  MY_CUSTOM_COMMAND,
  handler,
  1.5 // Between CRITICAL and EDITOR
);
```

---

## Real-World Examples

### 1. Table Navigation with Priority

In Lexical's table plugin, cell navigation uses `COMMAND_PRIORITY_CRITICAL` to ensure it always takes precedence:

```tsx
// From Lexical's table selection helpers
editor.registerCommand(
  KEY_TAB_COMMAND,
  (event) => {
    const { shiftKey } = event;
    const isBackward = shiftKey;
    
    // Navigate to next/previous cell
    const didNavigate = navigateTable(
      editor,
      isBackward ? 'backward' : 'forward'
    );
    
    if (didNavigate) {
      event.preventDefault();
      return true; // Stop other handlers
    }
    
    return false; // Let other handlers try
  },
  COMMAND_PRIORITY_CRITICAL // Highest priority
);
```

### 2. Custom Backspace Behavior

Here's how you'd implement custom backspace behavior with proper priority:

```tsx
function CustomBackspacePlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!selection) return false;
        
        // Check if we're in an empty list item
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        
        if (anchorNode.getType() === 'listitem' && 
            anchorNode.getTextContent().length === 0) {
          // Lift the list item up one level
          $liftListItem(editor);
          return true; // Handle the backspace
        }
        
        return false; // Let default behavior handle it
      },
      COMMAND_PRIORITY_EDITOR // High priority but not critical
    );
  }, [editor]);
  
  return null;
}
```

### 3. Paste Handler with Priority

```tsx
function CustomPastePlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;
        
        const html = clipboard.getData('text/html');
        if (html && html.includes('special-content')) {
          // Handle special paste content
          handleSpecialPaste(editor, html);
          return true; // Stop other paste handlers
        }
        
        return false; // Let default paste handler try
      },
      COMMAND_PRIORITY_LOW // Let default handlers try first
    );
  }, [editor]);
  
  return null;
}
```

---

## Comparison: Before and After

### The Old Way (Plugin Order Dependent)

```tsx
// ❌ Order matters - last plugin wins
const editor = useMemo(() => {
  const e = withReact(createEditor());
  
  // Plugin A
  const { insertText } = e;
  e.insertText = (text) => {
    if (text === '@') {
      showMentionMenu();
      return;
    }
    insertText(text);
  };
  
  // Plugin B - OVERRIDES Plugin A!
  const { insertText: originalInsertText } = e;
  e.insertText = (text) => {
    if (text === '@') {
      showDifferentMentionMenu(); // This wins
      return;
    }
    originalInsertText(text);
  };
  
  return e;
}, []);
```

### The Lexical Way (Priority-Based)

```tsx
// ✅ Priority determines execution order
function PluginA() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerCommand(
      INSERT_TEXT_COMMAND,
      (text) => {
        if (text === '@') {
          showMentionMenu();
          return true; // Handle it
        }
        return false; // Let others try
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  
  return null;
}

function PluginB() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerCommand(
      INSERT_TEXT_COMMAND,
      (text) => {
        if (text === '@') {
          showDifferentMentionMenu();
          return true; // Handle it
        }
        return false; // Let others try
      },
      COMMAND_PRIORITY_LOW // Lower priority - runs after Plugin A
    );
  }, [editor]);
  
  return null;
}
```

---

## Benefits of Lexical's Approach

### 1. **Predictable Behavior**
- Execution order is explicit and controlled
- No surprises from plugin registration order
- Easy to reason about and debug

### 2. **Better Composability**
- Plugins can be added in any order
- No need to carefully sequence plugin registration
- Easier to build modular editor features

### 3. **Fine-Grained Control**
- Choose exactly when your handler runs
- Balance between functionality and performance
- Handle conflicts gracefully

### 4. **Better Testing**
- Test handlers in isolation
- Predictable execution order
- Easier to mock and stub

---

## Best Practices

### 1. **Use Appropriate Priorities**
```tsx
// Critical: Core functionality that must always work
COMMAND_PRIORITY_CRITICAL

// Editor: Important features
COMMAND_PRIORITY_EDITOR

// Low: Optional enhancements
COMMAND_PRIORITY_LOW
```

### 2. **Return Values Matter**
```tsx
editor.registerCommand(
  MY_COMMAND,
  (payload) => {
    if (shouldHandle(payload)) {
      handleIt(payload);
      return true; // Stop propagation
    }
    return false; // Let others try
  },
  priority
);
```

### 3. **Clean Up Listeners**
```tsx
useEffect(() => {
  const removeListener = editor.registerCommand(
    MY_COMMAND,
    handler,
    priority
  );
  
  return removeListener; // Clean up on unmount
}, [editor]);
```

---

## Migration Guide

If you're coming from Slate or ProseMirror, here's how to think about priorities:

### From Slate
```tsx
// Old Slate way
const editor = useMemo(() => {
  const e = withReact(createEditor());
  // Plugin order matters
  return e;
}, []);

// New Lexical way
function MyPlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerCommand(
      COMMAND,
      handler,
      COMMAND_PRIORITY_EDITOR // Explicit priority
    );
  }, [editor]);
  
  return null;
}
```

### From ProseMirror
```ts
// Old ProseMirror way
const plugins = [
  keymap({...}), // Order matters
  keymap({...}), // This might override the above
];

// New Lexical way
function MyPlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerCommand(
      COMMAND,
      handler,
      COMMAND_PRIORITY_EDITOR // Explicit priority
    );
  }, [editor]);
  
  return null;
}
```

---

## Conclusion

Lexical's priority-based event handling system eliminates one of the most frustrating aspects of building rich text editors: the plugin order problem. By making execution order explicit through priorities, Lexical provides:

- **Predictable behavior** regardless of plugin registration order
- **Better composability** for modular editor features
- **Fine-grained control** over when handlers execute
- **Easier debugging** and testing

This architectural decision makes Lexical particularly well-suited for complex, extensible editors where multiple plugins need to handle the same events in a coordinated way.

The next time you're building a rich text editor and find yourself wrestling with plugin order issues, consider how Lexical's priority system could simplify your architecture.

---

## Resources

- [Lexical Commands Documentation](https://lexical.dev/docs/concepts/commands)
- [Lexical Priority Constants](https://github.com/facebook/lexical/blob/main/packages/lexical/src/LexicalCommands.ts)
- [Lexical Table Plugin Example](https://github.com/facebook/lexical/blob/main/packages/lexical-table/src/LexicalTableSelectionHelpers.ts)
- [Slate Plugin System](https://docs.slatejs.org/concepts/plugins)
- [ProseMirror Plugin System](https://prosemirror.net/docs/guide/#plugins)
