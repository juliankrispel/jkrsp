---
title: Understanding Lexical Selections - A Deep Dive into the Most Unique Selection System in Rich Text Editors
pubDate: "2025-08-15T12:00:00.284Z"
description: Understanding Lexical Selections - A Deep Dive into the Most Unique Selection System in Rich Text Editors
draft: false
---

## Introduction

When it comes to rich text editors, selection handling is often one of the most complex and error-prone aspects. Most editors struggle with maintaining consistent selection state across complex operations, dealing with nested structures, or handling collaborative editing scenarios. Lexical, Facebook's modern rich text editor framework, takes a fundamentally different approach to selections that sets it apart from every other editor on the market.

In this post, we'll explore how Lexical's selection system works, why it's so different from traditional approaches, and how this design enables powerful features that other editors can only dream of.

## The Traditional Selection Problem

Before diving into Lexical's solution, let's understand the problem it solves. Traditional rich text editors typically:

1. **Rely heavily on DOM selection**: They use the browser's native `Selection` and `Range` APIs as the source of truth
2. **Suffer from synchronization issues**: DOM mutations can invalidate selections, leading to lost cursor positions
3. **Struggle with complex operations**: Nested structures, collaborative editing, and undo/redo often break selection state
4. **Have limited selection types**: Most only support text ranges, making it difficult to select complex elements

**Note**: It's important to clarify that not all editors fall into this category. ProseMirror, for example, uses a sophisticated hybrid approach that maintains its own selection state while synchronizing with the DOM, giving it many of the benefits of state-based selection management.

## Lexical's Approach

Lexical flips this model on its head by making selection a **first-class citizen of the editor state**. Instead of being a side effect of DOM operations, selection is stored directly in the `EditorState` alongside the content tree.

### Selection as Editor State

```typescript
// In Lexical, selection is part of the editor state
const selection = $getSelection();
// This returns the current selection from the editor state, not the DOM
```

This simple change has profound implications. Every time the editor state updates, the selection remains consistent with the node tree. No more lost cursors, no more synchronization issues.

## The Four Types of Selection

Lexical supports four distinct selection types, each designed for specific use cases:

### 1. RangeSelection

The most common type, `RangeSelection` normalizes the browser's DOM Selection API into a predictable, consistent format:

```typescript
interface RangeSelection {
  anchor: Point;    // Start point of selection
  focus: Point;     // End point of selection  
  format: number;   // Bitwise flags for text formatting
  style: string;    // CSS styles applied to selection
}
```

Each `Point` contains:
- `key`: The `NodeKey` of the selected Lexical node
- `offset`: Position within the node (character index for text, child index for elements)
- `type`: Either `'text'` or `'element'`

This design allows Lexical to maintain precise selection state even when the DOM changes dramatically.

### 2. NodeSelection

Unlike traditional editors that struggle with selecting multiple arbitrary nodes, Lexical's `NodeSelection` makes this trivial:

```typescript
const nodeSelection = $createNodeSelection();
nodeSelection.add(imageNodeKey);
nodeSelection.add(pollNodeKey);
nodeSelection.add(videoNodeKey);
$setSelection(nodeSelection);
```

This enables powerful features like multi-select for images, polls, or any custom nodes - something that's nearly impossible in other editors.

### 3. TableSelection

Tables present unique selection challenges. Lexical's `TableSelection` handles grid-like selections with ease:

```typescript
interface TableSelection {
  tableKey: NodeKey;  // Parent table node
  anchor: Point;      // Starting cell
  focus: Point;       // Ending cell
}
```

This allows for intuitive table cell selection, copying, and manipulation that feels natural to users.

### 4. null Selection

When no selection is active (editor blurred, focus moved elsewhere), Lexical explicitly represents this as `null` rather than an undefined state.

## Working with Selections

### Getting the Current Selection

```typescript
import {$getSelection, SELECTION_CHANGE_COMMAND} from 'lexical';

// Within an editor update
editor.update(() => {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    console.log('Text selection from', selection.anchor.offset, 'to', selection.focus.offset);
  }
});

// In a command listener
editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
  const selection = $getSelection();
  // Handle selection change
  return false;
});
```

### Creating and Setting Selections

```typescript
import {$setSelection, $createRangeSelection, $createNodeSelection} from 'lexical';

editor.update(() => {
  // Create a range selection
  const rangeSelection = $createRangeSelection();
  rangeSelection.anchor.set(textNodeKey, 5, 'text');
  rangeSelection.focus.set(textNodeKey, 10, 'text');
  $setSelection(rangeSelection);
  
  // Create a node selection
  const nodeSelection = $createNodeSelection();
  nodeSelection.add(imageNodeKey);
  $setSelection(nodeSelection);
  
  // Clear selection
  $setSelection(null);
});
```

### Node-Level Selection Methods

Lexical nodes have built-in selection methods that create appropriate selections:

```typescript
const someNode = $getNodeByKey(someKey);

// Select the entire node
someNode.select();

// Select start/end of node
someNode.selectStart();
someNode.selectEnd();

// Navigate between nodes
someNode.selectPrevious();
someNode.selectNext();
```

## Advanced Selection Features

### Selection Format Tracking

Lexical automatically tracks formatting state within selections:

```typescript
const selection = $getSelection();
if ($isRangeSelection(selection)) {
  // Check if selection has specific formatting
  const isBold = selection.hasFormat('bold');
  const isItalic = selection.hasFormat('italic');
  
  // Apply formatting
  selection.formatText('bold');
  selection.toggleFormat('italic');
}
```

### Selection Utilities

The `@lexical/selection` package provides powerful utilities:

```typescript
import {
  $wrapNodes,
  $setBlocksType,
  $moveCaretSelection,
  $selectAll
} from '@lexical/selection';

// Wrap selected content in a new element
$wrapNodes(selection, () => $createQuoteNode());

// Convert selected blocks to a different type
$setBlocksType(selection, () => $createHeadingNode('h2'));

// Move selection by character, word, or line
$moveCaretSelection(selection, false, false, 'word');

// Select all content
$selectAll(selection);
```

### React Integration

Lexical provides React hooks for working with selections:

```typescript
import {useLexicalNodeSelection} from '@lexical/react';

function MyComponent({nodeKey}) {
  const [isSelected, setSelected, clearSelected] = useLexicalNodeSelection(nodeKey);
  
  return (
    <div 
      className={isSelected ? 'selected' : ''}
      onClick={() => setSelected(!isSelected)}
    >
      Click to select this node
    </div>
  );
}
```

## Designing Custom Selections

While Lexical provides four built-in selection types, the framework is designed to be extensible. You can create custom selection types by implementing the `BaseSelection` interface. This opens up possibilities for specialized selection behaviors that traditional editors could never support.

### The BaseSelection Interface

All selection types in Lexical implement the `BaseSelection` interface:

```typescript
interface BaseSelection {
  _cachedNodes: Array<LexicalNode> | null;
  dirty: boolean;

  clone(): BaseSelection;
  extract(): Array<LexicalNode>;
  getNodes(): Array<LexicalNode>;
  getTextContent(): string;
  insertText(text: string): void;
  insertRawText(text: string): void;
  is(selection: null | BaseSelection): boolean;
  insertNodes(nodes: Array<LexicalNode>): void;
  getStartEndPoints(): null | [PointType, PointType];
  isCollapsed(): boolean;
  isBackward(): boolean;
  getCachedNodes(): LexicalNode[] | null;
  setCachedNodes(nodes: LexicalNode[] | null): void;
}
```

### Creating a Custom Selection

Let's create a custom selection for selecting code blocks with syntax highlighting:

```typescript
import type {BaseSelection, LexicalNode, NodeKey, PointType} from 'lexical';

export class CodeBlockSelection implements BaseSelection {
  _cachedNodes: Array<LexicalNode> | null;
  dirty: boolean;
  language: string;
  startLine: number;
  endLine: number;

  constructor(language: string, startLine: number, endLine: number) {
    this._cachedNodes = null;
    this.dirty = false;
    this.language = language;
    this.startLine = startLine;
    this.endLine = endLine;
  }

  clone(): CodeBlockSelection {
    return new CodeBlockSelection(this.language, this.startLine, this.endLine);
  }

  extract(): Array<LexicalNode> {
    return this.getNodes();
  }

  getNodes(): Array<LexicalNode> {
    if (this._cachedNodes !== null) {
      return this._cachedNodes;
    }

    // Find all code blocks with the specified language
    const nodes: Array<LexicalNode> = [];
    const root = $getRoot();
    
    root.getChildren().forEach((child) => {
      if ($isCodeBlockNode(child) && child.getLanguage() === this.language) {
        const lineNumber = child.getLineNumber();
        if (lineNumber >= this.startLine && lineNumber <= this.endLine) {
          nodes.push(child);
        }
      }
    });

    this._cachedNodes = nodes;
    return nodes;
  }

  getTextContent(): string {
    return this.getNodes()
      .map(node => node.getTextContent())
      .join('\n');
  }

  insertText(text: string): void {
    // Custom logic for inserting text into code blocks
    this.getNodes().forEach(node => {
      if ($isCodeBlockNode(node)) {
        node.append($createTextNode(text));
      }
    });
  }

  insertRawText(text: string): void {
    this.insertText(text);
  }

  is(selection: null | BaseSelection): boolean {
    if (!(selection instanceof CodeBlockSelection)) {
      return false;
    }
    return (
      this.language === selection.language &&
      this.startLine === selection.startLine &&
      this.endLine === selection.endLine
    );
  }

  insertNodes(nodes: Array<LexicalNode>): void {
    // Custom logic for inserting nodes into code blocks
    this.getNodes().forEach(targetNode => {
      if ($isCodeBlockNode(targetNode)) {
        nodes.forEach(node => targetNode.append(node));
      }
    });
  }

  getStartEndPoints(): null | [PointType, PointType] {
    const nodes = this.getNodes();
    if (nodes.length === 0) {
      return null;
    }
    
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];
    
    const startPoint = $createPoint(firstNode.getKey(), 0, 'element');
    const endPoint = $createPoint(lastNode.getKey(), 1, 'element');
    
    return [startPoint, endPoint];
  }

  isCollapsed(): boolean {
    return this.startLine === this.endLine;
  }

  isBackward(): boolean {
    return false; // Code block selections are always forward
  }

  getCachedNodes(): LexicalNode[] | null {
    return this._cachedNodes;
  }

  setCachedNodes(nodes: LexicalNode[] | null): void {
    this._cachedNodes = nodes;
  }

  // Custom methods for code block selection
  getLanguage(): string {
    return this.language;
  }

  getLineRange(): [number, number] {
    return [this.startLine, this.endLine];
  }

  expandToIncludeLine(lineNumber: number): void {
    this.startLine = Math.min(this.startLine, lineNumber);
    this.endLine = Math.max(this.endLine, lineNumber);
    this.dirty = true;
    this._cachedNodes = null;
  }
}
```

### Using Custom Selections

Once you've created a custom selection, you can use it just like the built-in ones:

```typescript
// Create and set a custom selection
const codeSelection = new CodeBlockSelection('javascript', 1, 5);
$setSelection(codeSelection);

// Check if current selection is your custom type
const currentSelection = $getSelection();
if (currentSelection instanceof CodeBlockSelection) {
  console.log('Selected JavaScript lines:', currentSelection.getLineRange());
  console.log('Language:', currentSelection.getLanguage());
}

// Create a helper function to check for your selection type
function $isCodeBlockSelection(selection: null | BaseSelection): selection is CodeBlockSelection {
  return selection instanceof CodeBlockSelection;
}
```

### Extending Existing Selections

You can also extend existing selection types to add custom functionality:

```typescript
export class EnhancedRangeSelection extends RangeSelection {
  private customMetadata: Map<string, any>;

  constructor(anchor: PointType, focus: PointType, format: number) {
    super(anchor, focus, format);
    this.customMetadata = new Map();
  }

  clone(): EnhancedRangeSelection {
    const cloned = new EnhancedRangeSelection(this.anchor, this.focus, this.format);
    cloned.customMetadata = new Map(this.customMetadata);
    return cloned;
  }

  setMetadata(key: string, value: any): void {
    this.customMetadata.set(key, value);
    this.dirty = true;
  }

  getMetadata(key: string): any {
    return this.customMetadata.get(key);
  }

  hasMetadata(key: string): boolean {
    return this.customMetadata.has(key);
  }

  // Override existing methods to add custom behavior
  insertText(text: string): void {
    // Add custom logic before inserting text
    console.log('Inserting text with custom metadata:', this.customMetadata);
    
    // Call the parent implementation
    super.insertText(text);
    
    // Add custom logic after inserting text
    this.setMetadata('lastInsertedText', text);
  }
}
```

### Advanced Custom Selection: Multi-Dimensional Selection

For complex use cases like spreadsheet-like editors, you can create selections that work in multiple dimensions:

```typescript
export class GridSelection implements BaseSelection {
  _cachedNodes: Array<LexicalNode> | null;
  dirty: boolean;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  gridId: string;

  constructor(gridId: string, startRow: number, startCol: number, endRow: number, endCol: number) {
    this._cachedNodes = null;
    this.dirty = false;
    this.gridId = gridId;
    this.startRow = startRow;
    this.startCol = startCol;
    this.endRow = endRow;
    this.endCol = endCol;
  }

  // Implement all BaseSelection methods...
  
  // Custom methods for grid operations
  getSelectedCells(): Array<{row: number, col: number}> {
    const cells: Array<{row: number, col: number}> = [];
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        cells.push({row, col});
      }
    }
    return cells;
  }

  expandToIncludeCell(row: number, col: number): void {
    this.startRow = Math.min(this.startRow, row);
    this.startCol = Math.min(this.startCol, col);
    this.endRow = Math.max(this.endRow, row);
    this.endCol = Math.max(this.endCol, col);
    this.dirty = true;
    this._cachedNodes = null;
  }

  isSingleCell(): boolean {
    return this.startRow === this.endRow && this.startCol === this.endCol;
  }

  getDimensions(): {rows: number, cols: number} {
    return {
      rows: this.endRow - this.startRow + 1,
      cols: this.endCol - this.startCol + 1
    };
  }
}
```

### Best Practices for Custom Selections

1. **Always implement all BaseSelection methods**: Even if some methods don't make sense for your selection type, implement them to maintain compatibility.

2. **Use caching wisely**: The `_cachedNodes` property helps with performance, but make sure to clear it when the selection changes.

3. **Handle edge cases**: Consider what happens when nodes are deleted, moved, or when the selection becomes invalid.

4. **Provide type guards**: Create helper functions to check if a selection is your custom type:

```typescript
export function $isCustomSelection(selection: null | BaseSelection): selection is CustomSelection {
  return selection instanceof CustomSelection;
}
```

5. **Consider serialization**: If you plan to use your custom selection in collaborative editing, make sure it can be serialized and deserialized properly.

6. **Test thoroughly**: Custom selections can interact with other parts of the editor in unexpected ways, so comprehensive testing is essential.

### Real-World Example: Comment Selection

Here's a practical example of a custom selection for handling code comments:

```typescript
export class CommentSelection implements BaseSelection {
  _cachedNodes: Array<LexicalNode> | null;
  dirty: boolean;
  commentId: string;
  threadId: string;
  authorId: string;

  constructor(commentId: string, threadId: string, authorId: string) {
    this._cachedNodes = null;
    this.dirty = false;
    this.commentId = commentId;
    this.threadId = threadId;
    this.authorId = authorId;
  }

  // Implement BaseSelection methods...

  // Custom methods for comment functionality
  getCommentId(): string {
    return this.commentId;
  }

  getThreadId(): string {
    return this.threadId;
  }

  getAuthorId(): string {
    return this.authorId;
  }

  isResolved(): boolean {
    // Check if the comment thread is resolved
    return this.getNodes().every(node => 
      node.hasAttribute('data-comment-resolved')
    );
  }

  resolve(): void {
    this.getNodes().forEach(node => {
      node.setAttribute('data-comment-resolved', 'true');
    });
  }
}
```

## Why This Matters: Real-World Benefits

### 1. Predictable Selection State

Unlike other editors where selections can mysteriously disappear or jump around, Lexical's selection state is always predictable and consistent with the content tree.

### 2. Collaborative Editing

In collaborative scenarios, selection state can be serialized, transmitted, and restored reliably:

```typescript
// Selection state can be easily serialized
const selectionState = {
  type: 'range',
  anchor: {key: 'node-1', offset: 5, type: 'text'},
  focus: {key: 'node-1', offset: 10, type: 'text'}
};
```

### 3. Undo/Redo Perfection

Because selection is part of the editor state, undo/redo operations automatically restore the correct selection state without any additional logic.

### 4. Complex Operations

Operations that would break selections in other editors work seamlessly in Lexical:

```typescript
// This complex operation maintains selection state
editor.update(() => {
  const selection = $getSelection();
  // Perform complex DOM manipulation
  // Selection automatically updates to remain valid
});
```

### 5. Custom Node Selection

Creating selectable custom nodes is trivial:

```typescript
class MyCustomNode extends ElementNode {
  select() {
    const selection = $createRangeSelection();
    selection.anchor.set(this.getKey(), 0, 'element');
    selection.focus.set(this.getKey(), 1, 'element');
    $setSelection(selection);
  }
}
```

## Performance Considerations

Lexical's selection system is designed for performance:

- **Lazy evaluation**: Selection state is computed on-demand
- **Caching**: Selected nodes are cached to avoid repeated traversal
- **Minimal DOM updates**: Selection changes are batched and optimized

## Comparison with Other Editors

| Feature | Lexical | Draft.js | Slate.js | ProseMirror |
|---------|---------|----------|----------|-------------|
| Selection in Editor State | ✅ | ❌ | ✅ | ✅ |
| Node Selection | ✅ | ❌ | ✅ | ✅ |
| Table Selection | ✅ | ❌ | ❌ | ✅ |
| Custom Selection Types | ✅ | ❌ | ❌ | ✅ |
| Selection Serialization | ✅ | ❌ | ✅ | ✅ |
| Collaborative Selection | ✅ | ❌ | ✅ | ✅ |

### How Different Editors Handle Selection

#### Lexical
Lexical makes selection a first-class citizen of the editor state, storing it directly alongside the content tree. This provides the most predictable and consistent selection behavior.

#### ProseMirror
ProseMirror uses a sophisticated hybrid approach that combines native DOM selection with its own internal selection tracking system. It maintains selection state in `EditorState` through a hierarchy of Selection classes (TextSelection, NodeSelection, AllSelection, GapSelection) while constantly synchronizing with the DOM. This gives ProseMirror many of the benefits of state-based selection management while maintaining compatibility with native browser behavior.

#### Slate.js
Slate stores selection in its editor state but relies more heavily on DOM selection for certain operations. It provides good selection serialization and collaborative editing support.

#### Draft.js
Draft.js primarily relies on DOM selection and doesn't maintain comprehensive selection state in its editor state, which can lead to the synchronization issues mentioned earlier.

## Conclusion

Lexical's selection system represents a fundamental rethinking of how rich text editors should handle selection state. By making selection a first-class citizen of the editor state rather than a side effect of DOM operations, Lexical achieves levels of reliability, predictability, and functionality that are among the best in the industry.

It's worth noting that other editors like ProseMirror have also solved many of these problems through different architectural approaches - ProseMirror's hybrid DOM/state synchronization system provides similar benefits through a different mechanism.

The extensibility of the selection system through custom implementations of `BaseSelection` opens up possibilities that were previously impossible in rich text editors. Whether you need specialized selections for code blocks, spreadsheets, collaborative commenting, or any other complex use case, Lexical provides the foundation to build exactly what you need.

This design enables powerful features like:
- Perfect undo/redo with selection restoration
- Reliable collaborative editing
- Complex multi-node selections
- Custom selectable elements
- Predictable selection behavior across all operations
- Extensible selection types for specialized use cases

For developers building rich text applications, Lexical's selection system offers a compelling approach to selection management. The mental model is clean and straightforward, the behavior is highly predictable, and the extensibility opens up many possibilities.

The selection system exemplifies Lexical's philosophy: instead of fighting the browser's limitations, create a better abstraction that works reliably across all scenarios. It's a lesson in how thoughtful architecture can transform a complex problem into an elegant solution.

---

*This post explored just one aspect of Lexical's innovative design. The framework's approach to nodes, commands, collaboration, and more all follow similar principles of making complex problems simple through better abstractions.*