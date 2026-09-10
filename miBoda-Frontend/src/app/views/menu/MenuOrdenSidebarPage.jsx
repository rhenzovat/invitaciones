import React, { useCallback, useEffect, useState } from "react";
import { injectIntl, useIntl } from "react-intl";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import MenuSidebarOrderCanvas from "./MenuSidebarOrderCanvas";
import MenuSidebarNombrePanel from "./MenuSidebarNombrePanel";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
import {
  listarMiOrdenSidebar,
  guardarMiOrdenSidebar,
  guardarMiEtiquetaSidebar,
} from "../../api/menu.api";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import { refreshAppSidebarMenu } from "app/utils/refreshAppSidebarMenu";

const PageWrap = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
}));

const HeaderCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  marginBottom: theme.spacing(2),
  borderRadius: 14,
  background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #f97316 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  boxShadow: "0 6px 28px rgba(15,23,42,0.28)",
}));

function MenuOrdenSidebarPageInner({ useAuth, setLoading: setGlobalLoading }) {
  const intl = useIntl();
  const { perfil } = useAuth();
  const { panelLeft } = useCmsPanelLayout();
  const idRoles = perfil?.id_roles != null ? Number(perfil.id_roles) : null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);
  const [editingItem, setEditingItem] = useState(null);
  const [nombreDraft, setNombreDraft] = useState("");
  const [iconoDraft, setIconoDraft] = useState("");
  const [savingNombre, setSavingNombre] = useState(false);

  const rolLabel =
    perfil?.nombre_rol
    || perfil?.nombre_perfil
    || (idRoles ? `Rol #${idRoles}` : null);

  const itemKey = (it) => (it?.tipo === "modulo" ? `m-${it.id_modulo}` : `n-${it.id_menu}`);

  const cargar = useCallback(async () => {
    if (!idRoles) {
      setItems([]);
      setLoading(false);
      setGlobalLoading?.(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listarMiOrdenSidebar(idRoles);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
      setGlobalLoading?.(false);
    }
  }, [idRoles, intl, setGlobalLoading]);

  useEffect(() => {
    setGlobalLoading?.(false);
    cargar();
  }, [cargar, setGlobalLoading]);

  const handleReorder = async (payload) => {
    if (!idRoles || !payload?.length) return;
    setSaving(true);
    try {
      await guardarMiOrdenSidebar(idRoles, payload);
      await refreshAppSidebarMenu();
      setItems((prev) => {
        const map = new Map(prev.map((it) => [itemKey(it), it]));
        return payload.map((p, i) => {
          const key = p.tipo === "modulo" ? `m-${p.id_modulo}` : `n-${p.id_menu}`;
          return { ...(map.get(key) || {}), ...p, orden: i };
        });
      });
      toastSuccess("Cambios guardados");
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      await cargar();
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNombreDraft((item?.nombre || "").trim());
    setIconoDraft(item?.icon || item?.Icon || "");
    setPanelOpen(true);
  };

  const resetPanel = () => {
    setPanelOpen(false);
    setEditingItem(null);
    setNombreDraft("");
    setIconoDraft("");
  };

  const handleClosePanel = () => {
    if (savingNombre) return;
    resetPanel();
  };

  const handleSaveNombre = async () => {
    const nombre = (nombreDraft || "").trim();
    const icono = (iconoDraft || "").trim();
    if (!nombre || !editingItem || !idRoles) return;

    setSavingNombre(true);
    try {
      const payload = {
        tipo: editingItem.tipo,
        nombre,
        icon: icono || null,
        ...(editingItem.tipo === "modulo"
          ? { id_modulo: editingItem.id_modulo }
          : { id_menu: editingItem.id_menu }),
      };
      await guardarMiEtiquetaSidebar(idRoles, payload);
      await refreshAppSidebarMenu();
      const key = itemKey(editingItem);
      setItems((prev) => prev.map((it) => (
        itemKey(it) === key ? { ...it, nombre, icon: icono || null } : it
      )));
      toastSuccess("Nombre guardado para su rol");
      resetPanel();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setSavingNombre(false);
    }
  };

  return (
    <>
      <MenuSidebarNombrePanel
        open={panelOpen}
        panelLeft={panelLeft}
        item={editingItem}
        nombre={nombreDraft}
        icono={iconoDraft}
        onNombreChange={setNombreDraft}
        onIconoChange={setIconoDraft}
        onSave={handleSaveNombre}
        onClose={handleClosePanel}
        saving={savingNombre}
      />

      <PageWrap>

      <HeaderCard>
        <Box sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          bgcolor: "rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <DragIndicatorIcon sx={{ fontSize: 26 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.15 }}>
            Orden de mi menú
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            Arrastre para ordenar y pulse «Guardar cambios»; use el lápiz para personalizar nombre e ícono solo para su rol
          </Typography>
        </Box>
      </HeaderCard>

      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {!idRoles && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No hay un rol activo en la sesión. Cierre sesión y vuelva a entrar seleccionando perfil y rol.
            </Alert>
          )}

          {idRoles && rolLabel && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`Sesión: ${rolLabel}`}
              sx={{ mb: 2 }}
            />
          )}

          <MenuSidebarOrderCanvas
            items={items}
            loading={loading}
            saving={saving}
            rolNombre={rolLabel}
            autoSave={false}
            onReorder={handleReorder}
            onEditItem={handleEditItem}
            editingPreview={
              panelOpen && editingItem
                ? {
                    key: itemKey(editingItem),
                    nombre: nombreDraft,
                    icon: iconoDraft,
                  }
                : null
            }
            hintText="Arrastre las filas para ordenar. Pulse «Guardar cambios» para aplicar el nuevo orden; use el lápiz para editar nombre e ícono."
            saveButtonLabel="Guardar cambios"
          />
        </CardContent>
      </Card>
      </PageWrap>
    </>
  );
}

export default injectIntl(WithLoandingPanel(MenuOrdenSidebarPageInner, { initialLoading: false }));
