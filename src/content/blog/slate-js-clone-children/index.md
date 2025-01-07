---
title: Slate js Tip - Deep clone nodes recursively
pubDate: "2021-04-23T13:00:00.284Z"
description: Slate js Tip - Deep clone nodes recursively
image: molecules.jpg
draft: false
---

When duplicating one or more nodes inside a document (In my case I needed this for a custom implementation of dragging content from one point to another), you must deep-clone the nodes before inserting them (via `Tranform.insertNodes` for example).

Slate.js relies on [object equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness) to assign keys to tree nodes. Having two nodes with the same key in the tree will likely cause exceptions for any operations that follow.

To prevent this, we must create new instances for every node and descendant node in a list of nodes.

Here's a simple function for recursively cloning a list of slate nodes:

```tsx
import { Descendant, Element } from "slate";

export function cloneChildren(children: Descendant[]): Descendant[] {
  return children.map((node) => {
    if (Element.isElement(node)) {
      return {
        ...node,
        children: cloneChildren(node.children),
      };
    }

    return { ...node };
  });
}
```

That is pretty much all you need. Now you can duplicate nodes safely.

```tsx
// editor.fragment() returns the list of nodes associated with the current selection
const frag = editor.fragment() 
editor.insertFragment(cloneChildren(frag))
```

💡 If you're already using lodash, you could use their [cloneDeep method](https://lodash.com/docs/4.17.15#cloneDeep) instead, which is a more general solution and applies to any javascript object (even special objects like buffers, symbols or typed arrays).
