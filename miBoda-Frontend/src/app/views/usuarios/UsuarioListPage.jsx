import React from "react";
import { styled } from "@mui/material/styles";
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
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import StarIcon from "@mui/icons-material/Star";

/* ══════════ STYLED ══════════ */
const PageWrap = styled(Box)(() => ({
  padding: "24px 28px",
  minHeight: "100vh",
  backgroundColor: "#f7f3f0",
}));

/* ══════════ STATUS CHIP ══════════ */
function cellEstadoRender(e) {
  const isActive = e.data.status === "active" || e.data.Activo === "S";
  return (
    <Chip
      size="small"
      icon={
        isActive
          ? <CheckCircleIcon sx={{ fontSize: "14px !important" }} />
          : <CancelIcon sx={{ fontSize: "14px !important" }} />
      }
      label={isActive ? "Activo" : "Inactivo"}
      sx={{
        bgcolor: isActive ? "#dcfce7" : "#fee2e2",
        color: isActive ? "#15803d" : "#dc2626",
        fontWeight: 700, fontSize: "0.68rem",
        border: `1px solid ${isActive ? "#86efac" : "#fca5a5"}`,
        "& .MuiChip-icon": { color: isActive ? "#15803d" : "#dc2626" },
      }}
    />
  );
}

/* ══════════ COMPONENT ══════════ */
const UsuarioListPage = (props) => {
  const { accessButton } = props;

  const editarRegistro   = (evt) => props.editarRegistro(evt.row.data);
  const eliminarRegistro = (evt) => props.eliminarRegistro(evt.row.data, false);
  const openModalPerfil  = (evt) => props.seleccionarPerfil(evt.row.data);

  const total = props.listarUsuario?.length ?? 0;

  return (
    <PageWrap>

      {/* ── Header ── */}
      <Paper sx={{
        p: 2.5, mb: 3, borderRadius: "14px",
        background: "linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)",
        boxShadow: "0 6px 25px rgba(44,26,14,0.35)",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 46, height: 46, borderRadius: "12px",
              background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(160,69,94,0.4)",
            }}>
              <GroupIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
                {props.titulo || "Gestión de Usuarios"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
                Administra las cuentas de acceso al sistema
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Chip
              label={`${total} usuarios`}
              size="small"
              sx={{
                bgcolor: "rgba(204,107,142,0.25)",
                color: "#f5c6d8",
                fontWeight: 700,
                border: "1px solid rgba(204,107,142,0.4)",
              }}
            />
            {accessButton.crear && (
              <Tooltip title="Nuevo usuario" placement="left">
                <IconButton
                  onClick={props.nuevoRegistro}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    width: 40, height: 40,
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.25)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Paper>

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
        "& .dx-datagrid-rowsview .dx-row:hover td": {
          background: "rgba(204,107,142,0.06) !important",
        },
        "& .dx-datagrid-rowsview .dx-row td": {
          padding: "12px 12px !important",
          fontSize: "0.84rem",
          color: "#2c1a0e",
        },
      }}>
        <DataGrid
          keyExpr="id"
          className="dx-card wide-card"
          dataSource={props.listarUsuario}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} infoText="Página {0} de {1} ({2} registros)" />
          <FilterRow visible={false} />
          <SearchPanel visible={true} highlightCaseSensitive={true} placeholder="Buscar usuario…" />

          <Column
            dataField="id"
            caption="ID"
            width={80}
            alignment="center"
            cellRender={(e) => (
              <Typography sx={{
                fontSize: "0.78rem", fontWeight: 700,
                color: "#4a2a15",
                bgcolor: "rgba(184,134,11,0.12)", borderRadius: 1,
                px: 1, py: 0.25, display: "inline-block",
              }}>
                {String(e.data.id ?? "—")}
              </Typography>
            )}
          />

          <Column
            dataField="name"
            caption="Nombre"
            cellRender={(e) => (
              <Stack direction="row" alignItems="center" spacing={1}>
                {e.data.es_administrador_principal && (
                  <StarIcon sx={{ fontSize: 14, color: "#b8860b" }} />
                )}
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#2c1a0e" }}>
                  {e.data.name}
                </Typography>
              </Stack>
            )}
          />

          <Column
            dataField="email"
            caption="Email"
            cellRender={(e) => (
              <Typography sx={{ fontSize: "0.82rem", color: "#4a5568" }}>
                {e.data.email}
              </Typography>
            )}
          />

          <Column
            dataField="created_at"
            caption="Fecha Creación"
            dataType="date"
            format="dd/MM/yyyy"
            alignment="center"
            width={140}
            cellRender={(e) => {
              const txt = e.text || (e.value instanceof Date
                ? e.value.toLocaleDateString("es-PE")
                : String(e.value ?? "—"));
              return (
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>{txt}</Typography>
              );
            }}
          />

          <Column
            dataField="status"
            caption="Estado"
            width={110}
            alignment="center"
            cellRender={cellEstadoRender}
          />

          <Column
            type="buttons"
            caption="Asig. Perfil"
            width={100}
            alignment="center"
            visible={accessButton.agregar_perfil ? true : false}
          >
            <ColumnButton icon="bulletlist" hint="Asignar Permisos" onClick={openModalPerfil} />
          </Column>

          <Column
            type="buttons"
            caption="Acciones"
            width={100}
            alignment="center"
            visible={true}
          >
            <ColumnButton icon="edit"  hint="Editar"   onClick={editarRegistro}   visible={accessButton.editar ? true : false} />
            <ColumnButton icon="trash" hint="Eliminar" onClick={eliminarRegistro} visible={accessButton.eliminar ? true : false} />
          </Column>
        </DataGrid>
      </Paper>

    </PageWrap>
  );
};

export default UsuarioListPage;
