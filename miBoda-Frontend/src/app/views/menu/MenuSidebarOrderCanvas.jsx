import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { alpha } from "@mui/material/styles";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import MenuIcon from "@mui/icons-material/Menu";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MenuSidebarIcon from "./MenuSidebarIcon";

const rowSx = (isDragOver, isDragging) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  px: 2,
  py: 1.25,
  mb: 1,
  borderRadius: 2,
  border: "1px solid",
  borderColor: isDragOver ? "#f97316" : "rgba(255,255,255,0.14)",
  bgcolor: isDragging
    ? "rgba(249,115,22,0.12)"
    : isDragOver
      ? "rgba(255,255,255,0.10)"
      : "rgba(255,255,255,0.06)",
  boxShadow: isDragOver ? "0 4px 16px rgba(0,0,0,0.35)" : "none",
  opacity: isDragging ? 0.55 : 1,
  cursor: "grab",
  transition: "box-shadow 0.15s, border-color 0.15s, opacity 0.15s, background-color 0.15s",
  "&:active": { cursor: "grabbing" },
  "&:hover": {
    bgcolor: "rgba(255,255,255,0.09)",
    borderColor: "rgba(255,255,255,0.22)",
  },
});

/**
 * Lienzo drag & drop del orden del sidebar (menús raíz sin módulo + módulos).
 */
export default function MenuSidebarOrderCanvas({
  items = [],
  loading = false,
  saving = false,
  rolNombre = null,
  autoSave = false,
  onReorder,
  onOrderChange,
  onEditItem,
  editingPreview = null,
  hintText = null,
  saveButtonLabel = "Guardar cambios",
}) {
  const [localItems, setLocalItems] = useState(items);
  const [isDirty, setIsDirty] = useState(false);
  const dragIdxRef = useRef(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => {
    setLocalItems(items);
    setIsDirty(false);
  }, [items]);

  const buildPayload = (list) => list.map((it, i) => ({
    tipo: it.tipo,
    id_menu: it.id_menu ?? undefined,
    id_modulo: it.id_modulo ?? undefined,
    orden: i,
    nombre_sidebar: (it.nombre || "").trim() || undefined,
    icon_sidebar: (it.icon || "").trim() || undefined,
  }));

  const handleDragStart = (idx) => {
    dragIdxRef.current = idx;
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdxRef.current !== null && dragIdxRef.current !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    const fromIdx = dragIdxRef.current;
    dragIdxRef.current = null;
    setDragOverIdx(null);
    if (fromIdx === null || fromIdx === dropIdx) return;

    const next = [...localItems];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(dropIdx, 0, moved);
    setLocalItems(next);
    if (autoSave) {
      onReorder?.(buildPayload(next));
    } else {
      setIsDirty(true);
      onOrderChange?.(next);
    }
  };

  const handleSaveOrder = () => {
    if (!isDirty || saving) return;
    onReorder?.(buildPayload(localItems));
  };

  const handleDragEnd = () => {
    dragIdxRef.current = null;
    setDragOverIdx(null);
  };

  const itemKey = (it) => (it?.tipo === "modulo" ? `m-${it.id_modulo}` : `n-${it.id_menu}`);

  const resolveDisplayItem = (item) => {
    if (!editingPreview?.key) return item;
    if (itemKey(item) !== editingPreview.key) return item;
    return {
      ...item,
      nombre: editingPreview.nombre ?? item.nombre,
      icon: editingPreview.icon ?? item.icon,
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (!localItems.length) {
    return (
      <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
        <MenuIcon sx={{ fontSize: 48, opacity: 0.25, mb: 1 }} />
        <Typography>No hay ítems activos para ordenar en el sidebar</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {hintText || (
            <>
              Arrastre las filas para definir el orden del menú lateral
              {rolNombre ? ` del rol «${rolNombre}»` : ""}.
              {autoSave
                ? " Los cambios se guardan al soltar."
                : ` Pulse «${saveButtonLabel}» cuando termine.`}
            </>
          )}
        </Typography>
        {!autoSave && isDirty && (
          <Button
            variant="contained"
            size="small"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveOrder}
            disabled={saving}
            sx={{
              ml: "auto",
              bgcolor: "#f97316",
              "&:hover": { bgcolor: "#ea580c" },
            }}
          >
            {saving ? "Guardando…" : saveButtonLabel}
          </Button>
        )}
        {autoSave && saving && <Chip size="small" color="primary" label="Guardando…" />}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          maxWidth: 520,
          bgcolor: (t) => alpha(t.palette.grey[900], 0.92),
          backgroundImage: (t) =>
            `linear-gradient(180deg, ${alpha(t.palette.grey[800], 0.4)} 0%, ${alpha(t.palette.grey[900], 0.15)} 100%)`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 1.5,
            px: 1,
            color: "grey.500",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Vista previa — sidebar
        </Typography>

        {localItems.map((item, idx) => {
          const display = resolveDisplayItem(item);
          const esModulo = display.tipo === "modulo";
          const isDragging = dragIdxRef.current === idx;
          const isDragOver = dragOverIdx === idx;
          const iconValue = display.icon ?? display.Icon ?? null;
          const titulo = (display.nombre || "").trim()
            || (esModulo ? `Módulo #${display.id_modulo}` : `Menú #${display.id_menu}`);
          const subtitulo = esModulo
            ? (display.hijos_count > 0 ? `${display.hijos_count} submenú(s)` : "Módulo sin submenús")
            : (display.hijos_count > 0 ? `${display.hijos_count} subnivel(es)` : "Enlace en sidebar");

          return (
            <Box
              key={esModulo ? `mod-${display.id_modulo}` : `menu-${display.id_menu}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                handleDragStart(idx);
              }}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              sx={rowSx(isDragOver, isDragging)}
            >
              <Tooltip title="Arrastrar">
                <DragIndicatorIcon sx={{ color: "rgba(255,255,255,0.45)", fontSize: 22 }} />
              </Tooltip>
              <Chip
                size="small"
                label={idx + 1}
                sx={{
                  height: 24,
                  minWidth: 28,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  bgcolor: "rgba(15,23,42,0.85)",
                  color: "#e2e8f0",
                  border: "1px solid rgba(255,255,255,0.12)",
                  flexShrink: 0,
                }}
              />
              <MenuSidebarIcon icon={iconValue} esModulo={esModulo} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{ color: "#f8fafc", lineHeight: 1.35, fontSize: "0.9rem" }}
                  noWrap
                  title={titulo}
                >
                  {titulo}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(148,163,184,0.95)", fontSize: "0.68rem", display: "block" }}
                  noWrap
                >
                  {subtitulo}
                </Typography>
              </Box>
              {onEditItem && (
                <Tooltip title="Editar nombre">
                  <IconButton
                    size="small"
                    draggable={false}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item);
                    }}
                    sx={{
                      color: "rgba(255,255,255,0.45)",
                      flexShrink: 0,
                      "&:hover": { color: "#f97316", bgcolor: "rgba(249,115,22,0.12)" },
                    }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
}
