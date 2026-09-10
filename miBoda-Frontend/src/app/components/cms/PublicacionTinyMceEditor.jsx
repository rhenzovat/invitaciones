import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { TINYMCE_API_KEY, getTinyMceInitArticle } from "./cmsTinyMceConfig";

export default function PublicacionTinyMceEditor({ value = "", onChange, disabled = false }) {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey={TINYMCE_API_KEY}
      onInit={(_evt, editor) => { editorRef.current = editor; }}
      value={value}
      onEditorChange={(content) => onChange?.(content)}
      disabled={disabled}
      init={getTinyMceInitArticle(480)}
    />
  );
}
