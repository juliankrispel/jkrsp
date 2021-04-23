---
title: Cypress snippets for testing contenteditable editors
date: "2021-05-30T00:00:00.284Z"
description: Cypress snippets for testing contenteditable editors
draft: true
---

### Pasting

### Dropping text

### Manipulating the selection

### Simulating dragging of selections

```tsx
  cy.findByRole('textbox')
  .as('editor')
  .type('{movetostart}')
  .type('Hello')

  cy.window().then(win => {
    const sel = win.getSelection()
    
    if(sel?.focusNode) {
      sel?.extend(sel.focusNode, sel?.anchorOffset - 5)
    }
  })

  cy.get('@editor')
    .trigger('selectionchange')
    .trigger('drop', dragEvent(['whatever']))
  ```