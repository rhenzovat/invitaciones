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
  Box, Typography, Paper, Stack, Chip, Button,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import StorageIcon from "@mui/icons-material/Storage";
import DownloadIcon from "@mui/icons-material/Download";

/* ══════════ STYLED ══════════ */
const PageWrap = styled(Box)(() => ({
  padding: "24px 28px",
  minHeight: "100vh",
  backgroundColor: "#f7f3f0",
}));

/* ══════════ FORMAT BYTES ══════════ */
function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return "—";
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

/* ══════════ COMPONENT ══════════ */
const BackupListPage = (props) => {
  const { accessButton } = props;

  const descargarRegistro = (evt) => props.descargarBackup(evt.row.data);
  const eliminarRegistro  = (evt) => props.eliminarRegistro(evt.row.data, false);

  const total = props.listarBackups?.length ?? 0;

  return (
    <PageWrap>

      {/* ── Header ── */}
      <Paper sx={{
        p: 2.5, mb: 3, borderRadius: "14px",
        background: "linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)",
        boxShadow: "0 6px 25px rgba(44,26,14,0.35)",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 46, height: 46, borderRadius: "12px",
              background: "linear-gradient(135deg,#b8860b,#8b6508)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(184,134,11,0.4)",
            }}>
              <StorageIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
                {props.titulo || "Base de datos — Backups"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
                Genera y descarga respaldos de la base de datos
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Chip
              label={`${total} backups`}
              size="small"
              sx={{
                bgcolor: "rgba(184,134,11,0.25)",
                color: "#fde68a",
                fontWeight: 700,
                border: "1px solid rgba(184,134,11,0.4)",
              }}
            />
            <Button
              variant="contained"
              startIcon={<BackupIcon />}
              onClick={props.generarBackup}
              size="small"
              sx={{
                background: "linear-gradient(135deg,#b8860b,#8b6508)",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                boxShadow: "0 3px 10px rgba(184,134,11,0.35)",
                "&:hover": { background: "linear-gradient(135deg,#8b6508,#6b4e06)" },
              }}
            >
              Generar Backup
            </Button>
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
          background: "rgba(184,134,11,0.05) !important",
        },
        "& .dx-datagrid-rowsview .dx-row td": {
          padding: "12px 12px !important",
          fontSize: "0.84rem",
          color: "#2c1a0e",
        },
      }}>
        <DataGrid
          keyExpr="id_backup"
          className="dx-card wide-card"
          dataSource={props.listarBackups}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} infoText="Página {0} de {1} ({2} registros)" />
          <FilterRow visible={false} />
          <SearchPanel visible={true} highlightCaseSensitive={true} placeholder="Buscar archivo…" />

          <Column
            dataField="id_backup"
            caption="Código"
            width={90}
            alignment="center"
            cellRender={(e) => (
              <Typography sx={{
                fontSize: "0.78rem", fontWeight: 700,
                color: "#4a2a15",
                bgcolor: "rgba(184,134,11,0.12)", borderRadius: 1,
                px: 1, py: 0.25, display: "inline-block",
              }}>
                {String(e.data.id_backup ?? "—")}
              </Typography>
            )}
          />

          <Column
            dataField="nombre_archivo"
            caption="Archivo"
            cellRender={(e) => (
              <Stack direction="row" alignItems="center" spacing={1}>
                <DownloadIcon sx={{ fontSize: 16, color: "#b8860b" }} />
                <Typography sx={{ fontSize: "0.83rem", fontWeight: 600, color: "#2c1a0e" }}>
                  {e.data.nombre_archivo}
                </Typography>
              </Stack>
            )}
          />

          <Column
            dataField="tipo"
            caption="Tipo"
            width={120}
            alignment="center"
            cellRender={(e) => (
              <Chip
                label={e.data.tipo || "SQL"}
                size="small"
                sx={{
                  bgcolor: "rgba(74,42,21,0.1)",
                  color: "#4a2a15",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  border: "1px solid rgba(74,42,21,0.2)",
                }}
              />
            )}
          />

          <Column
            dataField="tamaño"
            caption="Tamaño"
            width={130}
            alignment="center"
            cellRender={(e) => (
              <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
                {formatBytes(e.data["tamaño"])}
              </Typography>
            )}
          />

          <Column
            dataField="created_at"
            caption="Fecha"
            dataType="date"
            format="dd/MM/yyyy HH:mm"
            alignment="center"
            width={160}
            cellRender={(e) => {
              const txt = e.text || (e.value instanceof Date
                ? e.value.toLocaleString("es-PE")
                : String(e.value ?? "—"));
              return (
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>{txt}</Typography>
              );
            }}
          />

          <Column
            type="buttons"
            fixed={true}
            fixedPosition="right"
            caption="Acciones"
            width={100}
            alignment="center"
          >
            <ColumnButton icon="download" hint="Descargar" onClick={descargarRegistro} visible={true} />
            <ColumnButton icon="trash"    hint="Eliminar"  onClick={eliminarRegistro}  visible={true} />
          </Column>
        </DataGrid>
      </Paper>

    </PageWrap>
  );
};

export default BackupListPage;
