import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import EditIcon      from "@mui/icons-material/Edit";
import ScheduleIcon  from "@mui/icons-material/Schedule";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon  from "@mui/icons-material/WhatsApp";
import CallIcon      from "@mui/icons-material/Call";
import PlaceIcon     from "@mui/icons-material/Place";
import EmailIcon     from "@mui/icons-material/Email";
import { authJWTConfig } from "app/authJWTConfig";
import { parseNavFooter } from "../../../api/web_footer.api";

const Domain = `${(authJWTConfig.domain || "").replace(/\/$/, "")}/`;

/* ── Paleta "Dark Passion" — idéntica al sitio público ──────────────── */
const TEXT        = "#f5e6e2";
const MUTED       = "#d3b3ae";
const GOLD        = "#d9a56b";
const TIME        = "#b79b86";
const CARD_BORDER = "rgba(255,255,255,0.09)";
const SERIF       = "'PT Serif', Georgia, serif";
const EDIT        = "#cc6b8e";

/* Fondo vino degradado idéntico al body del sitio */
const SITE_BG = `
  radial-gradient(circle at 12% 8%, rgba(122,6,6,.30) 0%, transparent 45%),
  radial-gradient(circle at 88% 92%, rgba(122,6,6,.25) 0%, transparent 50%),
  linear-gradient(160deg, #12070a 0%, #2a0f16 30%, #33141a 50%, #1c0d10 72%, #12070a 100%)`;

/* Imagen QR por defecto (la misma del blade) */
const DEFAULT_QR = `${Domain}temp02/assets/images/inicio/logo-qr.jpg`;

/* ── EditZone: zona clicable con lápiz ─────────────────────────────── */
function EditZone({ id, label, active, onEdit, color = EDIT, children, sx = {} }) {
  const isA = active === id;
  return (
    <Box
      onClick={() => onEdit && onEdit(id)}
      sx={{
        position: "relative",
        outline: isA ? `2px solid ${color}` : "2px solid transparent",
        outlineOffset: -2,
        borderRadius: "6px",
        transition: "outline .15s",
        cursor: onEdit ? "pointer" : "default",
        "&:hover": onEdit ? {
          outline: `2px dashed ${color}88`,
          backgroundColor: "rgba(204,107,142,0.06)",
        } : {},
        "&:hover .fp-pencil": { opacity: 1 },
        ...sx,
      }}
    >
      {children}
      {onEdit && (
        <Tooltip title={label} placement="top">
          <IconButton
            className="fp-pencil"
            size="small"
            onClick={e => { e.stopPropagation(); onEdit(id); }}
            sx={{
              position: "absolute", top: 4, right: 4,
              width: 24, height: 24,
              bgcolor: isA ? color : "rgba(15,10,5,0.85)",
              color: "#fff",
              border: `1.5px solid ${color}99`,
              opacity: isA ? 1 : 0,
              transition: "opacity .15s",
              "&:hover": { bgcolor: color, transform: "scale(1.12)" },
              zIndex: 10,
            }}
          >
            <EditIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

/* ── Encabezado de columna (Links, Servicios, …) ───────────────────── */
const ColTitle = ({ children }) => (
  <Typography sx={{
    color: TEXT, fontFamily: SERIF, fontWeight: 700, fontSize: "16px",
    mb: 1.5,
  }}>
    {children}
  </Typography>
);

const parseHorarios = (str) => {
  const base = { sem: "Lunes a Sábado", semH: "10:00 AM – 09:00 PM", dom: "Domingo", domH: "Con reserva previa" };
  if (!str || !str.includes("|")) return base;
  const p = str.split("|").map((s) => s.trim());
  if (p.length >= 4) return { sem: p[0], semH: p[1], dom: p[2], domH: p[3] };
  return { ...base, sem: p[0] || base.sem, domH: p[1] || base.domH };
};

const NavListItem = ({ item }) => (
  <Typography
    component={item.href ? "a" : "span"}
    href={item.href || undefined}
    onClick={(e) => { if (item.href) e.preventDefault(); }}
    target={item.href?.startsWith("http") ? "_blank" : undefined}
    rel={item.href?.startsWith("http") ? "noopener" : undefined}
    sx={{
      color: MUTED,
      fontSize: "13px",
      cursor: item.href ? "pointer" : "default",
      textDecoration: "none",
      "&:hover": { color: GOLD },
    }}
  >
    {item.label}
  </Typography>
);

/* ── Ícono de contacto (cuadro outline con ícono dorado) ───────────── */
const ContactIcon = ({ children }) => (
  <Box sx={{
    width: 34, height: 34, flexShrink: 0, borderRadius: "50%",
    border: `1px solid ${CARD_BORDER}`, color: GOLD,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    {children}
  </Box>
);

/* ════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════════════════════ */
const FooterCanvasPreview = ({ footer, logoUrl, qrUrl, onZoneClick, cmsActive }) => {
  if (!footer) return null;

  const f = footer;
  const desc  = f.descripcion_footer || f.sobre_la_empresa ||
    "Amour Spa es un centro de bienestar en Miraflores especializado en masajes relajantes y terapias corporales.";

  const h = parseHorarios(f.nuestros_horarios);

  const tel   = f.contacto_telefono  || "+51 977 807 314";
  const email = f.contacto_email     || "informacion@amourspa.com";
  const dir   = f.contacto_direccion || "Av. Ernesto Diez Canseco 204, Miraflores, Lima";
  const dir2  = "15074 Miraflores, Lima, Perú";
  const promo = f.promo_texto ||
    "Escanea el código QR y síguenos en Instagram para novedades, tips de piel y ofertas especiales.";
  const copy  = f.texto_copyright ||
    "Copyright © Amour Spa 2026. Tous droits réservés · Miraflores, Lima.";
  const qr    = qrUrl || DEFAULT_QR;
  const nav     = parseNavFooter(f.nav_footer);
  const links   = nav.links?.items || [];
  const services = nav.services?.items || [];

  return (
    <Box sx={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${CARD_BORDER}` }}>

      {/* ── Cabecera del canvas ── */}
      <Box sx={{
        px: 1.5, py: 0.75,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${CARD_BORDER}`, background: "rgba(20,8,12,0.9)",
      }}>
        <Typography variant="caption" fontWeight={700}
          sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: GOLD, fontSize: "0.60rem" }}>
          Vista previa — Footer Amour Spa
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.58rem" }}>
          Canvas en tiempo real
        </Typography>
      </Box>

      {/* ══ CUERPO PRINCIPAL DEL FOOTER ══════════════════════════════ */}
      <Box sx={{ background: SITE_BG, p: { xs: "24px", md: "32px 28px" } }}>
        <Box sx={{ display: "flex", gap: { xs: 3, md: 4 }, alignItems: "stretch", flexWrap: { xs: "wrap", lg: "nowrap" } }}>

          {/* ── COL 1: Tarjeta blanca (logo + descripción + redes) ── */}
          <EditZone id="marca" label="Editar: Logo, descripción y redes"
            active={cmsActive} onEdit={onZoneClick} color={EDIT}
            sx={{ flex: { xs: "1 1 100%", lg: "0 0 25%" }, minWidth: 220 }}>
            <Box sx={{
              bgcolor: "#fff", borderRadius: "16px", p: "26px 22px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)", height: "100%",
              display: "flex", flexDirection: "column",
            }}>
              {/* Logo */}
              <Box sx={{ mb: 2 }}>
                {logoUrl ? (
                  <Box component="img" src={logoUrl} alt="Amour Spa"
                    sx={{ maxWidth: 160, width: "100%", height: "auto", objectFit: "contain" }} />
                ) : (
                  <Box sx={{ width: 130, height: 60, display: "flex", alignItems: "center" }}>
                    <Typography sx={{ color: "#a0455e", fontFamily: SERIF, fontSize: "26px", fontWeight: 700 }}>
                      Amour<span style={{ fontSize: "13px" }}> Spa</span>
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Descripción */}
              <Typography sx={{ color: "#4a4a4a", fontSize: "12.5px", lineHeight: 1.7, mb: 2.5 }}>
                {desc}
              </Typography>

              {/* Redes sociales (IG + WhatsApp) */}
              <Box sx={{ display: "flex", gap: "10px", mt: "auto" }}>
                {[<InstagramIcon sx={{ fontSize: 18 }} key="ig" />,
                  <WhatsAppIcon  sx={{ fontSize: 18 }} key="wa" />].map((ic, i) => (
                  <Box key={i} sx={{
                    width: 38, height: 38, borderRadius: "10px",
                    border: "1px solid #e0d5c8", bgcolor: "#f8f5f0", color: GOLD,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {ic}
                  </Box>
                ))}
              </Box>
            </Box>
          </EditZone>

          {/* ── COL 2: Área derecha (Horario arriba + enlaces abajo) ── */}
          <Box sx={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column" }}>

            {/* ── TOP: Horario ── */}
            <EditZone id="horario" label="Editar: Horarios de atención"
              active={cmsActive} onEdit={onZoneClick} color={GOLD}
              sx={{ pb: 2.5, mb: 2.5, borderBottom: `1px solid ${CARD_BORDER}`, width: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: { xs: 2, md: 0 } }}>
                <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 30%" }, textAlign: { md: "center" }, py: 1.25 }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: GOLD, mb: .5 }} />
                  <Typography sx={{ color: TEXT, fontFamily: SERIF, fontSize: "24px",
                    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {f.footer_horario_titulo || "Horario"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: "flex" }}>
                  <Box sx={{ flex: 1, textAlign: "center", px: 2,
                    borderLeft: `1px solid ${CARD_BORDER}`, borderRight: `1px solid ${CARD_BORDER}` }}>
                    <Typography sx={{ color: TEXT, fontSize: "15px", fontWeight: 500 }}>{h.sem}</Typography>
                    <Typography sx={{ color: TIME, fontSize: "14px", mt: .5 }}>{h.semH}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: "center", px: 2 }}>
                    <Typography sx={{ color: TEXT, fontSize: "15px", fontWeight: 500 }}>{h.dom}</Typography>
                    <Typography sx={{ color: TIME, fontSize: "14px", mt: .5 }}>{h.domH}</Typography>
                  </Box>
                </Box>
              </Box>
            </EditZone>

            {/* ── BOTTOM: Links · Servicios · Contacto · Promociones ── */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}>

              {/* Links (estático — navegación del sitio) */}
              <EditZone id="links" label="Editar: Links"
                active={cmsActive} onEdit={onZoneClick} color={EDIT}
                sx={{ flex: "1 1 120px", minWidth: 110, p: .5 }}>
                <ColTitle>{nav.links?.title || "Links"}</ColTitle>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  {links.map((item, i) => (
                    <NavListItem key={i} item={item} />
                  ))}
                </Box>
              </EditZone>

              {/* Servicios (estático) */}
              <EditZone id="servicios" label="Editar: Servicios"
                active={cmsActive} onEdit={onZoneClick} color={EDIT}
                sx={{ flex: "1 1 120px", minWidth: 110, p: .5 }}>
                <ColTitle>{nav.services?.title || "Servicios"}</ColTitle>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  {services.map((item, i) => (
                    <NavListItem key={i} item={item} />
                  ))}
                </Box>
              </EditZone>

              {/* Contacto */}
              <EditZone id="contacto" label="Editar: Contacto"
                active={cmsActive} onEdit={onZoneClick} color={EDIT}
                sx={{ flex: "1 1 200px", minWidth: 190, p: .5 }}>
                <ColTitle>Contacto</ColTitle>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <ContactIcon><CallIcon sx={{ fontSize: 16 }} /></ContactIcon>
                    <Typography sx={{ color: MUTED, fontSize: "12.5px" }}>{tel}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <ContactIcon><EmailIcon sx={{ fontSize: 16 }} /></ContactIcon>
                    <Typography sx={{ color: MUTED, fontSize: "12.5px" }}>{email}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                    <ContactIcon><PlaceIcon sx={{ fontSize: 16 }} /></ContactIcon>
                    <Box>
                      {dir.split("\n").map((line, idx) => (
                        <Typography key={idx} sx={{ color: MUTED, fontSize: "12.5px", lineHeight: 1.4 }}>{line}</Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </EditZone>

              {/* Promociones */}
              <EditZone id="promociones" label="Editar: Promociones y QR"
                active={cmsActive} onEdit={onZoneClick} color={EDIT}
                sx={{ flex: "1 1 240px", minWidth: 220, p: .5 }}>
                <ColTitle>Promociones</ColTitle>
                <Typography sx={{ color: MUTED, fontSize: "12.5px", lineHeight: 1.6, mb: 2 }}>
                  {promo}
                </Typography>
                <Box sx={{ textAlign: "center" }}>
                  <Box component="img" src={qr} alt="QR Amour Spa"
                    sx={{ width: 130, height: 130, objectFit: "cover", borderRadius: "8px",
                      bgcolor: "#fff", p: "6px", boxShadow: "0 4px 14px rgba(0,0,0,.25)" }} />
                  <Typography sx={{ color: MUTED, fontSize: "11px", mt: 1 }}>{email}</Typography>
                </Box>
              </EditZone>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══ BARRA COPYRIGHT ══════════════════════════════════════════════ */}
      <EditZone id="footer" label="Editar: Barra inferior (Copyright)"
        active={cmsActive} onEdit={onZoneClick} color={GOLD}
        sx={{ background: "rgba(12,5,7,0.6)", borderTop: `1px solid ${CARD_BORDER}` }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: 3, py: 1.5 }}>
          <Typography sx={{ color: MUTED, fontSize: "12px", textAlign: "center", lineHeight: 1.5 }}>
            {copy}
          </Typography>
        </Box>
      </EditZone>

      {/* ── Hint ── */}
      {onZoneClick && (
        <Box sx={{ px: 1.5, py: 0.75, background: "rgba(20,8,12,0.6)",
          borderTop: `1px solid ${CARD_BORDER}` }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.60rem" }}>
            ✏ Pasa el cursor sobre cada sección y haz clic en el lápiz para editar
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FooterCanvasPreview;
