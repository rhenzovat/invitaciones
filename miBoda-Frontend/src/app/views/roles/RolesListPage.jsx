import React, { useEffect, useMemo } from "react";
import { styled } from "@mui/material/styles";
import { useIntl, injectIntl } from "react-intl";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Button as ColumnButton,
  SearchPanel,
} from "devextreme-react/data-grid";
import {
  Box, Typography, Paper, Stack, Chip, Tooltip, IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShieldIcon from "@mui/icons-material/Shield";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";

/* ═══════════ STYLED ═══════════ */
const PageWrap = styled(Box)(() => ({
  padding: "24px 28px",
  minHeight: "100vh",
  backgroundColor: "#f7f3f0",
}));

/* ═══════════ STAT CARD ═══════════ */
function StatCard({ icon, label, value, color }) {
  return (
    <Paper sx={{
      p: 2.5, flex: 1, borderRadius: 3,
      display: "flex", alignItems: "center", gap: 2,
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2,
        bgcolor: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
      </Box>
      <Box>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500, mt: 0.25 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

/* ═══════════ MAIN COMPONENT ═══════════ */
const RolesListPage = (props) => {
  const { accessButton, setLoading } = props;
  const intl = useIntl();

  const editarRegistro  = (evt) => props.editarRegistro(evt.row.data);
  const eliminarRegistro = (evt) => props.eliminarRegistro(evt.row.data, false);
  const asignarPemisos  = (evt) => props.asignarPemisos(evt.row.data);
  const copiarPermisos  = (evt) => props.abrirCopiarPermisos?.(evt.row.data);

  /* Stats */
  const stats = useMemo(() => {
    const total   = props.listarUsuario?.length ?? 0;
    const activos = props.listarUsuario?.filter((r) => r.Activo === "S").length ?? 0;
    return { total, activos, inactivos: total - activos };
  }, [props.listarUsuario]);

  /* Status badge */
  const cellEstadoRender = (e) => {
    const isActive = e.data.Activo === "S";
    return (
      <Chip
        size="small"
        icon={isActive
          ? <CheckCircleIcon sx={{ fontSize: "14px !important" }} />
          : <CancelIcon sx={{ fontSize: "14px !important" }} />}
        label={isActive ? "Activo" : "Inactivo"}
        sx={{
          bgcolor: isActive ? "#dcfce7" : "#fee2e2",
          color:   isActive ? "#15803d" : "#dc2626",
          fontWeight: 700, fontSize: "0.68rem",
          border: `1px solid ${isActive ? "#86efac" : "#fca5a5"}`,
          "& .MuiChip-icon": { color: isActive ? "#15803d" : "#dc2626" },
        }}
      />
    );
  };

  useEffect(() => { setLoading(false); }, []);

  return (
    <PageWrap>
      {/* ── Header ── */}
      <Paper sx={{
        p: 2.5, mb: 3, borderRadius: 3,
        background: "linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)",
        boxShadow: "0 6px 25px rgba(44,26,14,0.35)",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
                Gestión de Roles
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
                Administra los perfiles de acceso del sistema
              </Typography>
            </Box>
          </Stack>

          {accessButton.crear && (
            <Tooltip title="Nuevo rol" placement="left">
              <IconButton
                onClick={props.nuevoRegistro}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  width: 40, height: 40,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.25)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Paper>

      {/* ── Stats ── */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <StatCard icon={<PeopleAltIcon />}    label="Total de roles"    value={stats.total}    color="#4a2a15" />
        <StatCard icon={<CheckCircleIcon />}  label="Roles activos"     value={stats.activos}  color="#16a34a" />
        <StatCard icon={<CancelIcon />}       label="Roles inactivos"   value={stats.inactivos} color="#dc2626" />
      </Stack>

      {/* ── DataGrid ── */}
      <Paper sx={{
        borderRadius: "16px", overflow: "hidden",
        border: "1px solid rgba(204,107,142,0.15)",
        boxShadow: "0 2px 12px rgba(44,26,14,0.08)",
        "& .dx-datagrid": { fontFamily: "'Inter','Roboto',sans-serif" },
        "& .dx-datagrid-headers": {
          background: "linear-gradient(135deg, #fdf8f5, #f5eae4)",
          "& .dx-header-row td": {
            fontSize: "0.72rem !important",
            fontWeight: "700 !important",
            color: "#4a2a15 !important",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderBottom: "2px solid rgba(184,134,11,0.2) !important",
            padding: "14px 12px !important",
          },
        },
        "& .dx-datagrid-rowsview .dx-row": {
          transition: "background 0.15s",
        },
        "& .dx-datagrid-rowsview .dx-row:hover td": {
          background: "rgba(204,107,142,0.06) !important",
        },
        "& .dx-datagrid-rowsview .dx-row td": {
          padding: "12px 12px !important",
          fontSize: "0.84rem",
          color: "#2c1a0e",
        },
        "& .dx-datagrid-search-panel input": {
          borderRadius: "8px",
        },
      }}>
        <DataGrid
          keyExpr="id_roles"
          className="dx-card wide-card"
          dataSource={props.listarUsuario}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />
          <FilterRow visible={false} />
          <SearchPanel visible={true} highlightCaseSensitive={true} placeholder="Buscar rol…" />

          <Column
            dataField="id_roles"
            caption="#"
            width={70}
            alignment="center"
            cellRender={(e) => (
              <Typography sx={{
                fontSize: "0.78rem", fontWeight: 700,
                color: "#4a2a15",
                bgcolor: "rgba(184,134,11,0.12)", borderRadius: 1,
                px: 1, py: 0.25, display: "inline-block",
              }}>
                {String(e.data.id_roles ?? "—")}
              </Typography>
            )}
          />

          <Column
            dataField="nombre"
            caption="Nombre del Rol"
            cellRender={(e) => (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{
                  width: 7, height: 7, borderRadius: "50%",
                  bgcolor: e.data.Activo === "S" ? "#22c55e" : "#ef4444",
                  flexShrink: 0,
                }} />
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>
                  {e.data.nombre}
                </Typography>
              </Stack>
            )}
          />

          <Column
            dataField="created_at"
            caption="Creado"
            dataType="date"
            format="dd/MM/yyyy"
            alignment="center"
            width={120}
            cellRender={(e) => {
              /* e.text es siempre string en DevExtreme; evita [object Date] */
              const txt = e.text || (e.value instanceof Date
                ? e.value.toLocaleDateString("es-PE")
                : String(e.value ?? "—"));
              return (
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>
                  {txt}
                </Typography>
              );
            }}
          />

          <Column
            dataField="Activo"
            caption="Estado"
            width={110}
            alignment="center"
            cellRender={cellEstadoRender}
          />

          {/* COLUMNA DE PERMISOS: Forzada para que sea siempre visible */}
          <Column
            type="buttons"
            name="asignarMenu"
            caption="Permisos"
            width={90}
            alignment="center"
            visible={true}
          >
            <ColumnButton 
              icon="bulletlist" 
              hint="Asignar permisos" 
              onClick={asignarPemisos} 
              visible={true} 
            />
          </Column>

          <Column
            type="buttons"
            name="operaciones"
            caption="Acciones"
            width={100}
            alignment="center"
            visible={true}
          >
            <ColumnButton icon="copy"   hint="Copiar permisos a otro rol" onClick={copiarPermisos} visible={accessButton.agregar_permiso ? true : false} />
            <ColumnButton icon="edit"   hint="Editar"                     onClick={editarRegistro}  visible={accessButton.editar ? true : false} />
            <ColumnButton icon="trash"  hint="Eliminar"                   onClick={eliminarRegistro} visible={accessButton.eliminar ? true : false} />
          </Column>
        </DataGrid>
      </Paper>
    </PageWrap>
  );
};

export default injectIntl(WithLoandingPanel(RolesListPage));
