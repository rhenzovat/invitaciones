import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, IconButton, Tooltip, CircularProgress,
  TextField, Dialog, DialogTitle, DialogActions, Stack, Alert,
  Divider, Select, MenuItem, FormControl, InputLabel, Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArticleIcon    from "@mui/icons-material/Article";
import AddIcon        from "@mui/icons-material/Add";
import EditIcon       from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon       from "@mui/icons-material/Save";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import OpenInNewIcon  from "@mui/icons-material/OpenInNew";
import CloseIcon      from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon     from "@mui/icons-material/Person";
import TitleIcon      from "@mui/icons-material/Title";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import {
  listar, crear, actualizar, eliminar,
  actualizar_seccion, actualizar_paginas_banner,
} from "../../../api/web_publicaciones.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot     from "app/components/cms/CmsPanelRoot";
import CmsStorageImage  from "app/components/cms/CmsStorageImage";
import CmsPaginaBannerFields from "app/components/cms/CmsPaginaBannerFields";
import CmsTinyMceField  from "app/components/cms/CmsTinyMceField";
import PublicacionTinyMceEditor from "app/components/cms/PublicacionTinyMceEditor";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
import { authJWTConfig } from "app/authJWTConfig";

const BASE = (authJWTConfig.domain || "").replace(/\/$/, "") + "/";

/* ── Categorías del frontend ────────────────────────────────── */
const CATS = ["Todas","Lifestyle","Técnicas","Privacidad","Tántrico","Bienestar"];

/* ── Styled ─────────────────────────────────────────────────── */
const PageBox = styled(Box)({ padding: 16, minHeight: "100vh", backgroundColor: "#f0f4f8" });

const HeaderBar = styled(Box)({
  padding: "8px 14px", marginBottom: 16, borderRadius: 10,
  background: "linear-gradient(135deg,#0f172a,#7c3aed)",
  color: "#fff", display: "flex", alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 3px 14px rgba(15,23,42,0.3)",
});

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(204,107,142,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#cc6b8e" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#cc6b8e" },
}));

const DarkSelect = styled(Select)(() => ({
  backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#cc6b8e" },
  "& .MuiSelect-icon": { color: "#94a3b8" },
}));

const STag = styled(Typography)({
  fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase", color: "#cc6b8e", marginBottom: 6, marginTop: 2,
});

const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

/* ── Helper: imagen de item ─────────────────────────────────── */
const ItemImg = ({ item, sx }) => {
  const src = item?._preview || (item?.url_imagen ? `${BASE}${item.url_imagen}` : null)
           || item?.url_imagen_publica;
  return src ? (
    <Box component="img" src={src} alt={item?.titulo}
      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...sx }} />
  ) : (
    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center",
      justifyContent: "center", color: "#c8a882", bgcolor: "#f5ece0", ...sx }}>
      <ImageOutlinedIcon sx={{ fontSize: 44, opacity: 0.35 }} />
    </Box>
  );
};

/* ── Lápiz flotante ─────────────────────────────────────────── */
const Pencil = ({ onClick, tip = "Editar", top = 10, right = 10 }) => (
  <Tooltip title={tip} placement="top">
    <IconButton onClick={onClick} size="small" sx={{
      position: "absolute", top, right, zIndex: 20,
      bgcolor: "rgba(124,58,237,0.85)", color: "#fff",
      width: 30, height: 30, backdropFilter: "blur(4px)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      "&:hover": { bgcolor: "#7c3aed", transform: "scale(1.1)" },
      transition: "all 0.2s",
    }}>
      <EditIcon sx={{ fontSize: 14 }} />
    </IconButton>
  </Tooltip>
);

const TrashBtn = ({ onClick, top = 10, right = 48 }) => (
  <Tooltip title="Eliminar" placement="top">
    <IconButton onClick={onClick} size="small" sx={{
      position: "absolute", top, right, zIndex: 20,
      bgcolor: "rgba(239,68,68,0.85)", color: "#fff",
      width: 30, height: 30, backdropFilter: "blur(4px)",
      "&:hover": { bgcolor: "#dc2626", transform: "scale(1.1)" },
      transition: "all 0.2s",
    }}>
      <DeleteOutlineIcon sx={{ fontSize: 14 }} />
    </IconButton>
  </Tooltip>
);

/* ── Chip de categoría ──────────────────────────────────────── */
const CatChip = ({ label }) => (
  <Box sx={{
    display: "inline-block",
    bgcolor: "#cc6b8e", color: "#fff",
    fontSize: "9px", fontWeight: 800, letterSpacing: "1.5px",
    textTransform: "uppercase", px: "10px", py: "4px",
    borderRadius: "50px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  }}>
    {label}
  </Box>
);

/* ── Fecha formateada ───────────────────────────────────────── */
const FechaStr = ({ fecha }) => {
  if (!fecha) return null;
  try {
    return new Date(fecha).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
  } catch { return fecha; }
};

/* ── Tab filtro ─────────────────────────────────────────────── */
const CatTab = ({ label, active, onClick }) => (
  <Box component="button" onClick={onClick} sx={{
    px: "20px", py: "8px", borderRadius: "50px",
    border: `1.5px solid ${active ? "transparent" : "#e8d5d0"}`,
    background: active ? "linear-gradient(135deg,#cc6b8e,#a0455e)" : "#fff",
    color: active ? "#fff" : "#7a5060",
    fontSize: "13px", fontWeight: 700, cursor: "pointer",
    whiteSpace: "nowrap", transition: "all 0.22s ease",
    boxShadow: active ? "0 4px 14px rgba(204,107,142,0.35)" : "none",
    "&:hover": { background: "linear-gradient(135deg,#cc6b8e,#a0455e)", color: "#fff", border: "1.5px solid transparent" },
  }}>
    {label}
  </Box>
);

/* ── Card destacada (featured, horizontal) ──────────────────── */
const FeaturedCard = ({ item, onEdit, onDelete }) => (
  <Box sx={{
    position: "relative", bgcolor: "#fff",
    borderRadius: "20px", overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    display: "flex", flexDirection: { xs: "column", md: "row" },
    mb: 3, minHeight: 280,
    transition: "box-shadow 0.3s", "&:hover": { boxShadow: "0 12px 40px rgba(0,0,0,0.13)" },
  }}>
    <Pencil onClick={onEdit} tip={`Editar: ${item.titulo}`} />
    <TrashBtn onClick={onDelete} />

    {/* Imagen izquierda */}
    <Box sx={{ width: { xs: "100%", md: "45%" }, minHeight: { xs: 220, md: "auto" },
      position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <ItemImg item={item} sx={{ position: "absolute", inset: 0 }} />
      {item.chip && (
        <Box sx={{ position: "absolute", top: 14, left: 14 }}>
          <CatChip label={item.chip} />
        </Box>
      )}
    </Box>

    {/* Contenido derecho */}
    <Box sx={{ flex: 1, p: "28px 30px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {item.fecha_publicacion && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6,
          fontSize: "12px", color: "#cc6b8e", fontWeight: 700 }}>
          <CalendarTodayIcon sx={{ fontSize: 13 }} />
          <FechaStr fecha={item.fecha_publicacion} />
        </Box>
      )}
      <Typography sx={{ fontFamily: "'PT Serif',serif", fontSize: { xs: "1.15rem", md: "1.4rem" },
        fontWeight: 700, color: "#2c1a0e", lineHeight: 1.3, m: 0 }}>
        {item.titulo}
      </Typography>
      {item.resumen && (
        <Typography sx={{ fontSize: "0.87rem", color: "#666", lineHeight: 1.7,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
          {item.resumen}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        mt: "auto", pt: "14px", borderTop: "1px solid #f0e8e8" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6,
          fontSize: "12px", color: "#999" }}>
          <PersonIcon sx={{ fontSize: 14 }} />
          {item.autor || "Royal Masajes"}
        </Box>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px",
          color: "#cc6b8e", fontSize: "12px", fontWeight: 700 }}>
          Leer más <ArrowForwardIcon sx={{ fontSize: 13 }} />
        </Box>
      </Box>
    </Box>
  </Box>
);

/* ── Card normal (3 columnas) ───────────────────────────────── */
const NormalCard = ({ item, onEdit, onDelete }) => (
  <Box sx={{
    position: "relative", bgcolor: "#fff",
    borderRadius: "16px", overflow: "hidden",
    boxShadow: "0 3px 16px rgba(0,0,0,0.07)",
    display: "flex", flexDirection: "column",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": { transform: "translateY(-5px)", boxShadow: "0 14px 36px rgba(0,0,0,0.12)" },
  }}>
    <Pencil onClick={onEdit} tip={`Editar: ${item.titulo}`} />
    <TrashBtn onClick={onDelete} />

    {/* Imagen */}
    <Box sx={{ height: 200, position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <ItemImg item={item} />
      {item.chip && (
        <Box sx={{ position: "absolute", top: 12, left: 12 }}>
          <CatChip label={item.chip} />
        </Box>
      )}
    </Box>

    {/* Contenido */}
    <Box sx={{ p: "18px 20px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
      {item.fecha_publicacion && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5,
          fontSize: "11px", color: "#cc6b8e", fontWeight: 700 }}>
          <CalendarTodayIcon sx={{ fontSize: 12 }} />
          <FechaStr fecha={item.fecha_publicacion} />
        </Box>
      )}
      <Typography sx={{ fontFamily: "'PT Serif',serif", fontSize: "1rem",
        fontWeight: 700, color: "#2c1a0e", lineHeight: 1.35, m: 0,
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {item.titulo}
      </Typography>
      {item.resumen && (
        <Typography sx={{ fontSize: "0.80rem", color: "#888", lineHeight: 1.65,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {item.resumen}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        mt: "auto", pt: "12px", borderTop: "1px solid #f5e8e8" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5,
          fontSize: "11px", color: "#aaa" }}>
          <PersonIcon sx={{ fontSize: 13 }} />
          {item.autor || "Royal Masajes"}
        </Box>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "4px",
          color: "#cc6b8e", fontSize: "11px", fontWeight: 700 }}>
          Leer más <ArrowForwardIcon sx={{ fontSize: 12 }} />
        </Box>
      </Box>
    </Box>
  </Box>
);

/* ── Botón Agregar vacío ────────────────────────────────────── */
const AddCard = ({ onClick }) => (
  <Box onClick={onClick} sx={{
    borderRadius: "16px", border: "2px dashed #e8d5d0",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: 300, cursor: "pointer", gap: 1,
    bgcolor: "#fff", color: "#c8a0b0",
    transition: "all 0.25s",
    "&:hover": { borderColor: "#cc6b8e", bgcolor: "rgba(204,107,142,0.04)", color: "#cc6b8e" },
  }}>
    <AddIcon sx={{ fontSize: 40 }} />
    <Typography sx={{ fontSize: "0.80rem", fontWeight: 700 }}>Nueva publicación</Typography>
  </Box>
);

/* ── Upload de imagen (panel) ───────────────────────────────── */
const ImgUpload = ({ preview, storagePath, onSelect, label = "Imagen de la tarjeta", height = 160 }) => {
  const ref = useRef(null);
  const src = preview || (storagePath ? `${BASE}${storagePath}` : null);
  return (
    <Box sx={{ mb: 1.5 }}>
      <STag>{label}</STag>
      <input type="file" ref={ref} hidden accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); }} />
      <Box onClick={() => ref.current?.click()} sx={{
        height, borderRadius: 2, overflow: "hidden",
        border: `2px dashed ${src ? "rgba(204,107,142,0.6)" : "rgba(255,255,255,0.18)"}`,
        bgcolor: "rgba(255,255,255,0.05)", display: "flex",
        alignItems: "center", justifyContent: "center",
        cursor: "pointer", position: "relative",
        "&:hover": { borderColor: "#cc6b8e" },
        "&:hover .cam-ov": { opacity: 1 },
      }}>
        {src ? (
          <>
            <Box component="img" src={src} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <Box className="cam-ov" sx={{
              position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.25s",
            }}>
              <PhotoCameraIcon sx={{ color: "#fff", fontSize: 26 }} />
            </Box>
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, color: "#475569" }}>
            <ImageOutlinedIcon sx={{ fontSize: 36, opacity: 0.4 }} />
            <Typography variant="caption" sx={{ fontSize: "0.60rem" }}>Clic para subir</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════════════════════════════
   EDITOR TINYMCE (modo fullscreen dentro de la página)
══════════════════════════════════════════════════════════════ */
const TinyEditor = ({ edit, setEdit, onBack, onSave, saving }) => {
  const tinymceKey = import.meta.env.VITE_TINYMCE_API_KEY;
  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", p: 3,
      border: "1px solid #e2e8f0", minHeight: "calc(100vh - 200px)",
      display: "flex", flexDirection: "column" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Editor de contenido</Typography>
          <Typography variant="body2" color="text.secondary">{edit?.titulo || "Sin título"}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<CloseIcon />} onClick={onBack}>Volver</Button>
          <Button variant="contained" startIcon={<SaveIcon />}
            sx={{ bgcolor: "#cc6b8e", "&:hover": { bgcolor: "#a0455e" } }}
            onClick={onSave} disabled={saving}>
            {saving ? "Guardando…" : "Guardar artículo"}
          </Button>
        </Stack>
      </Stack>
      {!tinymceKey && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Falta VITE_TINYMCE_API_KEY en el .env del frontend.
        </Alert>
      )}
      <Box sx={{ flex: 1, "& .tox-tinymce": { borderRadius: 8 } }}>
        <PublicacionTinyMceEditor
          value={edit?.contenido ?? ""}
          onChange={(html) => setEdit((x) => ({ ...x, contenido: html }))}
          disabled={!tinymceKey}
        />
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════════════════════════════
   PANEL LATERAL — edición de publicación
══════════════════════════════════════════════════════════════ */
const EditPanel = ({
  open, panelLeft, edit, setEdit, isNew, saving,
  preview, onImgSelect,
  bannerPreview, onBannerSelect,
  onOpenEditor, onSave, onClose,
}) => (
  <CmsPanelRoot open={open} panelLeft={panelLeft}>
    {/* Header */}
    <Box sx={{
      px: 2, py: 1.5, display: "flex", alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
    }}>
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", fontSize: "0.82rem" }}>
          {isNew ? "Nueva publicación" : "Editar publicación"}
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
          {edit?.titulo || "Completa los campos"}
        </Typography>
      </Box>
      <IconButton size="small" onClick={onClose}
        sx={{ color: "#94a3b8", "&:hover": { color: "#cc6b8e" } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>

    <Box sx={{ px: 2, py: 1.5, flex: 1, overflow: "auto" }}>
      {/* Banner del artículo */}
      <CmsPaginaBannerFields
        dark showTitulo={false}
        imageLabel="Banner del artículo (hero en /publicaciones/slug)"
        storagePath={edit?.banner_url_imagen}
        previewSrc={bannerPreview}
        onImageSelect={onBannerSelect}
      />
      <Sep />

      {/* Imagen de tarjeta */}
      <ImgUpload
        preview={preview}
        storagePath={edit?.url_imagen}
        onSelect={onImgSelect}
        label="Imagen de la tarjeta (listado)"
        height={160}
      />
      <Sep />

      <STag>Información</STag>
      <DarkField size="small" fullWidth label="Título *" sx={{ mb: 1.2 }}
        value={edit?.titulo ?? ""} onChange={(e) => setEdit(x => ({ ...x, titulo: e.target.value }))} />
      <DarkField size="small" fullWidth label="Slug (URL)" sx={{ mb: 1.2 }}
        value={edit?.slug ?? ""} onChange={(e) => setEdit(x => ({ ...x, slug: e.target.value }))} />
      <DarkField size="small" fullWidth label="Resumen" multiline rows={3} sx={{ mb: 1.2 }}
        value={edit?.resumen ?? ""} onChange={(e) => setEdit(x => ({ ...x, resumen: e.target.value }))} />

      {/* Botón abrir editor */}
      <Button fullWidth variant="outlined" startIcon={<OpenInNewIcon />}
        onClick={onOpenEditor}
        sx={{ mb: 1.5, color: "#a78bfa", borderColor: "#7c3aed",
          "&:hover": { borderColor: "#a78bfa", bgcolor: "rgba(124,58,237,0.12)" } }}>
        Abrir editor de contenido
      </Button>
      {edit?.contenido ? (
        <Typography variant="caption" sx={{ color: "#22c55e", display: "block", mb: 1.5, fontSize: "0.68rem" }}>
          ✓ Artículo con contenido ({edit.contenido.length} caracteres)
        </Typography>
      ) : null}

      <Sep />
      <STag>Clasificación</STag>

      <FormControl fullWidth size="small" sx={{ mb: 1.2 }}>
        <InputLabel sx={{ color: "#94a3b8", "&.Mui-focused": { color: "#cc6b8e" } }}>Categoría</InputLabel>
        <DarkSelect value={edit?.categoria ?? ""} label="Categoría"
          onChange={(e) => setEdit(x => ({ ...x, categoria: e.target.value }))}
          MenuProps={{ PaperProps: { sx: { bgcolor: "#1e293b", color: "#f1f5f9" } } }}>
          {CATS.filter(c => c !== "Todas").map(c => (
            <MenuItem key={c} value={c}
              sx={{ fontSize: "0.82rem", "&:hover": { bgcolor: "rgba(204,107,142,0.15)" } }}>
              {c}
            </MenuItem>
          ))}
        </DarkSelect>
      </FormControl>

      <DarkField size="small" fullWidth label="Chip (badge visible en la card)" sx={{ mb: 1.2 }}
        value={edit?.chip ?? ""} onChange={(e) => setEdit(x => ({ ...x, chip: e.target.value }))} />
      <DarkField size="small" fullWidth label="Autor" sx={{ mb: 1.2 }}
        value={edit?.autor ?? ""} onChange={(e) => setEdit(x => ({ ...x, autor: e.target.value }))} />
      <DarkField size="small" fullWidth label="Fecha (YYYY-MM-DD)" sx={{ mb: 1.2 }}
        value={edit?.fecha_publicacion ?? ""} onChange={(e) => setEdit(x => ({ ...x, fecha_publicacion: e.target.value }))} />
    </Box>

    {/* Footer */}
    <Box sx={{
      px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
      bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
    }}>
      <Stack direction="row" spacing={1}>
        <Button fullWidth variant="contained"
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
          onClick={onSave} disabled={saving}
          sx={{ bgcolor: "#cc6b8e", fontWeight: 700, "&:hover": { bgcolor: "#a0455e" } }}>
          {saving ? "Guardando…" : "Guardar publicación"}
        </Button>
        <Button variant="outlined" onClick={onClose}
          sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
          <CloseIcon fontSize="small" />
        </Button>
      </Stack>
    </Box>
  </CmsPanelRoot>
);

/* ══════════════════════════════════════════════════════════════
   PANEL LATERAL — configuración de sección / banners
══════════════════════════════════════════════════════════════ */
const ConfigPanel = ({
  open, panelLeft, seccion, setSeccion, paginasBanner, setPaginasBanner,
  listadoBannerPreview, onListadoSelect,
  detalleBannerPreview, onDetalleSelect,
  saving, onSaveSeccion, onSaveBanners, onClose,
}) => (
  <CmsPanelRoot open={open} panelLeft={panelLeft}>
    <Box sx={{
      px: 2, py: 1.5, display: "flex", alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
    }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", fontSize: "0.82rem" }}>
        Configuración de sección
      </Typography>
      <IconButton size="small" onClick={onClose} sx={{ color: "#94a3b8" }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>

    <Box sx={{ px: 2, py: 1.5, flex: 1, overflow: "auto" }}>
      <STag>Encabezado de la sección</STag>
      <CmsTinyMceField label="Título sección (HTML)" value={seccion.titulo}
        onChange={(v) => setSeccion(s => ({ ...s, titulo: v }))} mode="compact" height={90} />
      <DarkField size="small" fullWidth label="Subtítulo" sx={{ mt: 1.5, mb: 1.5 }}
        value={seccion.subtitulo}
        onChange={(e) => setSeccion(s => ({ ...s, subtitulo: e.target.value }))} />
      <Button fullWidth variant="contained"
        sx={{ bgcolor: "#cc6b8e", mb: 2, "&:hover": { bgcolor: "#a0455e" } }}
        onClick={onSaveSeccion} disabled={saving}>
        Guardar encabezado
      </Button>

      <Sep />
      <STag>Banners de páginas</STag>

      <CmsPaginaBannerFields
        dark titulo={paginasBanner.listado_banner_titulo ?? ""}
        onTituloChange={(v) => setPaginasBanner(b => ({ ...b, listado_banner_titulo: v }))}
        tituloLabel="Título banner — listado" tituloHint="Página /publicaciones" tituloUseEditor
        storagePath={paginasBanner.listado_banner_url_imagen}
        previewSrc={listadoBannerPreview}
        onImageSelect={onListadoSelect}
      />

      <Box sx={{ mt: 1.5 }}>
        <CmsPaginaBannerFields
          dark showTitulo={false}
          imageLabel="Fondo por defecto — detalle de artículo"
          storagePath={paginasBanner.detalle_banner_url_imagen}
          previewSrc={detalleBannerPreview}
          onImageSelect={onDetalleSelect}
        />
      </Box>

      <Button fullWidth variant="contained"
        sx={{ bgcolor: "#7c3aed", mt: 1.5, "&:hover": { bgcolor: "#6d28d9" } }}
        onClick={onSaveBanners} disabled={saving}>
        Guardar banners
      </Button>
    </Box>
  </CmsPanelRoot>
);

/* ══════════════════════════════════════════════════════════════
   CANVAS — Preview exacto del frontend
══════════════════════════════════════════════════════════════ */
const CanvasPreview = ({ items, seccion, activeCat, setActiveCat, onEdit, onDelete, onAdd, onConfig }) => {
  // filtro
  const filtered = activeCat === "Todas"
    ? items
    : items.filter(i => (i.categoria || i.chip || "") === activeCat);

  const [featured, ...rest] = filtered;

  return (
    <Box sx={{
      bgcolor: "#fdf8f5", borderRadius: "16px",
      border: "1px solid #e8d5c0", overflow: "hidden",
      boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
    }}>
      {/* ── Encabezado sección ── */}
      <Box sx={{
        bgcolor: "#fff", py: 5, px: { xs: 2, md: 4 },
        borderBottom: "1px solid #f0e8e0", textAlign: "center",
        position: "relative",
      }}>
        {/* Config icon */}
        <Tooltip title="Editar encabezado y banners" placement="top">
          <IconButton onClick={onConfig} size="small" sx={{
            position: "absolute", top: 14, right: 14,
            bgcolor: "rgba(124,58,237,0.12)", color: "#7c3aed",
            border: "1.5px solid rgba(124,58,237,0.25)", width: 34, height: 34,
            "&:hover": { bgcolor: "rgba(124,58,237,0.25)" }, transition: "all 0.2s",
          }}>
            <TitleIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        {/* Líneas + supertag */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, maxWidth: 80, height: "1px", bgcolor: "#cc6b8e", opacity: 0.5 }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 800, letterSpacing: "3px",
            textTransform: "uppercase", color: "#cc6b8e" }}>
            {seccion.subtitulo || "BIENESTAR & LIFESTYLE"}
          </Typography>
          <Box sx={{ flex: 1, maxWidth: 80, height: "1px", bgcolor: "#cc6b8e", opacity: 0.5 }} />
        </Box>

        <Typography sx={{ fontFamily: "'PT Serif',serif",
          fontSize: { xs: "1.9rem", md: "2.6rem" },
          fontWeight: 900, color: "#2c1a0e", lineHeight: 1.2 }}>
          {seccion.titulo
            ? <span dangerouslySetInnerHTML={{ __html: seccion.titulo }} />
            : "Publicaciones Recientes"}
        </Typography>
      </Box>

      {/* ── Tabs categoría ── */}
      <Box sx={{ bgcolor: "#fdf8f5", px: { xs: 2, md: 4 }, py: 2.5,
        borderBottom: "1px solid #f0e8e0",
        display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        {CATS.map(c => (
          <CatTab key={c} label={c} active={activeCat === c} onClick={() => setActiveCat(c)} />
        ))}
      </Box>

      {/* ── Cards ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        {filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, color: "#aaa" }}>
            <ArticleIcon sx={{ fontSize: 56, opacity: 0.15, display: "block", mx: "auto", mb: 2 }} />
            <Typography sx={{ fontSize: "0.90rem" }}>No hay publicaciones en esta categoría.</Typography>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={onAdd}
              sx={{ mt: 2, borderColor: "#cc6b8e", color: "#cc6b8e" }}>
              Agregar publicación
            </Button>
          </Box>
        ) : (
          <>
            {/* Tarjeta destacada (primera) */}
            {featured && (
              <FeaturedCard
                item={featured}
                onEdit={() => onEdit(featured)}
                onDelete={() => onDelete(featured)}
              />
            )}

            {/* Grid 3 columnas */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              "@media(max-width:900px)": { gridTemplateColumns: "repeat(2,1fr)" },
              "@media(max-width:600px)": { gridTemplateColumns: "1fr" },
            }}>
              {rest.map(item => (
                <NormalCard
                  key={item.id_publicacion}
                  item={item}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item)}
                />
              ))}
              <AddCard onClick={onAdd} />
            </Box>
          </>
        )}
      </Box>

      {/* Footer info */}
      <Box sx={{ bgcolor: "#fff", px: 4, py: 2, borderTop: "1px solid #f0e8e0",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {CATS.filter(c => c !== "Todas").map(c => {
            const n = items.filter(i => (i.categoria || i.chip || "") === c).length;
            return n > 0 ? (
              <Chip key={c} label={`${c}: ${n}`} size="small"
                sx={{ fontSize: "10px", bgcolor: "#f5e8f0", color: "#831843", fontWeight: 600 }} />
            ) : null;
          })}
        </Box>
        <Typography sx={{ fontSize: "11px", color: "#aaa" }}>Canvas · Preview real del frontend</Typography>
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function PublicacionesIndexPage() {
  const { panelLeft } = useCmsPanelLayout();

  const [panelMode, setPanelMode] = useState(null); // null | "edit" | "config"
  const panelOpen = !!panelMode;
  useCmsPanelPush(panelOpen);

  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [items,   setItems]     = useState([]);
  const [seccion, setSeccion]   = useState({ titulo: "", subtitulo: "" });
  const [edit,    setEdit]      = useState(null);
  const [isNew,   setIsNew]     = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [activeCat, setActiveCat] = useState("Todas");

  // imágenes
  const [preview,       setPreview]       = useState(null);
  const [file,          setFile]          = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile,    setBannerFile]    = useState(null);

  // banners de páginas
  const [paginasBanner,       setPaginasBanner]       = useState({});
  const [listadoBannerPreview,setListadoBannerPreview]= useState(null);
  const [listadoBannerFile,   setListadoBannerFile]   = useState(null);
  const [detalleBannerPreview,setDetalleBannerPreview]= useState(null);
  const [detalleBannerFile,   setDetalleBannerFile]   = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setSeccion({ titulo: data?.seccion_titulo ?? "", subtitulo: data?.seccion_subtitulo ?? "" });
      setPaginasBanner(data?.paginas_banner ?? {});
      setItems(data?.items ?? []);
    } catch (e) { handleErrorMessages(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openEdit = (item) => {
    setEdit(item ? { ...item, contenido: item.contenido ?? "" } : {
      titulo: "", slug: "", resumen: "", contenido: "",
      autor: "Royal Masajes", categoria: "Bienestar",
      chip: "Bienestar", fecha_publicacion: new Date().toISOString().slice(0, 10),
    });
    setIsNew(!item);
    setFile(null); setPreview(null);
    setBannerFile(null); setBannerPreview(null);
    setEditorOpen(false);
    setPanelMode("edit");
  };

  const closePanel = () => {
    setPanelMode(null);
    setEditorOpen(false);
    setFile(null); setPreview(null);
    setBannerFile(null); setBannerPreview(null);
  };

  const handleSave = async () => {
    if (!edit?.titulo?.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      const fields = ["titulo","slug","resumen","contenido","autor","categoria","fecha_publicacion","chip"];
      fields.forEach(k => fd.append(k, edit[k] || ""));
      if (!isNew) fd.append("id_publicacion", edit.id_publicacion);
      if (file)       fd.append("image",        file);
      if (bannerFile) fd.append("banner_image",  bannerFile);
      isNew ? await crear(fd) : await actualizar(fd);
      toastSuccess(isNew ? "Publicación creada" : "Publicación actualizada");
      closePanel();
      await load();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const handleSaveSeccion = async () => {
    setSaving(true);
    try { await actualizar_seccion(seccion); toastSuccess("Encabezado actualizado"); await load(); }
    catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const handleSaveBanners = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("listado_banner_titulo", paginasBanner.listado_banner_titulo || "");
      if (listadoBannerFile) fd.append("listado_banner_image", listadoBannerFile);
      if (detalleBannerFile) fd.append("detalle_banner_image", detalleBannerFile);
      await actualizar_paginas_banner(fd);
      toastSuccess("Banners guardados");
      setListadoBannerPreview(null); setListadoBannerFile(null);
      setDetalleBannerPreview(null); setDetalleBannerFile(null);
      await load();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await eliminar({ id_publicacion: delTarget.id_publicacion });
      toastSuccess("Publicación eliminada");
      setDelTarget(null); await load();
    } catch (e) { handleErrorMessages(e); }
  };

  if (loading)
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress sx={{ color: "#cc6b8e" }} /></Box>;

  /* ── si el editor está abierto, modo pantalla completa ── */
  if (editorOpen && panelMode === "edit") {
    return (
      <PageBox>
        <TinyEditor
          edit={edit} setEdit={setEdit}
          onBack={() => setEditorOpen(false)}
          onSave={handleSave} saving={saving}
        />
      </PageBox>
    );
  }

  return (
    <>
      {/* Panel edición publicación */}
      {panelMode === "edit" && (
        <EditPanel
          open panelLeft={panelLeft}
          edit={edit} setEdit={setEdit} isNew={isNew} saving={saving}
          preview={preview} onImgSelect={(f) => { setFile(f); setPreview(URL.createObjectURL(f)); }}
          bannerPreview={bannerPreview} onBannerSelect={(f) => { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); }}
          onOpenEditor={() => setEditorOpen(true)}
          onSave={handleSave} onClose={closePanel}
        />
      )}

      {/* Panel config sección/banners */}
      {panelMode === "config" && (
        <ConfigPanel
          open panelLeft={panelLeft}
          seccion={seccion} setSeccion={setSeccion}
          paginasBanner={paginasBanner} setPaginasBanner={setPaginasBanner}
          listadoBannerPreview={listadoBannerPreview}
          onListadoSelect={(f) => { setListadoBannerFile(f); setListadoBannerPreview(URL.createObjectURL(f)); }}
          detalleBannerPreview={detalleBannerPreview}
          onDetalleSelect={(f) => { setDetalleBannerFile(f); setDetalleBannerPreview(URL.createObjectURL(f)); }}
          saving={saving}
          onSaveSeccion={handleSaveSeccion}
          onSaveBanners={handleSaveBanners}
          onClose={closePanel}
        />
      )}

      <PageBox>
        {/* Barra superior */}
        <HeaderBar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ArticleIcon sx={{ fontSize: 17, opacity: 0.9 }} />
            <Typography sx={{ fontSize: "0.83rem", fontWeight: 700 }}>Publicaciones</Typography>
            <Typography sx={{ fontSize: "0.72rem", opacity: 0.6, ml: 0.5 }}>
              · {items.length} artículos
            </Typography>
          </Box>
          <Button size="small" variant="contained" startIcon={<AddIcon />}
            onClick={() => openEdit(null)}
            sx={{ bgcolor: "#cc6b8e", fontWeight: 700, borderRadius: "20px",
              fontSize: "0.75rem", px: 2, "&:hover": { bgcolor: "#a0455e" } }}>
            + Nueva publicación
          </Button>
        </HeaderBar>

        {/* Canvas */}
        <CanvasPreview
          items={items}
          seccion={seccion}
          activeCat={activeCat}
          setActiveCat={setActiveCat}
          onEdit={openEdit}
          onDelete={(item) => setDelTarget(item)}
          onAdd={() => openEdit(null)}
          onConfig={() => setPanelMode("config")}
        />
      </PageBox>

      {/* Confirmar eliminar */}
      <Dialog open={!!delTarget} onClose={() => setDelTarget(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar esta publicación?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelTarget(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
