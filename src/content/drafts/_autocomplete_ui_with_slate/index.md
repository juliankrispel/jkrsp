---
title: The complete guide to building auto-completion UIs
pubDate: "2021-05-30T00:00:00.284Z"
description: In this tutorial we'll build a simple auto-complete UI with slate, triggered with the @ symbol, as is common in so many text editors across the web.
draft: true
---

Invented [on twitter](https://en.wikipedia.org/wiki/Mention_(blogging)), using the `@` symbol to directly reference other users or content on web-apps has become ubiquitous. In this how-to I'll go through how to implement an auto-complete UI that uses the `@` symbol.

Disclaimer: We'll be using typescript for this tutorial.

### Setup 

To get setup quickly, please use [this minimal slate-js boilerplate](https://github.com/juliankrispel/slate-js-boilerplate) as a starting point.

1. `git clone git@github.com:juliankrispel/slate-js-boilerplate.git my-editor`
2. `cd my-editor`
3. `yarn start`

After running the above 3 commands in your terminal you can go to `localhost:1234` to see the default slate editor in your browser.

Once you've completed the above your Editor component should look something like this.

```tsx
export function MyEditor()  {
  const editor = useMemo<ReactEditor>(() => withHistory(withReact(createEditor())) , [])

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

### Rendering UI when a user types `@`

First we need to determine when we want to display the autocompletion UI. You can do this right inside your Editor component. Wherever you do, make sure that `editor` and `selection` are in scope. Also bear in mind that `Range` and `Editor`, two slate namespaces we're using here are imported from slate.

Now let's step through the code that determines whether to show an AutoComplete UI or not:

```tsx
// our showAutoComplete variable will be set to false by default
let showAutoComplete = false

// we're deconstructing the selection variable here for brevity
const { selection } = editor

// editor.selection can unfortunately be null (according to the types) hence we make sure it isn't
// We also don't want to show an autocompletion ui when selecting text ranges, hence we need to first check if the selection is collapsed
if (selection != null && Range.isCollapsed(selection)) {

  // I'm using depth: 1 here to make sure we're comparing nodes at the right level.
  const [_, path] = Editor.node(editor, selection, { depth: 1 })

  // The range of text we're selecting here spans from the start of the block to our cursor, we're using Editor.start to get the start position
  const range = Editor.range(editor, Editor.start(editor, path), selection.focus)

  // Editor.string returns the text at the range we specified
  const text = Editor.string(editor, range)

  // Finally, we're using regex to test whether the preceding text ends with an @ symbol followed by characters that aren't spaces.
  showAutoComplete = /@[^\s]*$/.test(text)
}
```

Now that we have computed `showAutoComplete` we can use it in our react component to render an AutoComplete UI, something like:

```tsx
return <Slate editor={editor} onChange={setValue} value={value}>
  <Editable placeholder="Write something..." autoFocus />
  {showAutoComplete && <AutoComplete />}
</Slate>
```

We don't have an AutoComplete component yet, so let's add a placeholder one:


```tsx
function AutoComplete() {
  return <div>
    Autocomplete
  </div>
}
```

You should now see the word `AutoComplete` appear when your cursor is placed behind an @ symbol - this shows us just a placeholder. Let's make it useable next:

### Rendering auto-complete options



### A note on accessibility

