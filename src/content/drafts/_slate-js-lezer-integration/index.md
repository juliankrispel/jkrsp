---
title: Slate js syntax highlighting with lezer
pubDate: "2021-05-28T10:00:00.284Z"
description: How to integrate slate js and lezer based parsers for syntax highlighting and other fun stuffs
draft: true
---

In this blogpost I'm documenting my steps integrating slate js with built with lezer parser generator. We'll be building a syntax highlighting feature that supports JSON for the start

### Let's get started 🎉

First, I'm cloning my slate-js boilerplate as a starter and add the lezzer json parser to it

```
git clone git@github.com:juliankrispel/slate-js-boilerplate.git
yarn add @lezzer/json
```


At `src/components/MyEditor.tsx` you'll find a React component that called Editor, that looks like this:

```tsx
export function MyEditor()  {
  const editor = useMemo<ReactEditor>(
    () => withHistory(withReact(createEditor() as ReactEditor)),
    []
  );

  const [value, setValue] = useState<Node[]>([
    {
      children: [{
        text: ""
      }], 
    },
  ]);

  return <Slate editor={editor} onChange={setValue} value={value}>
    <Editable placeholder="Write something..." autoFocus />
  </Slate>
}
```

This already has some state an an editor object initialized

### Parsing some text

We need to parse our text first, let's add the import for our json parser at the top:

```tsx
import { parser } from '@lezer/json'
```

and start paring the current text in our slate js every time it changes. We can do this with the `useEffect` hook:

```tsx
useEffect(() => {
  // Concatenates the text of every node into one string
  // Bear in mind that although slate.js nodes appear by defaulty
  // in order
  const src = Editor.string(editor, [])

  const tree = parser.parse(src)
  tree.iterate({
    enter: (type, from, to, get) => {
      console.log(src.slice(from, to))
      console.log(type)
    }
  })
  // don't forget to define the dependency
}, [value])
```


