import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, IconButton, Tooltip, CircularProgress, Button,
  TextField, MenuItem, Select, InputLabel, FormControl, Divider,
  Stack, Dialog, DialogTitle, DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon          from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon           from "@mui/icons-material/Add";
import SaveIcon          from "@mui/icons-material/Save";
import CloseIcon         from "@mui/icons-material/Close";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PhotoLibraryIcon  from "@mui/icons-material/PhotoLibrary";
import TitleIcon         from "@mui/icons-material/Title";
import CategoryIcon      from "@mui/icons-material/Category";

import {
  listar, crear, actualizar, eliminar, actualizarSeccion,
  crearCategoria, actualizarCategoria, eliminarCategoria,
} from "../../../api/web_pagina_galeria.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot      from "app/components/cms/CmsPanelRoot";
import { CMS_SELECT_MENU_PROPS } from "app/components/cms/cmsSelectMenuProps";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
import CmsStorageImage from "app/components/cms/CmsStorageImage";

const buildTabs = (categorias = []) => [
  { v: "todas", l: "Todas", id: null },
  ...categorias.map((c) => ({ v: c.slug, l: c.nombre, id: c.id })),
];

const catLabel = (categorias, slug) =>
  buildTabs(categorias).find((c) => c.v === slug)?.l || slug;

/* ── Helpers de estilo ──────────────────────────────────────── */
const PageBox = styled(Box)({
  padding: 16, minHeight: "100vh", backgroundColor: "#f0f4f8",
});

const HeaderBar = styled(Box)({
  padding: "8px 14px", marginBottom: 16, borderRadius: 10,
  background: "linear-gradient(135deg,#44403c,#a16207)",
  color: "#fff", display: "flex", alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 3px 12px rgba(68,64,60,0.3)",
});

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(161,98,7,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#b8860b" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#b8860b" },
}));

const DarkSelect = styled(Select)(() => ({
  backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(161,98,7,0.6)" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#b8860b" },
  "& .MuiSelect-icon": { color: "#94a3b8" },
}));

const SectionTag = styled(Typography)({
  fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase", color: "#b8860b", marginBottom: 6, marginTop: 2,
});

const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

/* ── Tab de filtro (igual que el frontend) ──────────────────── */
const CatTab = ({ label, active, onClick }) => (
  <Box component="button" onClick={onClick} sx={{
    px: "22px", py: "9px", borderRadius: "50px",
    border: `1.5px solid ${active ? "transparent" : "#d4b896"}`,
    background: active ? "linear-gradient(135deg,#b8860b,#8b6508)" : "#fff",
    color: active ? "#fff" : "#7a5c1e",
    fontSize: "13px", fontWeight: 700, cursor: "pointer",
    letterSpacing: "0.3px", whiteSpace: "nowrap",
    boxShadow: active ? "0 4px 16px rgba(184,134,11,0.35)" : "none",
    transform: active ? "translateY(-1px)" : "none",
    transition: "all 0.22s ease",
    "&:hover": {
      background: "linear-gradient(135deg,#b8860b,#8b6508)",
      color: "#fff", border: "1.5px solid transparent",
    },
  }}>
    {label}
  </Box>
);

/* ── Subida de imagen ────────────────────────────────────────── */
const ImgUpload = ({ preview, storagePath, absoluteUrl, onFile, onRemove, open }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) { onRemove(); if (ref.current) ref.current.value = ""; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hasImage = Boolean(preview || storagePath || absoluteUrl);
  return (
    <Box sx={{ mb: 1.5 }}>
      <input type="file" ref={ref} accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <Box onClick={() => ref.current?.click()} sx={{
        width: "100%", height: 170, borderRadius: 2, overflow: "hidden",
        border: `2px dashed ${hasImage ? "rgba(161,98,7,0.6)" : "rgba(255,255,255,0.18)"}`,
        bgcolor: "rgba(255,255,255,0.05)", display: "flex",
        alignItems: "center", justifyContent: "center",
        cursor: "pointer", position: "relative",
        "&:hover": { borderColor: "#b8860b" },
        "&:hover .cam-ov": { opacity: 1 },
      }}>
        {hasImage ? (
          <>
            <CmsStorageImage
              storagePath={storagePath}
              absoluteUrl={absoluteUrl}
              previewSrc={preview}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Box className="cam-ov" sx={{
              position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.5)",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", opacity: 0, transition: "opacity 0.25s",
            }}>
              <PhotoCameraIcon sx={{ color: "#fff", fontSize: 26 }} />
              <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.60rem", mt: 0.3 }}>
                Cambiar foto
              </Typography>
            </Box>
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, color: "#475569" }}>
            <ImageOutlinedIcon sx={{ fontSize: 40, opacity: 0.4 }} />
            <Typography variant="caption" sx={{ fontSize: "0.62rem" }}>Clic para subir imagen</Typography>
          </Box>
        )}
      </Box>
      {preview && (
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, gap: 0.4 }}>
          <IconButton size="small" sx={{ color: "#ef4444", p: 0.3 }} onClick={onRemove}>
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.60rem" }}>
            Nueva imagen lista ✓
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/* ── Lápiz flotante ─────────────────────────────────────────── */
const Pencil = ({ onClick, tip = "Editar" }) => (
  <Tooltip title={tip} placement="top">
    <IconButton onClick={onClick} size="small" sx={{
      position: "absolute", top: 8, right: 8, zIndex: 20,
      bgcolor: "rgba(0,0,0,0.65)", color: "#fff",
      width: 30, height: 30, backdropFilter: "blur(4px)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
      "&:hover": { bgcolor: "#b8860b", transform: "scale(1.1)" },
      transition: "all 0.2s",
    }}>
      <EditIcon sx={{ fontSize: 14 }} />
    </IconButton>
  </Tooltip>
);

/* ── Botón eliminar flotante ────────────────────────────────── */
const TrashBtn = ({ onClick }) => (
  <Tooltip title="Eliminar" placement="top">
    <IconButton onClick={onClick} size="small" sx={{
      position: "absolute", top: 8, right: 46, zIndex: 20,
      bgcolor: "rgba(239,68,68,0.82)", color: "#fff",
      width: 30, height: 30, backdropFilter: "blur(4px)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      "&:hover": { bgcolor: "#dc2626", transform: "scale(1.1)" },
      transition: "all 0.2s",
    }}>
      <DeleteOutlineIcon sx={{ fontSize: 14 }} />
    </IconButton>
  </Tooltip>
);

/* ── Tarjeta de imagen galería (igual que frontend) ─────────── */
const GalleryCard = ({ item, onEdit, onDelete, categorias }) => {
  const [hov, setHov] = useState(false);
  const hasImage = Boolean(item._preview || item.url_imagen || item.url_imagen_publica);

  return (
    <Box
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      sx={{
        position: "relative", borderRadius: "14px", overflow: "hidden",
        aspectRatio: "4/3", bgcolor: "#e8d5c0",
        boxShadow: hov ? "0 10px 32px rgba(0,0,0,0.18)" : "0 3px 14px rgba(0,0,0,0.10)",
        transform: hov ? "translateY(-4px)" : "none",
        transition: "all 0.35s ease",
        cursor: "pointer",
      }}>

      {/* Imagen */}
      {hasImage ? (
        <CmsStorageImage
          storagePath={item.url_imagen}
          absoluteUrl={item.url_imagen_publica}
          previewSrc={item._preview}
          alt={item.alt_imagen || item.titulo_overlay}
          sx={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transform: hov ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.55s ease",
          }}
        />
      ) : (
        <Box sx={{ width: "100%", height: "100%", display: "flex",
          alignItems: "center", justifyContent: "center", color: "#c8a882" }}>
          <ImageOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
        </Box>
      )}

      {/* Overlay gradiente inferior */}
      <Box sx={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)",
        opacity: hov ? 1 : 0,
        transition: "opacity 0.35s ease",
      }} />

      {/* Label overlay (igual que frontend) */}
      {item.titulo_overlay && (
        <Box sx={{
          position: "absolute", bottom: 12, left: 12,
          bgcolor: "rgba(255,255,255,0.95)",
          color: "#2c1a0e",
          fontSize: "11px", fontWeight: 700,
          letterSpacing: "0.5px",
          px: 1.5, py: "4px", borderRadius: "50px",
          opacity: hov ? 1 : 0,
          transform: hov ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          {item.titulo_overlay}
        </Box>
      )}

      {/* Chip categoría (siempre visible, top-left) */}
      <Box sx={{
        position: "absolute", top: 10, left: 10,
        bgcolor: "rgba(184,134,11,0.88)",
        color: "#fff", fontSize: "9px", fontWeight: 800,
        letterSpacing: "1.2px", textTransform: "uppercase",
        px: 1.2, py: "3px", borderRadius: "50px",
        backdropFilter: "blur(4px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}>
        {catLabel(categorias, item.categoria)}
      </Box>

      {/* Botones admin (top-right) */}
      <Pencil onClick={onEdit}   tip={`Editar: ${item.titulo_overlay || "imagen"}`} />
      <TrashBtn onClick={onDelete} />
    </Box>
  );
};

/* ── Panel lateral de edición ───────────────────────────────── */
const EditPanel = ({
  open, panelLeft, form, preview, saving, isNew, categorias,
  onFormChange, onFile, onRemoveFile, onSave, onClose,
}) => (
  <CmsPanelRoot open={open} panelLeft={panelLeft}>
    {/* Header */}
    <Box sx={{
      px: 2, py: 1.5, display: "flex", alignItems: "flex-start",
      justifyContent: "space-between", gap: 1,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}
          sx={{ color: "#f1f5f9", fontSize: "0.82rem" }}>
          {isNew ? "Agregar imagen" : "Editar imagen"}
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
          {form.titulo_overlay || "Galería Royal"}
        </Typography>
      </Box>
      <IconButton size="small" onClick={onClose}
        sx={{ color: "#94a3b8", "&:hover": { color: "#b8860b" } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>

    {/* Campos */}
    <Box sx={{ px: 2, py: 1.5, flex: 1, overflow: "auto" }}>
      <SectionTag>Imagen</SectionTag>
      <ImgUpload
        preview={preview}
        storagePath={form.url_imagen}
        absoluteUrl={form.url_imagen_publica}
        onFile={onFile}
        onRemove={onRemoveFile}
        open={open}
      />
      <Sep />

      <SectionTag>Clasificación</SectionTag>
      <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
        <InputLabel sx={{ color: "#94a3b8", "&.Mui-focused": { color: "#b8860b" } }}>
          Categoría
        </InputLabel>
        <DarkSelect
          value={form.categoria || categorias[0]?.slug || ""}
          label="Categoría"
          onChange={(e) => onFormChange("categoria", e.target.value)}
          MenuProps={CMS_SELECT_MENU_PROPS}>
          {categorias.map((c) => (
            <MenuItem key={c.slug} value={c.slug}
              sx={{ fontSize: "0.82rem", "&:hover": { bgcolor: "rgba(184,134,11,0.15)" } }}>
              {c.nombre}
            </MenuItem>
          ))}
        </DarkSelect>
      </FormControl>

      <DarkField size="small" fullWidth label="Etiqueta overlay (ej: Masaje Sensorial)"
        sx={{ mb: 1.5 }}
        value={form.titulo_overlay || ""}
        onChange={(e) => onFormChange("titulo_overlay", e.target.value)} />

      <DarkField size="small" fullWidth label="Alt imagen (SEO)"
        sx={{ mb: 1.5 }}
        value={form.alt_imagen || ""}
        onChange={(e) => onFormChange("alt_imagen", e.target.value)} />

      <DarkField size="small" fullWidth label="Orden (número)" type="number"
        sx={{ mb: 1.5 }}
        value={form.orden || ""}
        onChange={(e) => onFormChange("orden", e.target.value)} />
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
          sx={{ bgcolor: "#b8860b", fontWeight: 700, "&:hover": { bgcolor: "#8b6508" } }}>
          {saving ? "Guardando…" : "Guardar imagen"}
        </Button>
        <Button variant="outlined" onClick={onClose}
          sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
          <CloseIcon fontSize="small" />
        </Button>
      </Stack>
    </Box>
  </CmsPanelRoot>
);

/* ── Panel edición de texto de sección ──────────────────────── */
const HeaderPanel = ({
  open, panelLeft, seccion, saving,
  onChange, onSave, onClose,
}) => (
  <CmsPanelRoot open={open} panelLeft={panelLeft}>
    <Box sx={{
      px: 2, py: 1.5, display: "flex", alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
    }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", fontSize: "0.82rem" }}>
        Encabezado de la galería
      </Typography>
      <IconButton size="small" onClick={onClose}
        sx={{ color: "#94a3b8", "&:hover": { color: "#b8860b" } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
    <Box sx={{ px: 2, py: 2, flex: 1 }}>
      <SectionTag>Supertag (texto dorado superior)</SectionTag>
      <DarkField size="small" fullWidth label="Supertag (ej: Nuestra Galería)"
        sx={{ mb: 1.5 }}
        value={seccion.seccion_subtitulo || ""}
        onChange={(e) => onChange("seccion_subtitulo", e.target.value)} />
      <Sep />
      <SectionTag>Título principal</SectionTag>
      <DarkField size="small" fullWidth label="Título (ej: Ambiente Diseñado Para Tus Sentidos)"
        sx={{ mb: 1.5 }} multiline rows={2}
        value={seccion.seccion_titulo || ""}
        onChange={(e) => onChange("seccion_titulo", e.target.value)} />
    </Box>
    <Box sx={{
      px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
      bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
    }}>
      <Button fullWidth variant="contained"
        startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
        onClick={onSave} disabled={saving}
        sx={{ bgcolor: "#b8860b", fontWeight: 700, "&:hover": { bgcolor: "#8b6508" } }}>
        {saving ? "Guardando…" : "Guardar encabezado"}
      </Button>
    </Box>
  </CmsPanelRoot>
);

/* ── Panel gestión de categorías ─────────────────────────────── */
const CategoriesPanel = ({
  open, panelLeft, categorias, catEdit, saving,
  onCatEdit, onSaveCat, onDeleteCat, onClose,
}) => (
  <CmsPanelRoot open={open} panelLeft={panelLeft}>
    <Box sx={{
      px: 2, py: 1.5, display: "flex", alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
    }}>
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", fontSize: "0.82rem" }}>
          Categorías de galería
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem" }}>
          Aparecen como filtros en la web pública
        </Typography>
      </Box>
      <IconButton size="small" onClick={onClose}
        sx={{ color: "#94a3b8", "&:hover": { color: "#b8860b" } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>

    <Box sx={{ px: 2, py: 1.5, flex: 1, overflow: "auto" }}>
      <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", mb: 1.5, lineHeight: 1.6 }}>
        Crea, edita o elimina categorías. No puedes eliminar una categoría que tenga imágenes asignadas.
      </Typography>

      {categorias.map((c) => (
        <Box key={c.id ?? c.slug} sx={{
          mb: 1, p: 1.2, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1,
          border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 1,
        }}>
          <Box flex={1}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>{c.nombre}</Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>slug: {c.slug}</Typography>
          </Box>
          <IconButton size="small" sx={{ color: "#b8860b" }} onClick={() => onCatEdit({ ...c })}>
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
          {c.id && (
            <IconButton size="small" sx={{ color: "#f87171" }} onClick={() => onDeleteCat(c.id)}>
              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
      ))}

      <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
        onClick={() => onCatEdit({ nombre: "", slug: "" })}
        sx={{ color: "#b8860b", textTransform: "none", fontSize: "0.75rem", mt: 0.5 }}>
        Nueva categoría
      </Button>

      {catEdit && (
        <Box sx={{
          mt: 2, p: 1.5, bgcolor: "rgba(184,134,11,0.12)", borderRadius: 1,
          border: "1px solid rgba(184,134,11,0.3)",
        }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#b8860b", mb: 1 }}>
            {catEdit.id ? "Editar categoría" : "Nueva categoría"}
          </Typography>
          <DarkField size="small" fullWidth label="Nombre visible (ej: Sensorial)"
            sx={{ mb: 1.2 }}
            value={catEdit.nombre || ""}
            onChange={(e) => onCatEdit((p) => ({ ...p, nombre: e.target.value }))} />
          <DarkField size="small" fullWidth label="Slug interno (opcional)"
            sx={{ mb: 1.2 }}
            value={catEdit.slug || ""}
            onChange={(e) => onCatEdit((p) => ({ ...p, slug: e.target.value }))}
            helperText="Solo letras minúsculas y guiones bajos. Se genera automático si lo dejas vacío."
            FormHelperTextProps={{ sx: { color: "rgba(255,255,255,0.35)", fontSize: "0.58rem" } }} />
          <Stack direction="row" gap={1}>
            <Button size="small" variant="contained" onClick={onSaveCat} disabled={saving}
              sx={{ bgcolor: "#b8860b", textTransform: "none", fontWeight: 700, fontSize: "0.75rem",
                "&:hover": { bgcolor: "#8b6508" } }}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
            <Button size="small" onClick={() => onCatEdit(null)}
              sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", fontSize: "0.75rem" }}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  </CmsPanelRoot>
);

/* ══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function PaginaGaleriaIndexPage() {
  const { panelLeft } = useCmsPanelLayout();

  const [panelMode,  setPanelMode]  = useState(null); // null | "img" | "header" | "cats"
  const panelOpen = !!panelMode;
  useCmsPanelPush(panelOpen);

  const [seccion,  setSeccion]  = useState({});
  const [items,    setItems]    = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({ id_galeria: null, categoria: "", titulo_overlay: "", alt_imagen: "", orden: "" });
  const [catEdit,  setCatEdit]  = useState(null);
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [delId,    setDelId]    = useState(null);
  const [delCatId, setDelCatId] = useState(null);
  const [activeCat,setActiveCat]= useState("todas");

  const tabs = buildTabs(categorias);
  const defaultCat = categorias[0]?.slug || "sensorial";

  const load = async () => {
    setLoading(true);
    try {
      const r = await listar();
      setSeccion(r?.seccion ?? {});
      setItems(r?.items ?? []);
      setCategorias(r?.categorias ?? []);
    } catch (e) { handleErrorMessages(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openImg = (item) => {
    setForm(item
      ? { ...item }
      : { id_galeria: null, categoria: defaultCat, titulo_overlay: "", alt_imagen: "", orden: "" });
    setFile(null);
    setPreview(null);
    setCatEdit(null);
    setPanelMode("img");
  };

  const closePanel = () => {
    setPanelMode(null);
    setFile(null);
    setPreview(null);
    setCatEdit(null);
    setForm({ id_galeria: null, categoria: "", titulo_overlay: "", alt_imagen: "", orden: "" });
  };

  const handleFile = (f) => {
    setFile(f);
    const r = new FileReader();
    r.onload = (ev) => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const handleFormChange = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const handleSeccionChange = (key, val) => setSeccion(p => ({ ...p, [key]: val }));

  const saveImg = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("categoria",     form.categoria);
      fd.append("titulo_overlay",form.titulo_overlay || "");
      fd.append("alt_imagen",    form.alt_imagen || "");
      if (form.orden) fd.append("orden", form.orden);
      if (form.id_galeria) {
        fd.append("id_galeria", form.id_galeria);
        if (file) fd.append("image", file);
        const updated = await actualizar(fd);
        if (updated?.id_galeria) {
          setItems((prev) => prev.map((i) => (
            i.id_galeria === updated.id_galeria ? { ...i, ...updated } : i
          )));
        }
        toastSuccess("Imagen actualizada");
      } else {
        if (!file) { handleErrorMessages({ message: "Selecciona una imagen" }); setSaving(false); return; }
        fd.append("image", file);
        const created = await crear(fd);
        if (created?.id_galeria) {
          setItems((prev) => [...prev, created]);
        }
        toastSuccess("Imagen agregada");
      }
      closePanel();
      load();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const saveSeccion = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("seccion_titulo",    seccion.seccion_titulo || "");
      fd.append("seccion_subtitulo", seccion.seccion_subtitulo || "");
      await actualizarSeccion(fd);
      toastSuccess("Encabezado actualizado");
      closePanel();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await eliminar(delId);
      toastSuccess("Imagen eliminada");
      setDelId(null);
      load();
    } catch (e) { handleErrorMessages(e); }
  };

  const handleCatEdit = (value) => {
    if (typeof value === "function") setCatEdit((prev) => value(prev));
    else setCatEdit(value);
  };

  const saveCategoria = async () => {
    if (!catEdit?.nombre?.trim()) {
      handleErrorMessages({ message: "Escribe el nombre de la categoría" });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nombre", catEdit.nombre.trim());
      if (catEdit.slug?.trim()) fd.append("slug", catEdit.slug.trim());
      if (catEdit.id) {
        fd.append("id", catEdit.id);
        await actualizarCategoria(fd);
        toastSuccess("Categoría actualizada");
      } else {
        await crearCategoria(fd);
        toastSuccess("Categoría creada");
      }
      setCatEdit(null);
      await load();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const doDeleteCategoria = async () => {
    try {
      await eliminarCategoria(delCatId);
      toastSuccess("Categoría eliminada");
      setDelCatId(null);
      if (activeCat !== "todas") {
        const stillExists = categorias.some((c) => c.id !== delCatId && c.slug === activeCat);
        if (!stillExists) setActiveCat("todas");
      }
      load();
    } catch (e) { handleErrorMessages(e); }
  };

  /* Filtrado */
  const filtered = activeCat === "todas"
    ? items
    : items.filter(i => i.categoria === activeCat);

  /* Preview en tiempo real en canvas (solo mientras el panel de imagen está abierto) */
  const displayItems = panelMode === "img" && form.id_galeria
    ? items.map((i) => {
        if (i.id_galeria !== form.id_galeria) return i;
        return { ...i, ...form, _preview: preview || null };
      })
    : items;
  const filteredDisplay = activeCat === "todas"
    ? displayItems
    : displayItems.filter(i => i.categoria === activeCat);

  const countOf = (cat) => items.filter(i => i.categoria === cat).length;

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress sx={{ color: "#b8860b" }} />
      </Box>
    );

  return (
    <>
      {/* Panel edición imagen */}
      {panelMode === "img" && (
        <EditPanel
          open={true} panelLeft={panelLeft}
          form={form} preview={preview} saving={saving}
          isNew={!form.id_galeria}
          categorias={categorias}
          onFormChange={handleFormChange}
          onFile={handleFile}
          onRemoveFile={() => { setFile(null); setPreview(null); }}
          onSave={saveImg}
          onClose={closePanel}
        />
      )}

      {panelMode === "cats" && (
        <CategoriesPanel
          open={true} panelLeft={panelLeft}
          categorias={categorias} catEdit={catEdit} saving={saving}
          onCatEdit={handleCatEdit}
          onSaveCat={saveCategoria}
          onDeleteCat={setDelCatId}
          onClose={closePanel}
        />
      )}

      {/* Panel edición encabezado */}
      {panelMode === "header" && (
        <HeaderPanel
          open={true} panelLeft={panelLeft}
          seccion={seccion} saving={saving}
          onChange={handleSeccionChange}
          onSave={saveSeccion}
          onClose={closePanel}
        />
      )}

      <PageBox>
        {/* ── Barra superior ── */}
        <HeaderBar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PhotoLibraryIcon sx={{ fontSize: 17, opacity: 0.9 }} />
            <Typography sx={{ fontSize: "0.83rem", fontWeight: 700 }}>Galería Royal</Typography>
            <Typography sx={{ fontSize: "0.72rem", opacity: 0.6, ml: 0.5 }}>
              · {items.length} imágenes
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<CategoryIcon sx={{ fontSize: 15 }} />}
              onClick={() => { setCatEdit(null); setPanelMode("cats"); }}
              sx={{ borderColor: "rgba(255,255,255,0.35)", color: "#fff", fontWeight: 700, borderRadius: "20px",
                fontSize: "0.72rem", px: 1.5, "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}>
              Categorías
            </Button>
            <Tooltip title="Agregar imagen" placement="left">
            <Button size="small" variant="contained" startIcon={<AddIcon />}
              onClick={() => openImg(null)}
              sx={{ bgcolor: "#f97316", fontWeight: 700, borderRadius: "20px",
                fontSize: "0.75rem", px: 2, "&:hover": { bgcolor: "#ea580c" } }}>
              + Agregar imagen
            </Button>
          </Tooltip>
          </Box>
        </HeaderBar>

        {/* ══ CANVAS — replica del frontend ══ */}
        <Box sx={{
          bgcolor: "#fff", borderRadius: "16px",
          border: "1px solid #e8d5c0", overflow: "hidden",
          boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        }}>

          {/* ── Cabecera de sección (igual que frontend) ── */}
          <Box sx={{
            position: "relative",
            textAlign: "center",
            py: 6, px: { xs: 2, md: 4 },
            borderBottom: "1px solid #f0e8e0",
            bgcolor: "#fff",
          }}>
            {/* Lápiz encabezado */}
            <Tooltip title="Editar encabezado" placement="top">
              <IconButton
                onClick={() => setPanelMode("header")}
                size="small"
                sx={{
                  position: "absolute", top: 14, right: 14,
                  bgcolor: "rgba(184,134,11,0.12)", color: "#b8860b",
                  border: "1.5px solid rgba(184,134,11,0.3)",
                  width: 34, height: 34,
                  "&:hover": { bgcolor: "rgba(184,134,11,0.25)" },
                  transition: "all 0.2s",
                }}>
                <TitleIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            {/* Supertag dorado */}
            <Typography sx={{
              fontSize: "11px", fontWeight: 800, letterSpacing: "3px",
              textTransform: "uppercase", color: "#b8860b", mb: 1.5,
            }}>
              {seccion.seccion_subtitulo || "Nuestra Galería"}
            </Typography>

            {/* Título grande */}
            <Typography sx={{
              fontFamily: "'PT Serif',serif",
              fontSize: { xs: "1.8rem", md: "2.8rem" },
              fontWeight: 900, color: "#1a1208", lineHeight: 1.2,
              maxWidth: 700, mx: "auto",
            }}>
              {seccion.seccion_titulo || "Ambiente Diseñado Para Tus Sentidos"}
            </Typography>
          </Box>

          {/* ── Tabs de categoría ── */}
          <Box sx={{
            position: "relative",
            bgcolor: "#fdf8f5", px: { xs: 2, md: 4 }, py: 3,
            borderBottom: "1px solid #f0e8e0",
            display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center",
          }}>
            <Tooltip title="Gestionar categorías" placement="top">
              <IconButton
                onClick={() => { setCatEdit(null); setPanelMode("cats"); }}
                size="small"
                sx={{
                  position: "absolute", top: 10, right: 10,
                  bgcolor: "rgba(184,134,11,0.12)", color: "#b8860b",
                  border: "1.5px solid rgba(184,134,11,0.3)",
                  width: 32, height: 32,
                  "&:hover": { bgcolor: "rgba(184,134,11,0.25)" },
                }}>
                <CategoryIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            {tabs.map(c => (
              <CatTab
                key={c.v} label={c.l}
                active={activeCat === c.v}
                onClick={() => setActiveCat(c.v)}
              />
            ))}
          </Box>

          {/* ── Grid 4 columnas ── */}
          <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: "#fff" }}>
            {filteredDisplay.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8, color: "#aaa" }}>
                <PhotoLibraryIcon sx={{ fontSize: 56, opacity: 0.15, display: "block", mx: "auto", mb: 2 }} />
                <Typography sx={{ fontSize: "0.90rem" }}>
                  {activeCat === "todas"
                    ? "No hay imágenes en la galería aún."
                    : `No hay imágenes en la categoría "${catLabel(categorias, activeCat)}".`}
                </Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />}
                  onClick={() => openImg(null)}
                  sx={{ mt: 2, borderColor: "#b8860b", color: "#b8860b" }}>
                  Agregar imagen
                </Button>
              </Box>
            ) : (
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                "@media(max-width:900px)": { gridTemplateColumns: "repeat(2,1fr)" },
                "@media(max-width:500px)": { gridTemplateColumns: "1fr" },
              }}>
                {filteredDisplay.map(item => (
                  <GalleryCard
                    key={item.id_galeria}
                    item={item}
                    categorias={categorias}
                    onEdit={() => openImg(item)}
                    onDelete={() => setDelId(item.id_galeria)}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* ── Footer info ── */}
          <Box sx={{
            bgcolor: "#fdf8f5", px: 4, py: 2,
            borderTop: "1px solid #f0e8e0",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 1,
          }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {categorias.map(c => (
                <Typography key={c.slug} sx={{ fontSize: "11px", color: "#888" }}>
                  <Box component="span" sx={{ color: "#b8860b", fontWeight: 700 }}>{c.nombre}</Box>
                  {" "}{countOf(c.slug)}
                </Typography>
              ))}
            </Box>
            <Typography sx={{ fontSize: "11px", color: "#aaa" }}>
              Canvas · Preview real del frontend
            </Typography>
          </Box>
        </Box>
      </PageBox>

      {/* Confirmar eliminación */}
      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar esta imagen?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!delCatId} onClose={() => setDelCatId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar esta categoría?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelCatId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doDeleteCategoria}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
