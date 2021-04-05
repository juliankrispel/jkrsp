---
title: A comparison of slate.js and draft.js
date: "2021-05-12T18:00:00.284Z"
description: A comparison of slate.js and draft.js
draft: true
---


### Size

Draft.js: ~ 170kb incl deps
Slate.ks: ~ 80kb incl deps

Including dependencies slate.js clocks in at less than half the size of draft.js. Draft.js's dependency on immutable.js makes up a lot of that.

### Type system

Although there are types for Draft.js, it is written using FlowType whereas slate.js latest release is written from the ground up with Typescript.

When draft.js was written, typescript wasn't really a thing. However since then Typescript has definitely come out on top as the dominant type system.






