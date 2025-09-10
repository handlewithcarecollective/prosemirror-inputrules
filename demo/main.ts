import { EditorState } from "prosemirror-state";
import { addListNodes } from "prosemirror-schema-list";
import { schema as basicSchema } from "prosemirror-schema-basic";
import {
  inputRules,
  markTypeInputRule,
  wrappingInputRule,
} from "../src/index.js";
import { EditorView } from "prosemirror-view";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";

import "prosemirror-view/style/prosemirror.css";
import "./main.css";
import { Schema } from "prosemirror-model";

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, "paragraph+", "block"),
  marks: basicSchema.spec.marks,
});

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
        wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list),
      ],
    }),
  ],
});

new EditorView(document.getElementById("root"), { state });
