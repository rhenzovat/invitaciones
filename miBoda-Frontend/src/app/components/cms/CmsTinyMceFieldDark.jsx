import React, { useMemo } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import {
  TINYMCE_API_KEY,
  getTinyMceInitCompact,
  getTinyMceInitNotes,
  getTinyMceInitStandard,
} from "./cmsTinyMceConfig";

function pickInit(mode, h) {
  if (mode === "compact") return getTinyMceInitCompact(h);
  if (mode === "notes") return { ...getTinyMceInitNotes(h), z_index: 2000 };
  return getTinyMceInitStandard(h);
}

/** TinyMCE para panel lateral oscuro (CmsPanelRoot) */
export default function CmsTinyMceFieldDark({
  label,
  value = "",
  onChange,
  mode = "standard",
  height,
  disabled = false,
}) {
  const h = height ?? (mode === "compact" ? 100 : mode === "notes" ? 280 : 200);
  const init = useMemo(() => ({
    ...pickInit(mode, h),
    skin: "oxide-dark",
    content_css: "dark",
    content_style:
      "body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #e2e8f0; background: #1e293b; margin: 8px; }",
  }), [mode, h]);

  if (!TINYMCE_API_KEY) {
    return <Alert severity="warning" sx={{ mb: 1 }}>Falta VITE_TINYMCE_API_KEY</Alert>;
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      {label && (
        <Typography sx={{ color: "#94a3b8", fontSize: 12, mb: 0.5, display: "block" }}>{label}</Typography>
      )}
      <Box sx={{ borderRadius: 1, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
        <Editor
          apiKey={TINYMCE_API_KEY}
          value={value ?? ""}
          onEditorChange={(content) => onChange?.(content)}
          disabled={disabled}
          init={init}
        />
      </Box>
    </Box>
  );
}
