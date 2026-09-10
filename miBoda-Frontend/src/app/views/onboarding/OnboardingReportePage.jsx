import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { onboardingPublicoObtener } from "../../api/onboarding.api";

// ── Estilos globales de impresión ──────────────────────────────────────────────
const printStyles = `
  @media print {
    .no-print { display: none !important; }
    body { margin: 0; background: white; }
    .page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
  }
  @page { size: A4; margin: 12mm 14mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; }
`;

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtFecha = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const QR_DEFAULT = `${import.meta.env.VITE_AUTHJWT_DOMAIN}${import.meta.env.VITE_QR_YAPE_URL}`;

// ── Componente ─────────────────────────────────────────────────────────────────
const OnboardingReportePage = () => {
  const { token } = useParams();
  const [data, setData]       = useState(null);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(true);
  // Si está dentro de un iframe, ocultar la barra de navegación superior
  const enIframe = window.self !== window.top;

  const cargar = useCallback(async () => {
    try {
      const res = await onboardingPublicoObtener(token);
      if (res.success) setData(res.result);
      else setError(res.message || "Enlace no disponible.");
    } catch (e) {
      setError("No se pudo cargar el reporte.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: 18, color: "#888" }}>
      ⏳ Cargando reporte...
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: 18, color: "#e53935" }}>
      ⚠️ {error}
    </div>
  );

  const progColor = data.progreso < 40 ? "#e53935" : data.progreso < 80 ? "#fb8c00" : "#43a047";
  const estadoPago = data.pago_confirmado
    ? { label: "PAGO CONFIRMADO ✅", bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" }
    : { label: "PAGO PENDIENTE ⏳", bg: "#fff8e1", color: "#e65100", border: "#ffcc80" };

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: enIframe ? "12px" : "20px 16px" }}>

      {/* ── Barra de acciones (no imprime, no muestra en iframe) ── */}
      {!enIframe && <div className="no-print" style={{
        maxWidth: 820, margin: "0 auto 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#1565c0", borderRadius: 10, padding: "12px 20px",
      }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
          📄 Reporte de Onboarding — {data.empresa_nombre || "Cliente"}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => window.history.back()}
            style={{ background: "transparent", color: "#90caf9", border: "1px solid #90caf9",
              borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontSize: 13 }}>
            ← Volver
          </button>
          <button onClick={() => window.print()}
            style={{ background: "#fff", color: "#1565c0", border: "none",
              borderRadius: 6, padding: "6px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>
      </div>}

      {/* ── Página del reporte ── */}
      <div className="page" style={{
        maxWidth: 820, margin: "0 auto",
        background: "#fff", borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
        overflow: "hidden",
      }}>

        {/* ── Cabecera ── */}
        <div style={{ background: "linear-gradient(135deg,#1565c0,#1976d2)", padding: "24px 28px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.8, textTransform: "uppercase" }}>royalsensorymassage — Reporte de Onboarding</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{data.empresa_nombre || "Sin nombre"}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
                {data.form_nombres} {data.form_apellidos}
                {data.form_email ? ` · ${data.form_email}` : ""}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {/* Barra de progreso circular simple */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: `conic-gradient(${progColor} ${data.progreso * 3.6}deg, #e0e0e0 0deg)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginLeft: "auto",
              }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#1565c0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 16 }}>
                  {data.progreso}%
                </div>
              </div>
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>Progreso total</div>
            </div>
          </div>

          {/* Estado de pago badge */}
          <div style={{ marginTop: 16, display: "inline-block",
            background: data.pago_confirmado ? "#43a047" : "#fb8c00",
            borderRadius: 20, padding: "4px 16px", fontSize: 12, fontWeight: 700, color: "#fff" }}>
            {estadoPago.label}
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* ── Fila: Checklist de progreso ── */}
          <Section titulo="📊 Estado del proceso">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Formulario completado", ok: data.form_completado, pct: "80%" },
                { label: "Logo subido",           ok: !!data.form_imagen_url, pct: "10%" },
                { label: "Pago confirmado",        ok: data.pago_confirmado,   pct: "10%" },
              ].map((item, i) => (
                <div key={i} style={{
                  border: `1px solid ${item.ok ? "#a5d6a7" : "#ffcc80"}`,
                  borderRadius: 8, padding: "10px 14px",
                  background: item.ok ? "#f1fdf4" : "#fff8e1",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>{item.ok ? "✅" : "⏳"}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>Vale {item.pct} del progreso</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Barra de progreso */}
            <div style={{ marginTop: 12, background: "#e0e0e0", borderRadius: 8, height: 10, overflow: "hidden" }}>
              <div style={{ width: `${data.progreso}%`, height: "100%", background: progColor, borderRadius: 8,
                transition: "width 0.6s" }} />
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4, textAlign: "right" }}>{data.progreso}% completado</div>
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 0 }}>

            {/* ── Datos personales ── */}
            <Section titulo="👤 Datos del contacto">
              <InfoRow label="Nombre completo"  val={`${data.form_nombres || ""} ${data.form_apellidos || ""}`.trim()} />
              <InfoRow label="Correo"            val={data.form_email} />
              <InfoRow label="Teléfono"          val={data.form_telefono} />
              <InfoRow label="WhatsApp"          val={data.form_whatsapp} />
              <InfoRow label="DNI"               val={data.form_dni} />
              <InfoRow label="Dirección"         val={data.form_direccion} />
            </Section>

            {/* ── Datos empresa ── */}
            <Section titulo="🏢 Datos de la empresa">
              <InfoRow label="Razón Social" val={data.form_empresa} />
              <InfoRow label="RUC"          val={data.form_ruc} />
              <InfoRow label="Marca"        val={data.form_marca} />
              <InfoRow label="Rubro"        val={data.form_rubro} />
              <InfoRow label="Dominio web"  val={data.form_dominio} />
              <InfoRow label="Colores"      val={data.form_colores} />
            </Section>
          </div>

          {/* ── Descripción del proyecto ── */}
          {data.form_desc_proyecto && (
            <Section titulo="📌 Concepto / Descripción del proyecto">
              <div style={{ background: "#f5f5f5", borderRadius: 6, padding: "10px 14px",
                fontSize: 13, color: "#444", whiteSpace: "pre-line", lineHeight: 1.6 }}>
                {data.form_desc_proyecto}
              </div>
            </Section>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* ── Datos de pago ── */}
            <Section titulo="💳 Datos de pago del servicio">
              {data.empresa_monto && (
                <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7",
                  borderRadius: 8, padding: "10px 14px", textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#888" }}>Monto a pagar</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#2e7d32" }}>
                    S/ {parseFloat(data.empresa_monto).toFixed(2)}
                  </div>
                </div>
              )}
              <InfoRow label="Titular" val={data.empresa_titular} />
              <InfoRow label="DNI"     val={data.empresa_dni} />
              {data.empresa_yape && (
                <div style={{ background: "#f3e5f5", borderRadius: 6, padding: "6px 10px", margin: "6px 0" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#7b1fa2" }}>🟣 Yape: </span>
                  <span style={{ fontSize: 12 }}>{data.empresa_yape}</span>
                </div>
              )}
              {(data.empresa_cuenta || data.empresa_cci) && (
                <div style={{ background: "#e3f2fd", borderRadius: 6, padding: "6px 10px", margin: "6px 0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1565c0" }}>🏦 BBVA</div>
                  <InfoRow label="Cuenta" val={data.empresa_cuenta} />
                  <InfoRow label="CCI"    val={data.empresa_cci} />
                </div>
              )}
              {(data.empresa_bcp_cuenta || data.empresa_bcp_cci) && (
                <div style={{ background: "#e8f5e9", borderRadius: 6, padding: "6px 10px", margin: "6px 0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#2e7d32" }}>🏦 BCP</div>
                  <InfoRow label="Cuenta" val={data.empresa_bcp_cuenta} />
                  <InfoRow label="CCI"    val={data.empresa_bcp_cci} />
                </div>
              )}
            </Section>

            {/* ── QR + Logo ── */}
            <Section titulo="🖼️ Archivos">
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>QR de pago</div>
                  <img src={data.empresa_qr_url || QR_DEFAULT} alt="QR"
                    style={{ width: 90, height: 90, objectFit: "contain", border: "1px solid #e0e0e0", borderRadius: 8 }} />
                </div>
                {data.form_imagen_url && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Logo del cliente</div>
                    <img src={data.form_imagen_url} alt="Logo"
                      style={{ width: 90, height: 90, objectFit: "contain", border: "1px solid #e0e0e0", borderRadius: 8 }} />
                  </div>
                )}
                {!data.form_imagen_url && (
                  <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center",
                    width: 90, height: 90, border: "2px dashed #ccc", borderRadius: 8, fontSize: 11, color: "#bbb" }}>
                    Sin logo
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* ── Galería de comprobantes ── */}
          <Section titulo={`📋 Comprobantes de pago (${data.pagos_imagenes?.length || 0})`}>
            {data.pagos_imagenes?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                {data.pagos_imagenes.map((item, i) => {
                  const url = typeof item === "string" ? item : item?.url;
                  return (
                  <div key={i} style={{ textAlign: "center" }}>
                    <img src={url} alt={`Comprobante ${i + 1}`}
                      style={{ width: "100%", aspectRatio: "1", objectFit: "cover",
                        border: "1px solid #e0e0e0", borderRadius: 6 }} />
                    <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>#{i + 1}</div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: "#fafafa", border: "1px dashed #ccc", borderRadius: 8,
                padding: "16px", textAlign: "center", color: "#bbb", fontSize: 13 }}>
                El cliente aún no ha subido comprobantes de pago.
              </div>
            )}
          </Section>

          {/* ── Métricas de acceso ── */}
          <Section titulo="📈 Actividad del enlace">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "Visitas", val: data.vistas || 0, icon: "👁️" },
                { label: "Días restantes", val: data.dias_restantes, icon: "⏳" },
                { label: "Primer acceso", val: fmtFecha(data.primer_acceso), icon: "🕐", small: true },
                { label: "Último acceso", val: fmtFecha(data.ultimo_acceso), icon: "🕑", small: true },
              ].map((m, i) => (
                <div key={i} style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "10px",
                  textAlign: "center", background: "#fafafa" }}>
                  <div style={{ fontSize: 20 }}>{m.icon}</div>
                  <div style={{ fontSize: m.small ? 10 : 18, fontWeight: m.small ? 400 : 800,
                    color: "#1565c0", marginTop: 2 }}>{m.val}</div>
                  <div style={{ fontSize: 10, color: "#888" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Pie del reporte ── */}
          <div style={{ borderTop: "1px solid #e0e0e0", marginTop: 16, paddingTop: 12,
            display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb" }}>
            <span>🌟 royalsensorymassage — Desarrollo Web Profesional</span>
            <span>Generado el {new Date().toLocaleString("es-PE")}</span>
            <span>Token: {token?.slice(0, 12)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sub-componentes ─────────────────────────────────────────────────────────────

function Section({ titulo, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "#1565c0",
        borderBottom: "2px solid #e3f2fd", paddingBottom: 6, marginBottom: 10 }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, val }) {
  if (!val) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8,
      padding: "4px 0", borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
      <span style={{ color: "#888", flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>{val}</span>
    </div>
  );
}

export default OnboardingReportePage;
