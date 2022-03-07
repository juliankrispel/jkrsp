---
title: Why you need a plugin system for slate-js and how to roll your own.
date: "2022-03-07T13:37:00.284Z"
description: Rolling your own plugin system is actually surprisingly simple. In this article I'll go over the benefits my clients see from adopting them and how to roll your own.
image: composable-editor.png
draft: false
--- 

In this article I'll show you how to build your own plugin system for slate-js.

What I'll be describing is a much loved abstraction by clients of mine and so I want to share it with you dear reader - in the hope that it'll help keep your expanding editor codebase __maintainable and composable__.

Before we go into the nitty gritty let's have a look at why you'd want a plugin architecture in the first place.

## Why do we need plugins?

A lot of editor codebases look something like this:

![Monolithic editor codebase diagram](monolithic-editor.png)

I call this a monolith. In a codebase like this - the modules mirror the interfaces that slate exposes. Every property of the interface (such as `renderElement` or `renderLeaf`, `onKeyDown` or `onMouseDown`) branches out into it's own arbitrarily deep hierarchy of files and folders.

If you are a small team of 1 or 2 people who are experienced with slate-js, there's really nothing wrong with this architecture.

But ...

- if you are an organization with an engineering team - comprised of several engineers with varying seniority
- if your team is expected to work on several editing features in parallel
- if you want to keep their cognitive burden as low as possible - to make it less expensive to build and maintain the codebase and to onboard new members
- if your Editor functionality should be composable, so that you can bundle different functionality for different use-cases

... a monolithic codebase can be a cause of severe pain.

Frankly, the cognitive burden for developers will always be higher in text editors than in other parts of your front-end. They are unfortunately almost without exception - complex software.

That doesn't mean that they have to be complicated codebases however.

Plugin systems have prevailed as a dominant architecture in text editing and IDEs for good reason. They soothe the pains described above, let's have a look at how they do that.

## Plugins are a better mental model

Consider this scenario: Your team is tasked with implementing styling functionality. In a monolith they would have to update all the modules that are needed to implement this kind of functionality. These modules are spread around the codebase and without good knowledge of slate-js they will be hard to find.

![Monolithic text styling](text-styling-monolith.png)

A plugin architecture enables and encourages your team to think in features and group your functionality as such. You might have a `youtube` plugin or a `code` plugin, or in our case - a `textStyling` plugin:

![Text styling plugin](composable-editor.png)

All code for one feature is now conveniently contained in one, composable unit, rather than being spread out. In my experience this different mental model can make for huge gains in productivity for teams - because of the reduced cognitive load. Your team can now focus on the feature they implement, rather than having to navigate and keep in mind the rest of the ever-expanding code base.

On the other hand, newcomers to the codebase can see all the pieces needed to implement a feature in one place. This makes it so much easier to comprehend and learn from.

Enough about why plugins are cool ➡️ let's see how you can add the goodness of plugins to your own editor without breaking a leg, an arm and your brain in the process.

## A laughably simple plugin abstraction

A plugin system needn't be complicated. The starting point I recommend to clients of mine is actually surprsingly simple.

First - let's assume this signature for our plugins:

```tsx
type Plugin = (editableProps: EditableProps, editor: Editor) => EditableProps;
```

As you can see - `Plugin` is a function that takes `EditableProps` and `Editor` as arguments, and returns `EditableProps`. That is sufficient for a lot of usecases.

And here's the utility function that composes all of your plugins into a single `EditableProps`, which you can then spread on your `<Editable/>` component.

```tsx
export const composeEditableProps = (
  plugins: Plugin[],
  editor: ReactEditor,
): EditableProps => {
  let editableProps: EditableProps = {};
  for (const plugin of plugins) {
    editableProps = plugin(editableProps, editor);
  }
  return editableProps;
};
```

All `composeEditableProps` does is loop over each plugin and feed the output of the last plugin to the next one.

Here are some simple example plugins to show it in use:

```tsx
/**
 * This plugin defines default props such as autofocus and placeholder.
 */
const defaultPropsPlugin: Plugin = (editableProps) => ({
  ...editableProps,
  autoFocus: true,
  placeholder: 'Hello world',
})

/**
 * This plugin renders a header element
*/
const headerPlugin: Plugin = (editableProps, editor) => {
  const { normalizeNode } = editor
  /**
   * Here we override the normalizeNode editor method in a plugin
   * to enforce that header elements can only contain text
   */
  editor.normalizeNode = (entry) => {
    const [node, path] = entry
    if (Element.isElement(node) && node.type === 'header') {
      Transforms.unwrapNodes(editor, {
        at: path,
        match: (node, matchPath) =>
          !Text.isText(node) && Path.isChild(matchPath, path),
      });
    }
    normalizeNode(entry)
  }

  return {
    ...editableProps,
    renderElement: (props) => {
      if (props.type === 'header') {
        return <h2 {...props.attributes}>{props.children}</h2>
      }
      
      /**
       * If the element is no header, we want to call the previously declared
       * renderElement method and default to slate's <DefaultElement {...props}>
       * if there is no existing renderElement method
       */
      return editableProps.renderElement?.(props) || <DefaultElement {...props} />
    }
  }
}

/**
 * Here we take the two above plugins and combine them into one EditableProps object
 * which we then spread onto <Editable />
 */
const editableProps = composeEditableProps([
  defaultPropsPlugin,
  headerplugin
], editor)


return (
  <Slate editor={editor} onChange={setValue} value={value}>
    <Editable {...editableProps} />
  </Slate>
);
```

And that's it. Above you can see two plugins, the `header` plugin and the `defaultProps` plugin and how they're composed into `EditableProps`.

### What if I want my plugins to contain more than just editableProps?

Let's say you have UI that is rendered outside the `<Editable />` component (such as toolbar buttons to format your text) which you'd like to include in your plugin.
This is all possible, all you need to do is configure your type.  For example, the plugin type could instead look like this:

```tsx
type PluginProps = {
  editableProps: EditableProps;
  renderToolbar: () => JSX.Element;
}

type Plugin = (pluginProps: Pluginprops, editor: Editor) => PluginProps;
```

We've now replaced the first argument and the return value of the `Plugin` type with `PluginProps` - which contains `editableProps` but contains also an `renderToolbar` prop, for rendering a toolbar.

The limits are your imagination when it comes to what functionality you can compose. It doesn't have to be just slate specific.

## Why can't I just use an existing plugin system?

Of course you can. There are great plugin libraries such as [Plate](https://plate.udecode.io/) that might work quite well for you. However their plugin system comes with strong opinions. Opinions that often collide with those of myself or my clients. So far - most projects I have worked on have opted to keep their editing functionality and also their plugin systems inside their own codebase.

---

That's a wrap. If you're keen on implementing a plugin system for your editor but need help, feel free to reach out on twitter or via email, I'd love to hear from you.
