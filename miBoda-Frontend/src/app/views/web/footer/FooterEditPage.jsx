import { useEffect, useState, useRef } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FooterCanvasPreview from "./FooterCanvasPreview";
import FooterCmsPanel from "./FooterCmsPanel";
import SaveIcon from "@mui/icons-material/Save";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
import { parseFooterRedes, parseFooterBullets, parseNavFooter } from "../../../api/web_footer.api";

// ─── Styled ──────────────────────────────────────────────────────────────────
const PageWrap = styled(Box)(({ theme }) => ({
  padding: "24px 28px",
  minHeight: "100vh",
  backgroundColor: "#f7f3f0",
  [theme.breakpoints.down("sm")]: { padding: "16px" },
}));

// ─────────────────────────────────────────────────────────────────────────────

const FooterEditPage = (props) => {
  const { panelLeft } = useCmsPanelLayout();

  // ── CMS panel ────────────────────────────────────────────────────────────
  const [cmsSection, setCmsSection] = useState(null);
  useCmsPanelPush(!!cmsSection);

  const openCmsPanel = (section) => {
    setCmsSection(section);
    props.onCmsPanelChange?.(true);
  };

  const closeCmsPanel = () => {
    setCmsSection(null);
    props.onCmsPanelChange?.(false);
  };

  // ── Imágenes ─────────────────────────────────────────────────────────────
  const inputLogoFooter   = useRef(null);
  const inputImgCentro    = useRef(null);
  const [imgFooterUrl,         setImgFooterUrl]         = useState(null);
  const [imgCentroUrl,         setImgCentroUrl]         = useState(null);
  const [previewLogoFooter,    setPreviewLogoFooter]    = useState(null);
  const [previewImgCentro,     setPreviewImgCentro]     = useState(null);
  const [pendingLogoFooter,    setPendingLogoFooter]    = useState(null);
  const [pendingImgCentro,     setPendingImgCentro]     = useState(null);
  const handleLogoFooterChange = (e) => {
    const f = e.target.files?.[0];
    if (f) { setPendingLogoFooter(f); setPreviewLogoFooter(URL.createObjectURL(f)); }
  };
  const handleImgCentroChange = (e) => {
    const f = e.target.files?.[0];
    if (f) { setPendingImgCentro(f); setPreviewImgCentro(URL.createObjectURL(f)); }
  };

  // ── Estado de datos ───────────────────────────────────────────────────────
  const [datosState, setDatosState] = useState({
    nuestros_horarios:            "",
    descripcion_footer:           "",
    titulo_sobre_nosotros:        "Sobre Nosotros",
    etiqueta_redes:               "Nuestras Redes:",
    titulo_llamanos:              "Llámanos",
    titulo_escribenos:            "Escríbenos un mensaje",
    titulo_ubicacion:             "Ubícanos",
    footer_telefonos:             "",
    footer_emails:                "",
    footer_redes:                 [],
    footer_redes_titulo:          "Síguenos en Redes",
    footer_redes_subtitulo:       "Mantente al día con nuestras novedades y experiencias.",
    footer_bullets:               [],
    nav_footer:                   parseNavFooter(null),
    footer_horario_titulo:        "Horario",
    texto_copyright:              "",
    red_social_facebook:          "",
    red_social_youtobe:           "",
    red_social_twitter:           "",
    red_social_instagram:         "",
    red_social_linkedin:          "",
    red_social_tiktok:            "",
    url_mapa:                     "",
    contacto_direccion:           "",
    contacto_telefono:            "",
    contacto_telefono_secundario: "",
    contacto_email:               "",
    url_whatsapp:                 "",
    whatsapp_mensaje:             "",
    footer_cta_subtitulo:         "",
    footer_cta_titulo:            "",
    sobre_la_empresa:             "",
    promo_texto:                  "",
    logo_menu:                    "",
    logo_footer:                  "",
    logo_menu_url:                null,
    logo_footer_url:              null,
  });

  const handleCmsChange = (field, value) =>
    setDatosState((prev) => ({ ...prev, [field]: value }));

  function grabar() {
    return props.actualizarFooter({
      id_footer: 1,
      ...datosState,
      logo_footer_file: pendingLogoFooter || inputLogoFooter.current?.files?.[0] || null,
      img_central_file: pendingImgCentro  || inputImgCentro.current?.files?.[0]  || null,
    });
  }

  const handleSavePanel = async () => {
    await grabar();
    setPendingLogoFooter(null);
    setPendingImgCentro(null);
    closeCmsPanel();
  };

  // ── Cargar datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!props.dataRowEditNew) return;
    const row = props.dataRowEditNew;
    setDatosState({
      ...row,
      footer_redes:       parseFooterRedes(row.footer_redes),
      footer_bullets:     parseFooterBullets(row.footer_bullets),
      nav_footer:         parseNavFooter(row.nav_footer),
      footer_horario_titulo: row.footer_horario_titulo || "Horario",
      descripcion_footer: row.descripcion_footer || row.sobre_la_empresa || "",
    });
    setImgFooterUrl(row.logo_footer_url || null);
    setImgCentroUrl(row.url_qr_url || null);
  }, [props.dataRowEditNew]);

  useEffect(() => {
    if (!props.dataRowEditNew || Object.keys(props.dataRowEditNew).length === 0) return;
    if (inputLogoFooter.current) inputLogoFooter.current.value = "";
    setPreviewLogoFooter(null);
    setPendingLogoFooter(null);
    setImgFooterUrl(props.dataRowEditNew.logo_footer_url || null);
    setImgCentroUrl(props.dataRowEditNew.url_qr_url || null);
  }, [props.dataRowEditNew]);

  // ── Live data para canvas ─────────────────────────────────────────────────
  const liveFooter = {
    descripcion_footer:           datosState.descripcion_footer,
    titulo_sobre_nosotros:        datosState.titulo_sobre_nosotros,
    etiqueta_redes:               datosState.etiqueta_redes,
    titulo_llamanos:              datosState.titulo_llamanos,
    titulo_escribenos:            datosState.titulo_escribenos,
    titulo_ubicacion:             datosState.titulo_ubicacion,
    footer_telefonos:             datosState.footer_telefonos,
    footer_emails:                datosState.footer_emails,
    footer_redes:                 datosState.footer_redes,
    footer_redes_titulo:          datosState.footer_redes_titulo,
    footer_redes_subtitulo:       datosState.footer_redes_subtitulo,
    footer_bullets:               datosState.footer_bullets,
    nav_footer:                   datosState.nav_footer,
    footer_horario_titulo:        datosState.footer_horario_titulo,
    sobre_la_empresa:             datosState.sobre_la_empresa,
    footer_cta_subtitulo:         datosState.footer_cta_subtitulo,
    footer_cta_titulo:            datosState.footer_cta_titulo,
    contacto_telefono:            datosState.contacto_telefono,
    contacto_telefono_secundario: datosState.contacto_telefono_secundario,
    contacto_direccion:           datosState.contacto_direccion,
    contacto_email:               datosState.contacto_email,
    nuestros_horarios:            datosState.nuestros_horarios,
    promo_texto:                  datosState.promo_texto,
    texto_copyright:              datosState.texto_copyright,
    url_whatsapp:                 datosState.url_whatsapp,
  };

  const canvasLogoUrl    = previewLogoFooter || imgFooterUrl;
  const canvasQrUrl      = previewImgCentro  || imgCentroUrl;
  const panelOpen        = !!cmsSection;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══ Panel CMS deslizante ══════════════════════════════════════════════ */}
      <FooterCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        section={cmsSection}
        datos={datosState}
        onChange={handleCmsChange}
        onSave={handleSavePanel}
        onClose={closeCmsPanel}
        previewLogoFooter={previewLogoFooter}
        imgFooterUrl={imgFooterUrl}
        previewImgCentro={previewImgCentro}
        imgCentroUrl={imgCentroUrl}
        inputLogoFooterRef={inputLogoFooter}
        inputImgCentroRef={inputImgCentro}
        onLogoFooterChange={handleLogoFooterChange}
        onImgCentroChange={handleImgCentroChange}
      />

      <PageWrap>

        {/* ── Header Royal Masajes ─────────────────────────────────────────── */}
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
                <VerticalAlignBottomIcon sx={{ color: "#fff", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
                  {props.titulo || "Footer & Cierre"}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
                  Edita el pie de página — haz clic en el lápiz de cada sección del preview
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Chip
                label="5 zonas editables"
                size="small"
                sx={{
                  bgcolor: "rgba(184,134,11,0.25)",
                  color: "#fde68a",
                  fontWeight: 700,
                  border: "1px solid rgba(184,134,11,0.4)",
                  fontSize: "0.68rem",
                }}
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={grabar}
                size="small"
                sx={{
                  background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "10px",
                  boxShadow: "0 3px 10px rgba(204,107,142,0.35)",
                  "&:hover": { background: "linear-gradient(135deg,#a0455e,#7a2a3e)" },
                }}
              >
                Guardar todo
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* ── Canvas preview ────────────────────────────────────────────────── */}
        <Paper sx={{
          borderRadius: "16px", overflow: "hidden",
          border: "1px solid rgba(184,134,11,0.15)",
          boxShadow: "0 2px 12px rgba(44,26,14,0.08)",
          mb: 2,
        }}>
          <FooterCanvasPreview
            footer={liveFooter}
            logoUrl={canvasLogoUrl}
            qrUrl={canvasQrUrl}
            onZoneClick={openCmsPanel}
            cmsActive={cmsSection}
          />
        </Paper>

        {/* ── Hint ──────────────────────────────────────────────────────────── */}
        <Box sx={{
          p: 1.5, borderRadius: "10px",
          bgcolor: "rgba(184,134,11,0.07)",
          border: "1px dashed rgba(184,134,11,0.3)",
        }}>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.68rem", display: "block" }}>
            <strong style={{ color: "#b8860b" }}>✏ Modo edición:</strong>{" "}
            Pasa el cursor sobre cualquier sección del preview y haz clic en el lápiz rosa/dorado para editar.
            Los cambios se reflejan en tiempo real. Usa{" "}
            <strong>"Guardar cambios"</strong> en el panel lateral o el botón superior para persistir.
          </Typography>
        </Box>

      </PageWrap>
    </>
  );
};

export default FooterEditPage;
