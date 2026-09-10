export const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY || "";

const CONTENT_STYLE =
  "body { font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333; margin: 8px; }";

const NOTE_BODY_STYLE =
  "body { font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.45; color: #333; margin: 8px; }";

/** Párrafos compactos dentro del iframe de TinyMCE (evita saltos de línea exagerados). */
export const TINYMCE_NOTE_PARAGRAPH_STYLE =
  "p { margin: 0 0 0.35em 0; padding: 0; } p:last-child { margin-bottom: 0; }";

const BASE = {
  branding: false,
  promotion: false,
  resize: true,
  automatic_uploads: false,
  entity_encoding: "raw",
  extended_valid_elements: "span[class|style],br",
  valid_elements: "*[*]",
};

/** Editor compacto para títulos / frases con HTML simple */
export function getTinyMceInitCompact(height = 100) {
  return {
    ...BASE,
    height,
    min_height: height,
    menubar: false,
    statusbar: false,
    plugins: ["lists", "link", "autolink", "code", "wordcount"],
    toolbar:
      "undo redo | bold italic underline | forecolor backcolor | alignleft aligncenter alignright | removeformat code",
    content_style: CONTENT_STYLE,
    forced_root_block: false,
    force_br_newlines: true,
    force_p_newlines: false,
  };
}

/** Editor para párrafos / descripciones */
export function getTinyMceInitStandard(height = 220) {
  return {
    ...BASE,
    height,
    min_height: height,
    menubar: "edit format",
    plugins: ["lists", "link", "autolink", "code", "wordcount", "table"],
    toolbar:
      "undo redo | blocks | bold italic underline | forecolor backcolor | " +
      "alignleft aligncenter alignright | bullist numlist | link | removeformat code",
    content_style: CONTENT_STYLE,
  };
}

const NOTE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

/** Convierte blob/archivo a data URL para incrustar en el HTML de la nota. */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    if (blob.size > NOTE_IMAGE_MAX_BYTES) {
      reject(new Error("La imagen supera 2 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(blob);
  });
}

/** Editor de notas sticky: pegar, arrastrar e insertar imágenes en el lienzo. */
export function getTinyMceInitNotes(height = 280) {
  const imgStyle =
    "img { max-width: 100%; height: auto; display: block; margin: 8px 0; border-radius: 6px; }";

  return {
    ...BASE,
    height,
    min_height: height,
    menubar: "edit format",
    plugins: ["lists", "link", "autolink", "code", "wordcount", "table", "image", "paste"],
    toolbar:
      "undo redo | blocks | bold italic underline | forecolor backcolor | " +
      "alignleft aligncenter alignright | bullist numlist | link image | removeformat code",
    paste_data_images: true,
    paste_block_drop: false,
    paste_as_text: false,
    automatic_uploads: true,
    images_file_types: "jpeg,jpg,png,gif,webp",
    images_upload_handler: (blobInfo) => blobToDataUrl(blobInfo.blob()),
    file_picker_types: "image",
    file_picker_callback: (callback) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/gif,image/webp";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        blobToDataUrl(file)
          .then((url) => callback(url, { alt: file.name }))
          .catch((err) => {
            if (typeof window !== "undefined") window.alert(err.message || "Imagen no válida");
          });
      };
      input.click();
    },
    extended_valid_elements: "img[src|alt|width|height|style|class]",
    valid_elements: "*[*]",
    newline_behavior: "linebreak",
    content_style: `${NOTE_BODY_STYLE} ${TINYMCE_NOTE_PARAGRAPH_STYLE} ${imgStyle}`,
  };
}

/** Editor amplio (artículos) */
export function getTinyMceInitArticle(height = 480) {
  return {
    ...BASE,
    height: "100%",
    min_height: height,
    menubar: "edit format tools",
    plugins: [
      "advlist", "autolink", "lists", "link", "charmap", "code", "wordcount", "table",
    ],
    toolbar:
      "undo redo | blocks | bold italic underline strikethrough | forecolor backcolor | " +
      "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
      "link table | removeformat code fullscreen",
    content_style: CONTENT_STYLE,
  };
}
