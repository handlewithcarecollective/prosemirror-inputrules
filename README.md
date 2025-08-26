# `@handlewithcare/prosemirror-inputrules`

A drop-in replacement for [prosemirror-inputrules](https://npmjs.com/package/prosemirror-inputrules) with better undo handling and utilities for markdown-style formatting rules.

## Installation

```sh
npm install @handlewithcare/prosemirror-inputrules prosemirror-state prosemirror-model prosemirror-view
```

## Usage

Basic usage is identical to [prosemirror-inputrules](https://npmjs.com/package/prosemirror-inputrules):

```ts
import { InputRule, inputRules } from "@handlewithcare/prosemirror-inputrules";

const editorState = EditorState.create({
  schema,
  plugins: [inputRules({ rules: new InputRule(/->\s/, "→ ") })],
});
```

## Markdown-style formatting

In addition to all of the rule builders from `prosemirror-inputrules`, this library exports a `markTypeInputRule` builder. This can be used to add a mark to a section of text matched by a regex. For example, to automatically mark any text surrounded by `**` as bold, a la markdown:

```ts
import {
  markTypeInputRule,
  inputRules,
} from "@handlewithcare/prosemirror-inputrules";

const editorState = EditorState.create({
  schema,
  plugins: [
    inputRules({
      rules: markTypeInputRule(/\*\*(?<content>.+)\*\*/d, schema.marks.strong),
    }),
  ],
});
```

Two important notes about the regular expressions used with `markTypeInputRule`:

1. They use named matching groups (`prefix`, `content`, and `suffix`). The `content` group is required, and the others are optional. The matched text will be preserved, and all unmatched text will be deleted. The mark will be added only to the text matched by the `content` group.
2. They must include the `d` flag, which exposes indices for the matched text.

The `prefix` and `suffix` matching groups can be used to make the regex more specific without expanding the scope of text to remove or mark. For example, we can mark an text surrounded by `_` as italic, but only if there's a space before the first `_` (so that we don't include words that have underscores):

```ts
import {
  markTypeInputRule,
  inputRules,
} from "@handlewithcare/prosemirror-inputrules";

const editorState = EditorState.create({
  schema,
  plugins: [
    inputRules({
      rules: markTypeInputRule(
        /(?<prefix>^|\s)_(?<content>.+)_/d,
        schema.marks.strong,
      ),
    }),
  ],
});
```

## Differences from `prosemirror-inputrules`

The primary behavior difference from `prosemirror-inputrules` is that this library actually applies the text that triggers its rules before executing the rules. In the first example, we had thi following rule:

```ts
new InputRule(/->\s/, "→ ");
```

Using `prosemirror-inputrules`, if a user typed `-` and then `>`, the editor history would look like:

```json
[
  {
    "from": 1,
    "to": 1,
    "text": "-"
  },
  {
    "from": 1,
    "to": 2,
    "text": "→"
  }
]
```

The plugin identifies that a user is _going_ to type `->`, and executes the input rule instead of applying the `>`. This means that an undo command, rather than undoing just the input rule, undoes the insertion of the `>` character, resulting in just `-` again.

By contrast, here's the editor history after the same inputs using this library:

```json
[
  {
    "from": 1,
    "to": 1,
    "text": "-"
  },
  {
    "from": 2,
    "to": 2,
    "text": ">"
  },
  {
    "from": 1,
    "to": 3,
    "text": "→"
  }
]
```

Since this library actually applies the `>` character to the editor before executing the input rule, an undo command _only_ undoes the input rule, resulting in what the user initially typed (`->`).
