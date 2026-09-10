import React from "react";
import { Box, Typography, Alert } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import {
  TINYMCE_API_KEY,
  getTinyMceInitCompact,
  getTinyMceInitStandard,
} from "./cmsTinyMceConfig";

/**
 * Campo TinyMCE para formularios CMS (sustituye textareas con HTML).
 * @param {'compact'|'standard'} mode - compact para títulos; standard para párrafos
 */
export default function CmsTinyMceField({
  label,
  value = "",
  onChange,
  mode = "standard",
  height,
  disabled = false,
  helperText,
  sx,
}) {
  const h = height ?? (mode === "compact" ? 100 : 220);
  const init = mode === "compact" ? getTinyMceInitCompact(h) : getTinyMceInitStandard(h);

  if (!TINYMCE_API_KEY) {
    return (
      <Alert severity="warning" sx={{ mb: 1 }}>
        Falta VITE_TINYMCE_API_KEY en .env
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 2, ...sx }}>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
          {label}
        </Typography>
      )}
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          "& .tox-tinymce": { border: "none !important" },
        }}
      >
        <Editor
          apiKey={TINYMCE_API_KEY}
          value={value ?? ""}
          onEditorChange={(content) => onChange?.(content)}
          disabled={disabled}
          init={init}
        />
      </Box>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
