---
title: Embedding youtube videos in rich text documents with slate js
date: "2021-05-12T18:00:00.284Z"
description: Embedding youtube videos in rich text documents with slate js
draft: true
---

Embedding media such as youtube or vimeo links in a rich text document is a very common feature in rich text editors (in my case, it's an often requested feature by clients).

In this post I'll go through a pattern that I see used across projects: "Rendering embedded media in iframes". In this case it's a youtube video, but it could really be anything.

The finished [example is available at](https://github.com/juliankrispel/slate-patterns/blob/master/src/iframe-elements/iframe-elements.tsx)

Let's get started

### 1. Setup

At the time of writing, I'm `0.59`, make sure you're using this version or higher to ensure nothing breaks.

If you don't have a react app already, please use `create-react-app` (or something similar) to get started. I always include typescript for my projects but this is entirely optional.

```bash
npx create-react-app my-awesome-editor --template typescript
cd my-awesome-editor
```

Add the dependencies `slate`, `slate-react` and `slate-history` to your React app.

```bash
yarn add slate slate-react slate-history
```

Now let's add the boilerplate for your editor component, importing all the right dependencies and handling onChange events.

```tsx
import React, { useMemo, useState } from "react";
import { createEditor, Node } from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";

export function MyEditor()  {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const [value, setValue] = useState<Node[]>([
    {
      children: [{
        text: ""
      }],
    },
  ]);

  return <Slate editor={editor} onChange={setValue} value={value}>
    <Editable placeholder="Write something..."/>
  </Slate>
}
```

### 2. Adding a youtube element

One of the three __fundamental__ building blocks of a slate document are Block Elements. In it's simplest form Block Elements are lines of text (or paragraphs), but they can also be non-text elements. All block elements are derived from this shape:

```tsx
{
  children: [{
    text: ''
  }]
}
```

To create our youtube element we add our own properties to this element. Youtube videos have id's, so we add a `videoId` alongside a `type` for clarity.

```tsx
{
  type: 'youtube',
  videoId: 'CvZjupLir-8',
  children: [{
    text: ''
  }]
}
```

Let's update our default value to include a block like this. However, this won't render an iframe, let's look at that next ⬇

### 3. Rendering embeddable elements

In order to render the iframe we need to define the aptly named [`renderElement` prop](https://docs.slatejs.org/concepts/08-rendering) of slate's  `Editable` component like this:

```tsx
<Editable
  renderElement={({ attributes, element, children }) => {
    if (element.type === 'youtube' && element.videoId != null) {
      return <div
        {...attributes}
        contentEditable={false}
      >
        <iframe
          src={`https://www.youtube.com/embed/${element.videoId}`}
          aria-label="Youtube video"
          frameBorder="0"
        ></iframe>
        {children}
      </div>
    } else {
      return <p {...attributes}>{children}</p>
    }
  }}
/>
```

If you've followed the steps so far, you should now see a youtube embed appear in your editor. Let's break down what's happening in this `renderElement` in the above code:

- In our `renderElement` prop we check if the type of element is `'youtube'` and if it is, we render our iframe. We construct the iframe src attribute by concatenating youtube's embed url with  with the video id.
- Our `renderElement` callback must always render the `children` prop as well as the element `attributes` which can be spread over a html element (Otherwise slate.js will error when you try to interact with the element).
- If the element type isn't `'youtube'` the `renderElement` prop renders a paragraph by default. Slate will use the `renderElement` method to render every `element` in your document.
- For non-text elements, we need to add `contentEditable={false}` to prevent the browser from adding a cursor to our content.
- Don't forget to add an `aria-label` or a `title` attribute to your iframe, otherwise [screen-readers will not be able to make sense of it](https://fae.disability.illinois.edu/rulesets/FRAME_2/).

### 4. Treat `'youtube'` blocks as voids

By default slate assumes that every element has editable text. This is not the case for our youtube block.

To make sure slate behaves appropriately we need to override the `editor.isVoid` method like so:

```tsx
editor.isVoid = (el) =>  el.type === 'video'
```

For completeness, here's the entire useMemo callback producing the editor prop for the `Slate` component:

```tsx
const editor = useMemo(() => {
  const _editor = withHistory(withReact(createEditor()))
  _editor.isVoid = (el) => el.type === 'youtube'
  return _editor
}, [])
```

Now we're rendering and handling this block correctly, but how does a user actually add a youtube block?

### 5. Inserting youtube blocks

To insert youtube blocks, we need to use slate's [`Transforms` library](https://docs.slatejs.org/api/transforms), in particular, the `insertNodes` method.

This should do it:

```tsx
Transforms.insertNodes([{
  type: 'youtube',
  videoId,
  children: [{
    text: ''
  }]
}])
```

However we still need the user interaction for input. Let's add an `onPaste` prop to our Editable component for this.

```tsx

<Editable
  onPaste={(event) => {
    const pastedText = event.clipboardData?.getData('text')?.trim()
    const youtubeRegex = /^(?:(?:https?:)?\/\/)?(?:(?:www|m)\.)?(?:(?:youtube\.com|youtu.be))(?:\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(?:\S+)?$/
    const matches = pastedText.match(youtubeRegex)
    if (matches != null) {
      // the first regex match will contain the entire url,
      // the second will contain the first capture group which is our video id
      const [_, videoId] = matches
      event.preventDefault()
      Transforms.insertNodes(editor, [{
        type: 'youtube',
        videoId,
        children: [{
          text: ''
        }]
      }])
    }
  }}
  renderElement={...}
/>
```

Let's break this down:

First we need to retrieve the text we pasted:

```tsx
const pastedText = event.clipboardData?.getData('text')?.trim()
```

To test if our pasted url is a youtube url and to capture the id from the url we use a regex. It's not pretty but I prefer examples with as few dependencies as possible. If you do want something easier to read, you could use libraries like [`get-youtube-id`](https://www.npmjs.com/package/get-youtube-id) for this purpose.

If the regex matches we call `event.preventDefault()` to prevent the pasted text from being inserted as text. Instead we insert a slate element of type `'youtube'` and with a video id. Now we can embed youtube videos in our document by simply pasting the link, anywhere.

That's it. I hope you enjoyed this tutorial.
