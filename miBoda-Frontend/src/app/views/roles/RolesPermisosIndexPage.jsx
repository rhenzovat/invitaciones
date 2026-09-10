import React, { useEffect, useRef, useState, useMemo } from "react";
import { useIntl, injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import {
  Box, Typography, Paper, Stack, Button, Chip,
  CircularProgress, Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import MenuTreeViewPage from "../../partials/content/TreeView/MenuTreeViewPage";
import { handleErrorMessages } from "../../components/notify-messages";
import { listar_treeview } from "../../api/roles.api";
import {
  collectCheckedPayload,
  resolveTreeViewInstance,
} from "../../utils/treeviewPermisosUtils";

/* ═══════════ STYLED ═══════════ */
const PageWrap = styled(Box)(() => ({
  padding: "24px 28px",
  minHeight: "100vh",
  backgroundColor: "#f1f5f9",
}));

/* ═══════════ MAIN ═══════════ */
const RolesPermisosIndexPage = (props) => {
  const { setLoading } = props;
  const intl = useIntl();
  const [listaDatosModulos, setListaDatosModulos] = useState([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const treeViewRef = useRef(null);

  function grabar() {
    const instance = resolveTreeViewInstance(treeViewRef);
    if (!instance) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        new Error("No se pudo leer el árbol de permisos. Espere a que cargue e intente de nuevo.")
      );
      return null;
    }
    const payload = collectCheckedPayload(instance);
    if (payload.length === 0) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        new Error("Seleccione al menos un módulo, menú u objeto en el árbol.")
      );
      return null;
    }
    props.agregarPermisos(payload.join("|"));
    return payload.join("|");
  }

  function obtenerPayloadActual() {
    const instance = resolveTreeViewInstance(treeViewRef);
    if (!instance) return null;
    const payload = collectCheckedPayload(instance);
    return payload.length > 0 ? payload.join("|") : null;
  }

  useEffect(() => {
    let cancelled = false;
    if (props.detalleRol?.id_roles) {
      setListaDatosModulos([]);
      setLoadingTree(true);
      listar_treeview({ id_roles: props.detalleRol.id_roles })
        .then((data) => {
          if (!cancelled) setListaDatosModulos(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (!cancelled) {
            handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err);
            setListaDatosModulos([]);
          }
        })
        .finally(() => { if (!cancelled) setLoadingTree(false); });
    }
    setLoading(false);
    return () => { cancelled = true; };
  }, [props.detalleRol?.id_roles]);

  // eslint-disable-next-line no-unused-vars
  const checkedCount = useMemo(() => {
    if (!Array.isArray(listaDatosModulos)) return 0;
    const count = (nodes) => nodes.reduce((acc, n) => acc + (n.selected ? 1 : 0) + count(n.items ?? []), 0);
    return count(listaDatosModulos);
  }, [listaDatosModulos]);

  return (
    <PageWrap>
      {/* ── Header ── */}
      <Paper sx={{
        p: 2.5, mb: 3, borderRadius: 3,
        background: "linear-gradient(135deg, #0f172a 0%, #4c1d95 60%, #7c3aed 100%)",
        boxShadow: "0 4px 20px rgba(124,58,237,0.28)",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <LockPersonIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
                  Permisos del Rol
                </Typography>
                <Chip
                  label={props.detalleRol?.nombre ?? "—"}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
                Selecciona los menús y módulos que tendrá acceso este rol
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Replicar permisos a otro rol">
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => props.abrirCopiarPermisos?.({ guardarAntes: true, obtenerPayload: obtenerPayloadActual })}
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.6)" },
                  fontWeight: 600, fontSize: "0.78rem",
                }}
              >
                Replicar
              </Button>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={props.cancelarEdicion}
              sx={{
                color: "rgba(255,255,255,0.7)",
                borderColor: "rgba(255,255,255,0.25)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.5)" },
                fontWeight: 600, fontSize: "0.78rem",
              }}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={grabar}
              sx={{
                bgcolor: "rgba(255,255,255,0.18)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
                fontWeight: 700,
                "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
              }}
            >
              Guardar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ── Tree card ── */}
      <Paper sx={{
        borderRadius: 3, overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
      }}>
        {/* Card header */}
        <Box sx={{
          px: 3, py: 1.75,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MenuBookIcon sx={{ fontSize: 18, color: "#7c3aed" }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.80rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Árbol de módulos y menús
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
            Marca o desmarca los elementos para configurar el acceso
          </Typography>
        </Box>

        {/* Tree body */}
        <Box sx={{ p: 2, minHeight: 420 }}>
          {loadingTree ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
              <CircularProgress size={22} sx={{ color: "#7c3aed" }} />
              <Typography sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                Cargando árbol de permisos…
              </Typography>
            </Box>
          ) : listaDatosModulos.length === 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 8 }}>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                No hay módulos disponibles para este rol.
              </Typography>
            </Box>
          ) : (
            <Box sx={{
              "& .dx-treeview": { fontFamily: "'Inter','Roboto',sans-serif" },
              "& .dx-treeview-item": {
                borderRadius: "8px !important",
                transition: "background 0.15s",
                "&:hover": { bgcolor: "#f5f3ff !important" },
              },
              "& .dx-treeview-item.dx-state-focused": {
                bgcolor: "#ede9fe !important",
                color: "#5b21b6 !important",
              },
              "& .dx-checkbox-checked .dx-checkbox-icon": {
                bgcolor: "#7c3aed !important",
                borderColor: "#7c3aed !important",
              },
            }}>
              <MenuTreeViewPage
                menus={listaDatosModulos}
                showCheckBoxesModes="normal"
                selectionMode="multiple"
                selectNodesRecursive={true}
                height="560px"
                treeViewRef={treeViewRef}
              />
            </Box>
          )}
        </Box>

        {/* Card footer */}
        <Box sx={{
          px: 3, py: 2,
          bgcolor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          gap: 1,
        }}>
          <Button variant="outlined" size="small" onClick={props.cancelarEdicion}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2, color: "#64748b", borderColor: "#e2e8f0" }}>
            Volver a la lista
          </Button>
          <Button variant="contained" size="small" onClick={grabar}
            startIcon={<SaveIcon />}
            sx={{ borderRadius: 2, bgcolor: "#7c3aed", fontWeight: 700, "&:hover": { bgcolor: "#6d28d9" } }}>
            Guardar permisos
          </Button>
        </Box>
      </Paper>
    </PageWrap>
  );
};


export default injectIntl(WithLoandingPanel(RolesPermisosIndexPage));
