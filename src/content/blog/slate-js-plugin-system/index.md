---
title: How to roll your own slate js plugin system
pubDate: "2022-03-07T13:37:00.284Z"
description: Building your own slate js plugin system is actually surprisingly simple. In this article I'll go over the benefits you see from adopting them and how to roll your own.
image: composable-editor.png
draft: false
--- 

Building a plugin system for Slate.js can transform your editor from a monolithic mess into a clean, maintainable architecture. In this article, I'll show you how to implement a simple yet powerful plugin system that my clients have successfully used to scale their editor codebases.

**The result?** A codebase where features are self-contained, new team members can contribute faster, and you can easily compose different editor configurations for different use cases.

Let's start by understanding why you need a plugin architecture in the first place.

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

Plugin systems have prevailed as a dominant architecture [in](https://tiptap.dev/) [text](https://www.tiny.cloud/docs/plugins/) [editors](https://www.draft-js-plugins.com/) [and](https://marketplace.eclipse.org/) [IDEs](https://code.visualstudio.com/api) for good reason. They soothe the pains described above, let's have a look at how they do that.

## Plugins are a better mental model

Consider this scenario: Your team is tasked with implementing text styling functionality (bold, italic, underline). In a monolithic architecture, they would need to:

- Update `renderLeaf` in the rendering module
- Modify `onKeyDown` in the keyboard handling module  
- Add toolbar logic in the UI module
- Update normalization rules in the validation module

These modules are scattered across your codebase, and without deep Slate.js knowledge, they're hard to find and modify safely.

![Monolithic text styling](text-styling-monolith.png)

**With a plugin system**, you create a single `textStylingPlugin` that contains:
- All rendering logic for styled text
- Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- Toolbar button components
- Normalization rules to prevent invalid states

![Text styling plugin](composable-editor.png)

**Real-world benefits I've seen:**

- **Faster development**: New features take 2-3x less time to implement
- **Easier testing**: Each plugin can be tested in isolation
- **Better onboarding**: New developers can understand one feature at a time
- **Reduced bugs**: Changes are contained within plugin boundaries
- **Flexible deployment**: Enable/disable features per environment or user type

Enough about why plugins are cool ➡️ let's see how you can add the goodness of plugins to your own editor without breaking a leg, an arm and your brain in the process.

## A laughably simple plugin abstraction

A plugin system needn't be complicated. The starting point I recommend to clients of mine is actually surprisingly simple.

First - let's assume this signature for our plugins:

```tsx
import { EditableProps } from 'slate-react';
import { Editor } from 'slate';

type Plugin = (editableProps: EditableProps, editor: Editor) => EditableProps;
```

As you can see - `Plugin` is a function that takes `EditableProps` and `Editor` as arguments, and returns `EditableProps`. This simple signature is sufficient for most use cases and provides a clean, composable interface.

And here's the utility function that composes all of your plugins into a single `EditableProps`, which you can then spread on your `<Editable/>` component.

```tsx
import { ReactEditor } from 'slate-react';

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
import { Element, Text, Transforms, Path } from 'slate';
import { DefaultElement } from 'slate-react';

/**
 * This plugin defines default props such as autofocus and placeholder.
 */
const defaultPropsPlugin: Plugin = (editableProps) => ({
  ...editableProps,
  autoFocus: true,
  placeholder: 'Start typing...',
});

/**
 * This plugin renders a header element and enforces text-only content
 */
const headerPlugin: Plugin = (editableProps, editor) => {
  const { normalizeNode } = editor;
  
  /**
   * Override normalizeNode to enforce that header elements can only contain text
   */
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;
    
    if (Element.isElement(node) && node.type === 'header') {
      // Remove any non-text children from headers
      Transforms.unwrapNodes(editor, {
        at: path,
        match: (node, matchPath) =>
          !Text.isText(node) && Path.isChild(matchPath, path),
      });
    }
    
    // Call the original normalizeNode
    normalizeNode(entry);
  };

  return {
    ...editableProps,
    renderElement: (props) => {
      if (props.element.type === 'header') {
        return <h2 {...props.attributes}>{props.children}</h2>;
      }
      
      /**
       * Chain to the previously declared renderElement method,
       * or fall back to Slate's default element renderer
       */
      return editableProps.renderElement?.(props) || <DefaultElement {...props} />;
    },
  };
};

```tsx
import { Slate, Editable } from 'slate-react';
import { useState } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';

/**
 * Here we compose our plugins into a single EditableProps object
 * and use it in our editor component
 */
const MyEditor = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ]);

  const editableProps = composeEditableProps([
    defaultPropsPlugin,
    headerPlugin,
  ], editor);

  return (
    <Slate editor={editor} onChange={setValue} value={value}>
      <Editable {...editableProps} />
    </Slate>
  );
};
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

type Plugin = (pluginProps: PluginProps, editor: Editor) => PluginProps;
```

We've now replaced the first argument and the return value of the `Plugin` type with `PluginProps` - which contains `editableProps` but contains also an `renderToolbar` prop, for rendering a toolbar.

The limits are your imagination when it comes to what functionality you can compose. It doesn't have to be just slate specific.

## Testing your plugins

One of the biggest advantages of a plugin system is how easy it becomes to test individual features. Here's how you can test your plugins:

```tsx
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { headerPlugin } from './headerPlugin';

describe('headerPlugin', () => {
  it('should render header elements correctly', () => {
    const editor = withReact(createEditor());
    const editableProps = headerPlugin({}, editor);
    
    const mockProps = {
      element: { type: 'header' },
      attributes: {},
      children: 'Test Header'
    };
    
    const result = editableProps.renderElement?.(mockProps);
    expect(result).toBeDefined();
    // Add more specific assertions here
  });
  
  it('should normalize header content to text only', () => {
    const editor = withReact(createEditor());
    const editableProps = headerPlugin({}, editor);
    
    // Test normalization logic
    // This is where you'd test that headers can't contain other elements
  });
});
```

## Why can't I just use an existing plugin system?

Of course you can. There are great plugin libraries such as [Plate](https://plate.udecode.io/) that might work quite well for you. However their plugin system comes with strong opinions. Opinions that often collide with those of myself or my clients. So far - most projects I have worked on have opted to keep their editing functionality and also their plugin systems inside their own codebase.

## Getting started

Ready to implement your own plugin system? Here's your action plan:

1. **Start small**: Begin with one or two simple plugins (like the `defaultPropsPlugin` and `headerPlugin` examples above)
2. **Identify your features**: Look at your current editor and identify distinct features that could become plugins
3. **Migrate incrementally**: Don't try to refactor everything at once. Move one feature at a time to the plugin system
4. **Test as you go**: Write tests for each plugin to ensure they work correctly in isolation
5. **Document your patterns**: Create clear guidelines for your team on how to structure and compose plugins

## Next steps

- **Explore advanced patterns**: Once you're comfortable with the basics, consider adding plugin dependencies, configuration options, and lifecycle hooks
- **Build a plugin registry**: Create a system to dynamically load and configure plugins based on your application's needs
- **Share with your team**: Document your plugin system and create examples to help your team adopt the new architecture

---

**Need help implementing this?** I've helped dozens of teams migrate to plugin-based architectures. If you're working on a complex editor and need guidance, feel free to reach out on [Twitter](https://twitter.com/juliankrispel) or via email - I'd love to hear about your project and help you succeed.
