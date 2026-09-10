import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import {
  Box, Paper, Grid, Typography, Button, Stack, Tooltip,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PeopleIcon    from "@mui/icons-material/People";
import SettingsIcon  from "@mui/icons-material/Settings";
import FacebookIcon  from "@mui/icons-material/Facebook";
import WhatsAppIcon  from "@mui/icons-material/WhatsApp";
import EditIcon      from "@mui/icons-material/Edit";
import CmsStorageImage from "app/components/cms/CmsStorageImage";

import { listar, crear, actualizar, actualizarSeccion, eliminar } from "../../../api/web_nuestro_equipo.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import NuestroEquipoCmsPanel from "./NuestroEquipoCmsPanel";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

const PageBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: "100vh",
  backgroundColor: "#ffffff",
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  marginBottom: theme.spacing(2),
  borderRadius: "12px",
  background: "linear-gradient(135deg, #2a0f16 0%, #33141a 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  boxShadow: "0 6px 25px rgba(18,7,10,0.4)",
}));

/* Paleta vino igual a la web pública */
const AM = {
  card:       "#2a0f16",
  cardAlt:    "#33141a",
  cardBorder: "rgba(217,165,107,.28)",
  gold:       "#d9a56b",
  goldLight:  "#f5d39d",
  text:       "#f5e6e2",
  textMuted:  "#d3b3ae",
};

const MiembroFoto = ({ miembro, size = "100%" }) => {
  const tieneImagen = miembro._previewImagen || miembro.url_imagen || miembro.url_imagen_publica;

  if (!tieneImagen) {
    return (
      <Box sx={{
        width: "100%", aspectRatio: "3/4", borderRadius: "14px", overflow: "hidden",
        bgcolor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${AM.cardBorder}`,
      }}>
        <PeopleIcon sx={{ color: "rgba(255,255,255,0.2)", fontSize: 48 }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      width: "100%", aspectRatio: "3/4", borderRadius: "14px", overflow: "hidden",
      border: `1px solid ${AM.cardBorder}`,
    }}>
      <CmsStorageImage
        storagePath={miembro.url_imagen}
        absoluteUrl={miembro.url_imagen_publica}
        previewSrc={miembro._previewImagen}
        alt={miembro.titulo || "Miembro"}
        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </Box>
  );
};

// ─── Card vertical que imita el diseño de la web pública ─────────────────────
const MiembroCard = ({ miembro, onEdit, isActive }) => {
  const SERIF = "'Playfair Display', 'PT Serif', Georgia, serif";
  return (
    <Box
      onClick={() => onEdit(miembro)}
      sx={{
        background: `linear-gradient(160deg, ${AM.card} 0%, ${AM.cardAlt} 100%)`,
        border: isActive ? `2px solid ${AM.gold}` : `1px solid ${AM.cardBorder}`,
        borderRadius: "16px",
        p: 2,
        cursor: "pointer",
        height: "100%",
        position: "relative",
        transition: "all 0.25s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: isActive
          ? `0 0 0 2px ${AM.gold}, 0 12px 36px rgba(18,7,10,0.5)`
          : "0 8px 28px rgba(18,7,10,0.35)",
        "&:hover": {
          boxShadow: `0 12px 40px rgba(18,7,10,0.55)`,
          transform: "translateY(-4px)",
          border: `1px solid ${AM.gold}`,
        },
        "&:hover .edit-fab": { opacity: 1 },
      }}
    >
      {/* Línea dorada superior */}
      <Box sx={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 50, height: 3, borderRadius: 20,
        background: `linear-gradient(90deg, ${AM.gold}, ${AM.goldLight}, ${AM.gold})`,
      }} />

      {/* Edit FAB */}
      <Box className="edit-fab" sx={{
        position: "absolute", top: 10, right: 10,
        opacity: isActive ? 1 : 0, transition: "opacity 0.2s",
        bgcolor: AM.gold, width: 28, height: 28, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}>
        <EditIcon sx={{ fontSize: 14, color: "#fff" }} />
      </Box>

      {/* Facebook icon (si hay URL) */}
      {miembro.url_facebook && miembro.url_facebook !== "#" && (
        <Box sx={{ position: "absolute", top: 14, left: 14 }}>
          <FacebookIcon sx={{ fontSize: 16, color: AM.textMuted }} />
        </Box>
      )}

      {/* Foto vertical */}
      <Box sx={{ width: "100%", mt: 1 }}>
        <MiembroFoto miembro={miembro} />
      </Box>

      {/* Nombre + línea dorada + especialidad */}
      <Box sx={{ textAlign: "center", mt: 2, width: "100%" }}>
        <Typography sx={{
          fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 700,
          color: AM.text, lineHeight: 1.2,
        }}>
          {miembro.titulo}
        </Typography>

        {/* Línea decorativa dorada */}
        <Box sx={{
          width: 40, height: 2, mx: "auto", my: 1, borderRadius: 10,
          background: `linear-gradient(90deg, transparent, ${AM.gold}, transparent)`,
        }} />

        <Typography sx={{
          fontSize: "0.78rem", color: AM.textMuted, lineHeight: 1.5,
          fontStyle: "italic",
        }}>
          {miembro.cargo}
        </Typography>
      </Box>

      {/* WhatsApp */}
      {miembro.url_whatsapp && miembro.url_whatsapp !== "#" && (
        <Box sx={{ mt: 1.5 }}>
          <WhatsAppIcon sx={{ fontSize: 16, color: AM.gold, opacity: 0.7 }} />
        </Box>
      )}
    </Box>
  );
};

// ─── Add card ────────────────────────────────────────────────────────────────
const AddMiembroCard = ({ onClick }) => (
  <Box onClick={onClick} sx={{
    background: `linear-gradient(160deg, ${AM.card} 0%, ${AM.cardAlt} 100%)`,
    border: `2px dashed ${AM.cardBorder}`,
    borderRadius: "16px", p: 2.5,
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: 260, cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": { borderColor: AM.gold, boxShadow: `0 0 0 1px ${AM.gold}40` },
  }}>
    <AddCircleIcon sx={{ fontSize: 36, color: AM.gold, opacity: 0.5, mb: 1 }} />
    <Typography variant="body2" sx={{ color: AM.textMuted, fontWeight: 600 }}>
      Nuevo miembro
    </Typography>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_MIEMBRO = {
  cargo: "", titulo: "", descripcion: "",
  url_facebook: "#", url_whatsapp: "#", orden: 99,
};

const NuestroEquipoIndexPage = (props) => {
  const { setLoading }               = props;
  const intl                         = useIntl();
  const { panelLeft } = useCmsPanelLayout();

  const [miembros,    setMiembros]    = useState([]);
  const [seccion,     setSeccion]     = useState({});
  const [panelOpen,   setPanelOpen]   = useState(false);
  useCmsPanelPush(panelOpen);
  const [panelMode,   setPanelMode]   = useState("miembro");
  const [panelData,   setPanelData]   = useState({});
  const [isNew,       setIsNew]       = useState(false);
  const [confirmElim, setConfirmElim] = useState(false);
  const [previewUrl,  setPreviewUrl]  = useState(null);
  const [imageFile,   setImageFile]   = useState(null);
  // ── Panel ────────────────────────────────────────────────────────────────
  const openPanel = (mode, data = null) => {
    setPanelMode(mode);
    setPanelData(data ? { ...data } : { ...EMPTY_MIEMBRO });
    setIsNew(!data);
    setPreviewUrl(null);
    setImageFile(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setPanelData({});
    setIsNew(false);
    setPreviewUrl(null);
    setImageFile(null);
  };

  const handleChange = (field, value) =>
    setPanelData((prev) => ({ ...prev, [field]: value }));

  const handleFileSelect = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const cargar = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setSeccion(data?.seccion || {});
      setMiembros(data?.miembros || []);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (panelMode === "seccion") {
        await actualizarSeccion(panelData);
      } else {
        const fd = new FormData();
        fd.append("cargo",        panelData.cargo        || "");
        fd.append("titulo",       panelData.titulo       || "");
        fd.append("descripcion",  panelData.descripcion  || "");
        fd.append("url_facebook", panelData.url_facebook || "#");
        fd.append("url_whatsapp", panelData.url_whatsapp || "#");
        fd.append("orden",        parseInt(panelData.orden) || 99);
        if (imageFile) fd.append("image", imageFile);
        if (!isNew)    fd.append("id_miembro", panelData.id_miembro);

        if (isNew) {
          await crear(fd);
        } else {
          await actualizar(fd);
        }
      }
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      closePanel();
      cargar();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setConfirmElim(false);
    setLoading(true);
    try {
      await eliminar({ id_miembro: panelData.id_miembro });
      toastSuccess("Miembro eliminado correctamente");
      closePanel();
      cargar();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  /** Vista previa en tiempo real: datos del panel + foto nueva en el card activo. */
  const displayMiembros = miembros.map((m) => {
    const isEditing = panelOpen && panelMode === "miembro" && !isNew
      && panelData?.id_miembro === m.id_miembro;
    if (!isEditing) return m;
    return {
      ...m,
      cargo: panelData.cargo ?? m.cargo,
      titulo: panelData.titulo ?? m.titulo,
      descripcion: panelData.descripcion ?? m.descripcion,
      url_facebook: panelData.url_facebook ?? m.url_facebook,
      url_whatsapp: panelData.url_whatsapp ?? m.url_whatsapp,
      _previewImagen: previewUrl || undefined,
    };
  });

  return (
    <>
      <NuestroEquipoCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        mode={panelMode}
        datos={panelData}
        isNew={isNew}
        onChange={handleChange}
        onSave={handleSave}
        onClose={closePanel}
        onDelete={() => setConfirmElim(true)}
        previewUrl={previewUrl}
        onFileSelect={handleFileSelect}
        onRemoveFile={handleRemoveFile}
      />

      <PageBox>

        {/* Header admin */}
        <HeaderCard elevation={0}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 46, height: 46, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PeopleIcon sx={{ fontSize: 24, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>Nuestro Equipo</Typography>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                {seccion.badge_texto || "Nuestro Equipo"} — {miembros.length} miembro(s)
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Editar encabezado de sección">
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => openPanel("seccion", { badge_texto: seccion.badge_texto, titulo_seccion: seccion.titulo_seccion })}
                sx={{ borderColor: "rgba(255,255,255,0.30)", color: "#fff", fontWeight: 600, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.10)" } }}
              >
                Encabezado
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => openPanel("miembro", null)}
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}
            >
              Nuevo miembro
            </Button>
          </Stack>
        </HeaderCard>

        {/* Preview encabezado */}
        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: "rgba(15,23,42,0.05)", border: "1px solid #e2e8f0" }}>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Encabezado de sección
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ mt: 0.3 }}>
            <span style={{ fontSize: "0.72rem", color: "#f97316", marginRight: 8 }}>
              [{seccion.badge_texto || "Manos que escuchan"}]
            </span>
            {seccion.titulo_seccion || "Manos especialistas"}
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: "#64748b", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.68rem" }}>
          Miembros ({miembros.length}) — Haz clic en un card para editarlo
        </Typography>

        {/* Fondo vino que envuelve las cards como en la web */}
        <Box sx={{ bgcolor: "#fff", borderRadius: 3, p: 2.5 }}>
          {miembros.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No hay miembros. Crea el primero con "Nuevo miembro".
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {displayMiembros.map((m) => (
                <Grid item xs={12} sm={6} md={3} key={m.id_miembro}>
                  <MiembroCard
                    miembro={m}
                    onEdit={(data) => openPanel("miembro", data)}
                    isActive={panelOpen && panelMode === "miembro" && !isNew && panelData?.id_miembro === m.id_miembro}
                  />
                </Grid>
              ))}
              <Grid item xs={12} sm={6} md={3}>
                <AddMiembroCard onClick={() => openPanel("miembro", null)} />
              </Grid>
            </Grid>
          )}
        </Box>

      </PageBox>

      {/* Confirm delete */}
      <Dialog open={confirmElim} onClose={() => setConfirmElim(false)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar miembro?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Esta acción eliminará permanentemente a <strong>{panelData?.titulo}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmElim(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default injectIntl(WithLoandingPanel(NuestroEquipoIndexPage));
