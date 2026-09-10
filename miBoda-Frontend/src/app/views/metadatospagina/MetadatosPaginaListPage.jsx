import React, { useMemo } from "react";
import DataGrid, {
  Column, Pager, Paging, FilterRow,
  Button as ColumnButton, SearchPanel,
} from "devextreme-react/data-grid";
import {
  Box, Paper, Typography, Stack, Chip, Tooltip, IconButton, Tab, Tabs,
} from "@mui/material";
import AddIcon            from "@mui/icons-material/Add";
import TravelExploreIcon  from "@mui/icons-material/TravelExplore";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import CancelIcon         from "@mui/icons-material/Cancel";
import ArticleIcon        from "@mui/icons-material/Article";
import VisibilityOffIcon  from "@mui/icons-material/VisibilityOff";
import { metadatosPublicUrl } from "../../utils/metadatosPublicUrls";

/* ─── Stat Card (clickeable) ─── */
function StatCard({ icon, label, value, color, onClick }) {
  const isClickable = Boolean(onClick);
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2.5, flex: 1, borderRadius: 3,
        display: "flex", alignItems: "center", gap: 2,
        border: `1px solid ${isClickable ? `${color}33` : "#e2e8f0"}`,
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        cursor: isClickable ? "pointer" : "default",
        transition: "all 0.18s ease",
        userSelect: "none",
        ...(isClickable && {
          "&:hover": {
            boxShadow: `0 4px 16px ${color}22`,
            transform: "translateY(-2px)",
            borderColor: `${color}55`,
          },
          "&:active": { transform: "translateY(0px)" },
        }),
      }}
    >
      <Box sx={{
        width: 44, height: 44, borderRadius: 2,
        bgcolor: `${color}1a`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
          {value}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500, mt: 0.25 }}>
            {label}
          </Typography>
          {isClickable && (
            <Typography sx={{ fontSize: "0.62rem", color, fontWeight: 700, mt: 0.25, opacity: 0.7 }}>
              Ver →
            </Typography>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}

/* ─── Main ─── */
const MetadatosPaginaListPage = ({
  metadatos = [],
  vista,
  tabValue   = 0,
  onTabChange,
  countsMap  = { activos: 0, inactivos: 0 },   // ← totales reales de ambos tabs
  ...props
}) => {
  const editarRegistro  = (e) => props.editarRegistro(e.row.data);
  const desactivarClick = (e) => props.pedirDesactivar(e.row.data);
  const restaurarClick  = (e) => props.pedirRestaurar(e.row.data);

  /* Stats usan countsMap (ambos tabs), NO el array filtrado actual */
  const stats = useMemo(() => ({
    total:     countsMap.activos + countsMap.inactivos,
    activos:   countsMap.activos,
    inactivos: countsMap.inactivos,
  }), [countsMap]);

  /* Celda estado */
  const cellEstado = (e) => {
    const ok = e.data.activo === "S";
    return (
      <Chip size="small"
        icon={ok
          ? <CheckCircleIcon sx={{ fontSize: "13px !important" }} />
          : <CancelIcon      sx={{ fontSize: "13px !important" }} />}
        label={ok ? "Activa" : "Inactiva"}
        sx={{
          bgcolor: ok ? "#dcfce7" : "#fee2e2",
          color:   ok ? "#15803d" : "#dc2626",
          fontWeight: 700, fontSize: "0.68rem",
          border: `1px solid ${ok ? "#86efac" : "#fca5a5"}`,
          "& .MuiChip-icon": { color: ok ? "#15803d" : "#dc2626" },
        }}
      />
    );
  };

  /* Celda slug */
  const cellSlug = (e) => {
    const url = metadatosPublicUrl(e.data.nombre_pagina);
    return (
    <Box>
      <Box sx={{
        display: "inline-flex", alignItems: "center", gap: 0.75,
        bgcolor: "#f1f5f9", borderRadius: 1.5,
        px: 1.2, py: 0.3,
        border: "1px solid #e2e8f0",
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#94a3b8", flexShrink: 0 }} />
        <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#475569", fontFamily: "monospace" }}>
          {e.data.nombre_pagina}
        </Typography>
      </Box>
      {url && (
        <Typography sx={{ fontSize: "0.68rem", color: "#0f766e", fontWeight: 600, mt: 0.4, fontFamily: "monospace" }}>
          {url}
        </Typography>
      )}
    </Box>
    );
  };

  /* Celda título */
  const cellTitulo = (e) => (
    <Box>
      <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#0f172a", lineHeight: 1.3, mb: 0.25 }}>
        {e.data.titulo_pagina}
      </Typography>
      <Typography sx={{
        fontSize: "0.72rem", color: "#64748b", lineHeight: 1.4,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {e.data.descripcion_pagina}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ px: 3.5, py: 3, minHeight: "100vh", bgcolor: "#f1f5f9" }}>

      {/* ── Header (con tabs embebidas) ── */}
      <Paper sx={{
        mb: 3, borderRadius: 3, overflow: "hidden",
        background: "linear-gradient(135deg, #0f172a 0%, #134e4a 55%, #0f766e 100%)",
        boxShadow: "0 4px 20px rgba(15,118,110,0.28)",
      }}>
        {/* Top row */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: onTabChange ? 0 : 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <TravelExploreIcon sx={{ color: "#fff", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
                  Metadatos de Página
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
                  SEO · Títulos y descripciones para cada página del sitio web
                </Typography>
              </Box>
            </Stack>

            {props.accessButton?.crear && (
              <Tooltip title="Nueva página (metadatos)" placement="left">
                <IconButton onClick={props.nuevoRegistro} sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff", width: 40, height: 40, borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.25)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* ── Tabs glass-style dentro del header ── */}
        {onTabChange && (
          <Box sx={{ px: 2.5, pb: 0 }}>
            <Tabs
              value={tabValue}
              onChange={(_, v) => onTabChange(v)}
              sx={{
                mt: 1.5,
                minHeight: 40,
                "& .MuiTabs-indicator": {
                  backgroundColor: "#5eead4",
                  height: 2.5,
                  borderRadius: "2px 2px 0 0",
                },
                "& .MuiTab-root": {
                  minHeight: 40,
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  textTransform: "none",
                  letterSpacing: 0,
                  color: "rgba(255,255,255,0.55)",
                  px: 2,
                  "&.Mui-selected": { color: "#fff" },
                  "&:hover:not(.Mui-selected)": { color: "rgba(255,255,255,0.85)" },
                },
              }}
            >
              <Tab
                value={0}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <CheckCircleIcon sx={{ fontSize: 14 }} />
                    <span>Páginas activas</span>
                    {countsMap.activos > 0 && (
                      <Box sx={{
                        px: 0.8, py: 0.05,
                        bgcolor: tabValue === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                        color: "#fff",
                        borderRadius: 99, fontSize: "0.62rem", fontWeight: 700, lineHeight: 1.7,
                      }}>
                        {countsMap.activos}
                      </Box>
                    )}
                  </Stack>
                }
              />
              <Tab
                value={1}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <VisibilityOffIcon sx={{ fontSize: 14 }} />
                    <span>Inactivas</span>
                    {countsMap.inactivos > 0 && (
                      <Box sx={{
                        px: 0.8, py: 0.05,
                        bgcolor: tabValue === 1 ? "rgba(239,68,68,0.55)" : "rgba(239,68,68,0.25)",
                        color: "#fff",
                        borderRadius: 99, fontSize: "0.62rem", fontWeight: 700, lineHeight: 1.7,
                      }}>
                        {countsMap.inactivos}
                      </Box>
                    )}
                  </Stack>
                }
              />
            </Tabs>
          </Box>
        )}
      </Paper>

      {/* ── Stats (clickeables) ── */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <StatCard
          icon={<ArticleIcon />}
          label="Total páginas"
          value={stats.total}
          color="#0f766e"
        />
        <StatCard
          icon={<CheckCircleIcon />}
          label="Páginas activas"
          value={stats.activos}
          color="#16a34a"
          onClick={onTabChange ? () => onTabChange(0) : undefined}
        />
        <StatCard
          icon={<VisibilityOffIcon />}
          label="Inactivas"
          value={stats.inactivos}
          color="#dc2626"
          onClick={onTabChange ? () => onTabChange(1) : undefined}
        />
      </Stack>

      {/* ── DataGrid ── */}
      <Paper sx={{
        borderRadius: 3, overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        "& .dx-datagrid": { fontFamily: "'Inter','Roboto',sans-serif" },
        "& .dx-datagrid-headers .dx-header-row td": {
          fontSize: "0.70rem !important",
          fontWeight: "700 !important",
          color: "#475569 !important",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          borderBottom: "2px solid #e2e8f0 !important",
          padding: "12px 8px !important",
          background: "#f8fafc !important",
        },
        "& .dx-datagrid-rowsview .dx-row > td": {
          padding: "10px 8px !important",
          verticalAlign: "middle",
        },
        "& .dx-datagrid-rowsview .dx-row:hover td": {
          background: "#f0fdfa !important",
        },
      }}>
        <DataGrid
          key={`metadatos-${vista}`}
          keyExpr="id"
          className="dx-card wide-card"
          dataSource={metadatos}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={false}
          rowAlternationEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} infoText="Pág. {0} de {1} ({2} registros)" />
          <FilterRow visible={false} />
          <SearchPanel visible={true} highlightCaseSensitive={true} placeholder="Buscar página…" />

          <Column dataField="id" caption="#" width={60} alignment="center"
            cellRender={(e) => (
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f766e",
                bgcolor: "#f0fdfa", borderRadius: 1, px: 0.75, py: 0.2, display: "inline-block" }}>
                {e.data.id}
              </Typography>
            )}
          />

          <Column dataField="nombre_pagina" caption="Slug / URL"        width={220} cellRender={cellSlug}   />
          <Column dataField="titulo_pagina" caption="Título y descripción"            cellRender={cellTitulo} />
          <Column dataField="activo"        caption="Estado" width={110}  alignment="center" cellRender={cellEstado} />

          <Column
            dataField="created_at" caption="Registrado"
            dataType="datetime" format="dd/MM/yyyy" width={115} alignment="center"
            cellRender={(e) => (
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                {e.text || "—"}
              </Typography>
            )}
          />

          <Column type="buttons" caption="Acciones" width={90} alignment="center" fixedPosition="right">
            <ColumnButton icon="edit"  hint="Editar metadatos"             onClick={editarRegistro}  visible={props.accessButton?.editar}   />
            {vista === "activos" ? (
              <ColumnButton icon="close" hint="Desactivar (no se elimina)" onClick={desactivarClick} visible={props.accessButton?.eliminar} />
            ) : (
              <ColumnButton icon="undo"  hint="Restaurar registro"         onClick={restaurarClick}  visible={props.accessButton?.editar}   />
            )}
          </Column>
        </DataGrid>
      </Paper>
    </Box>
  );
};

export default MetadatosPaginaListPage;
