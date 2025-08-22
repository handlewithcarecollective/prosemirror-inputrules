import { EditorState } from "prosemirror-state";
import { schema } from "prosemirror-schema-basic";
import { inputRules, markTypeInputRule } from "../src/index.js";
import { EditorView } from "prosemirror-view";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";

import "prosemirror-view/style/prosemirror.css";
import "./main.css";

const state = EditorState.create({
  schema,
  plugins: [
    keymap({
      "Mod-z": undo,
      "Mod-Shift-z": redo,
    }),
    history(),
    inputRules({
      rules: [
        markTypeInputRule(
          /(?<prefix>^|\s)_(?<content>[^_]+)_/d,
          schema.marks.em,
        ),
      ],
    }),
  ],
});

new EditorView(document.getElementById("root"), { state });
