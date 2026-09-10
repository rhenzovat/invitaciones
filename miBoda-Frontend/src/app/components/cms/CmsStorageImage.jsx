import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { cmsPublicImageUrlCandidates } from "app/utils/utils";

/**
 * Imagen CMS con fallback de URL (XAMPP ↔ localhost:8000) si la primera ruta falla.
 */
export default function CmsStorageImage({
  storagePath,
  absoluteUrl = null,
  previewSrc,
  alt = "",
  sx = {},
  ...rest
}) {
  const candidates = previewSrc
    ? [previewSrc]
    : cmsPublicImageUrlCandidates(storagePath, absoluteUrl);

  const [index, setIndex] = useState(0);
  const src = candidates[index] ?? null;

  useEffect(() => {
    setIndex(0);
  }, [storagePath, absoluteUrl, previewSrc]);

  if (!src) return null;

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={sx}
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
      }}
      {...rest}
    />
  );
}
