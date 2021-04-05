---
title: Accessibility for rich text editors
date: "2021-05-12T18:00:00.284Z"
description: Accessibility for rich text editors
draft: true
---

If you're building an app that features a rich text editors - you should make them as accessible as possible for screen-readers.

The following is a list of recommendations for building accessible editors. Although most points will be applicable to any kind of library you use, some of them are specific to building editors with react.js.

### 1. Test with an actual screen reader

If you have never used a screen reader, stop what you're doing and try to use your app or [any](https://docs.google.com/) app [with](https://medium.com/) rich [text](https://www.notion.so/) editing with a screen reader. I'd consider this blog-post a success even if you don't come back to finish it.

- On __OSX__ you already have one built in to your operating system: [VoiceOver](https://support.apple.com/en-gb/guide/voiceover/welcome/mac).
- For __Windows__ users there's [nvda](https://github.com/nvaccess/nvda)(free) which is overall the most popular screen reader.
- A very popular screen reader is also [JAWS](https://www.freedomscientific.com/products/software/jaws/) (not free).

All of the below recommendations become more obvious if you put yourself into your users shoes.

### 2. Use alt text for your images

If you're rendering image blocks in your editor, use alt attribute to represent what the image contains to a screen reader.
Consider enabling users to configure the alt attribute.

### 3. Use aria labels for icon buttons

If you're using icon buttons label the buttons. Here's a react example:

```tsx
<button aria-label="Add block">
  <PlusIcon />
</button>
```

### 4. role=textbox


### 5. Floating menus are harder to make accessible

### 6. Use linting for a good accessibilty baseline

For react users, the [a11y-jsx eslint plugin](https://www.npmjs.com/package/eslint-plugin-jsx-a11y) will go a long way of covering the bases. 

### 7. Use an accessible component library for building menu components

Build on established component libraries. [Reach.ui](https://reach.tech/), [material ui](https://material-ui.com/) and [chakra](https://chakra-ui.com/) are all react libraries that have good accessibility defaults. 
