import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";
import { QRCodeSVG } from "qrcode.react";
import { appLogoUrl } from "app/utils/appLogoUrl";

// ==================== STYLED COMPONENTS ====================
const TicketDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    borderRadius: "12px",
    maxWidth: "380px",
    width: "100%",
    margin: "16px",
  },
});

const DialogHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 20px",
  background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  color: "#fff",
});

const TicketWrapper = styled(Box)({
  padding: "20px 16px",
  display: "flex",
  justifyContent: "center",
  backgroundColor: "#f0f4f8",
});

// ==================== TICKET (RECIBO) STYLED ====================
const Ticket = styled(Box)({
  width: "302px",
  backgroundColor: "#fff",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px",
  color: "#000",
  padding: "16px 12px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
  borderTop: "3px dashed #ccc",
  borderBottom: "3px dashed #ccc",
  position: "relative",
  "&::before, &::after": {
    content: '""',
    position: "absolute",
    left: 0,
    right: 0,
    height: "6px",
    background:
      "radial-gradient(circle, #f0f4f8 3px, transparent 3px) repeat-x",
    backgroundSize: "12px 6px",
  },
  "&::before": { top: "-6px" },
  "&::after": { bottom: "-6px" },
});

const TicketLogo = styled("img")({
  maxWidth: "100px",
  height: "auto",
  display: "block",
  margin: "0 auto 4px",
});

const TicketTitle = styled(Typography)({
  fontFamily: "'Courier New', Courier, monospace",
  fontWeight: 700,
  fontSize: "16px",
  textAlign: "center",
  letterSpacing: "3px",
  textTransform: "uppercase",
  marginBottom: "2px",
});

const TicketSubtitle = styled(Typography)({
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "10px",
  textAlign: "center",
  color: "#666",
  marginBottom: "8px",
});

const Separator = styled(Box)({
  borderBottom: "1px dashed #999",
  margin: "8px 0",
});

const SeparatorDouble = styled(Box)({
  borderBottom: "2px dashed #333",
  margin: "10px 0",
});

const InfoLine = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "1px 0",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px",
  lineHeight: 1.4,
});

const InfoLabel = styled("span")({
  fontWeight: 700,
  color: "#333",
  flexShrink: 0,
  marginRight: "8px",
});

const InfoValue = styled("span")({
  textAlign: "right",
  color: "#000",
  wordBreak: "break-word",
});

const ProductHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "10px",
  fontWeight: 700,
  color: "#333",
  padding: "4px 0 2px",
  borderBottom: "1px solid #333",
  textTransform: "uppercase",
});

const ProductRow = styled(Box)({
  padding: "3px 0",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px",
  borderBottom: "1px dotted #ddd",
  "&:last-child": {
    borderBottom: "none",
  },
});

const ProductName = styled(Typography)({
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px",
  fontWeight: 600,
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const ProductDetail = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px",
  color: "#555",
});

const TotalLine = styled(Box)(({ bold }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: "2px 0",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: bold ? "14px" : "11px",
  fontWeight: bold ? 700 : 400,
  color: bold ? "#000" : "#333",
}));

const QRContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  margin: "10px 0 4px",
});

const FooterText = styled(Typography)({
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "11px",
  textAlign: "center",
  fontWeight: 700,
  marginTop: "6px",
});

const FooterSubText = styled(Typography)({
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "9px",
  textAlign: "center",
  color: "#888",
  marginTop: "2px",
});

// ==================== PRINT STYLES ====================
const PrintStyles = () => (
  <style>
    {`
      @media print {
        body * { visibility: hidden !important; }
        #recibo-termico, #recibo-termico * { visibility: visible !important; }
        #recibo-termico {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 80mm !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }
        #recibo-termico::before, #recibo-termico::after {
          display: none !important;
        }
        @page {
          size: 80mm auto;
          margin: 0;
        }
      }
    `}
  </style>
);

// ==================== COMPONENT ====================
const PedidosRecibo = ({ open, onClose, pedidoData, listarDetalle }) => {
  const ticketRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  if (!pedidoData) return null;

  const productos = listarDetalle || [];
  const fecha = pedidoData.created_at || "---";
  const codigoPedido = pedidoData.codigo_pedido || "---";
  const cliente = pedidoData.cliente_nombre || "---";
  const direccion = pedidoData.direccion_envio_ubicacion || "";
  const rucDni =
    pedidoData.direccion_envio_ruc ||
    pedidoData.direccion_envio_dni ||
    "";
  const comprobante = pedidoData.codigo_boleta_o_factura || "";

  const subtotal = Number(pedidoData.pro_total || 0);
  const descuento = Number(pedidoData.pro_descuento || 0);
  const descuentoCupon = Number(pedidoData.pro_descuento_cupon || 0);
  const igv = Number(pedidoData.pro_igv || 0);
  const costoEnvio = Number(pedidoData.pro_costo_envio || 0);
  const totalDescuentos = descuento + descuentoCupon;
  const total = subtotal - totalDescuentos + igv + costoEnvio;

  const esContraEntrega = pedidoData.radio_metodo_pago !== 1 && pedidoData.radio_metodo_pago !== "1";
  const montoPagadoCliente = Number(pedidoData.monto_pagado_cliente || 0);
  const vueltoEstimado = montoPagadoCliente > 0 ? montoPagadoCliente - total : 0;

  const totalItems = productos.reduce(
    (acc, p) => acc + Number(p.pro_cantidad || 0),
    0
  );

  const ahora = new Date();
  const horaImpresion = ahora.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <>
      <PrintStyles />
      <TicketDialog open={open} onClose={onClose} maxWidth="sm">
        <DialogHeader>
          <Box display="flex" alignItems="center" gap={1}>
            <PrintIcon sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Previsualización de Recibo
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogHeader>

        <DialogContent sx={{ p: 0 }}>
          <TicketWrapper>
            <Ticket id="recibo-termico" ref={ticketRef}>
              {/* ===== HEADER ===== */}
              <TicketLogo
                src={appLogoUrl()}
                alt="Logo"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <TicketTitle>royalsensorymassage</TicketTitle>
              <TicketSubtitle>Tu minimarket de confianza</TicketSubtitle>

              <SeparatorDouble />

              {/* ===== DATOS DEL PEDIDO ===== */}
              <Box sx={{ textAlign: "center", mb: 0.5 }}>
                <Typography
                  sx={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  COMPROBANTE DE VENTA
                </Typography>
              </Box>

              <Separator />

              <InfoLine>
                <InfoLabel>Pedido:</InfoLabel>
                <InfoValue>{codigoPedido}</InfoValue>
              </InfoLine>
              <InfoLine>
                <InfoLabel>Fecha:</InfoLabel>
                <InfoValue>{fecha}</InfoValue>
              </InfoLine>
              <InfoLine>
                <InfoLabel>Cliente:</InfoLabel>
                <InfoValue>{cliente}</InfoValue>
              </InfoLine>
              {rucDni && (
                <InfoLine>
                  <InfoLabel>RUC/DNI:</InfoLabel>
                  <InfoValue>{rucDni}</InfoValue>
                </InfoLine>
              )}
              {direccion && (
                <InfoLine>
                  <InfoLabel>Dir.:</InfoLabel>
                  <InfoValue
                    style={{ fontSize: "10px", maxWidth: "180px" }}
                  >
                    {direccion}
                  </InfoValue>
                </InfoLine>
              )}
              {comprobante && (
                <InfoLine>
                  <InfoLabel>N° Comp.:</InfoLabel>
                  <InfoValue>{comprobante}</InfoValue>
                </InfoLine>
              )}

              <SeparatorDouble />

              {/* ===== PRODUCTOS ===== */}
              <ProductHeader>
                <span style={{ flex: 2 }}>Producto</span>
                <span style={{ width: "35px", textAlign: "center" }}>
                  Cant
                </span>
                <span style={{ width: "55px", textAlign: "right" }}>
                  P.Unit
                </span>
                <span style={{ width: "60px", textAlign: "right" }}>
                  Total
                </span>
              </ProductHeader>

              {productos.map((item, idx) => (
                <ProductRow key={idx}>
                  <ProductName>{item.pro_nombre || "Producto"}</ProductName>
                  <ProductDetail>
                    <span style={{ flex: 2 }}></span>
                    <span style={{ width: "35px", textAlign: "center" }}>
                      {item.pro_cantidad || 0}
                    </span>
                    <span style={{ width: "55px", textAlign: "right" }}>
                      {Number(item.pro_precio || 0).toFixed(2)}
                    </span>
                    <span style={{ width: "60px", textAlign: "right" }}>
                      {Number(item.pro_total || 0).toFixed(2)}
                    </span>
                  </ProductDetail>
                </ProductRow>
              ))}

              <Separator />

              <InfoLine>
                <span
                  style={{ fontSize: "10px", color: "#666" }}
                >
                  Total de artículos: {totalItems}
                </span>
              </InfoLine>

              <SeparatorDouble />

              {/* ===== RESUMEN ===== */}
              <TotalLine>
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </TotalLine>
              {totalDescuentos > 0 && (
                <TotalLine>
                  <span>Descuento</span>
                  <span>- S/ {totalDescuentos.toFixed(2)}</span>
                </TotalLine>
              )}
              {igv > 0 && (
                <TotalLine>
                  <span>IGV (18%)</span>
                  <span>S/ {igv.toFixed(2)}</span>
                </TotalLine>
              )}
              {costoEnvio > 0 && (
                <TotalLine>
                  <span>Envío</span>
                  <span>S/ {costoEnvio.toFixed(2)}</span>
                </TotalLine>
              )}

              <SeparatorDouble />

              <TotalLine bold>
                <span>TOTAL A PAGAR</span>
                <span>S/ {total.toFixed(2)}</span>
              </TotalLine>

              {esContraEntrega && montoPagadoCliente > 0 && (
                <>
                  <Separator />
                  <TotalLine>
                    <span>Efectivo</span>
                    <span>S/ {montoPagadoCliente.toFixed(2)}</span>
                  </TotalLine>
                  {vueltoEstimado > 0 && (
                    <TotalLine>
                      <span>Vuelto</span>
                      <span>S/ {vueltoEstimado.toFixed(2)}</span>
                    </TotalLine>
                  )}
                </>
              )}

              <SeparatorDouble />

              {/* ===== QR CODE ===== */}
              <QRContainer>
                <QRCodeSVG
                  value={`PEDIDO:${codigoPedido}|TOTAL:${total.toFixed(2)}|FECHA:${fecha}`}
                  size={90}
                  level="M"
                  includeMargin={false}
                />
                <Typography
                  sx={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "8px",
                    color: "#999",
                    mt: 0.5,
                  }}
                >
                  Escanea para verificar
                </Typography>
              </QRContainer>

              <Separator />

              {/* ===== FOOTER ===== */}
              <FooterText>¡Gracias por su compra!</FooterText>
              <FooterSubText>
                Conserve este comprobante como garantía
              </FooterSubText>
              <FooterSubText sx={{ mt: 0.5 }}>
                {horaImpresion}
              </FooterSubText>
              <FooterSubText>www.royalsensorymassage.com</FooterSubText>
            </Ticket>
          </TicketWrapper>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#fafafa",
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              color: "#666",
              borderColor: "#ddd",
            }}
          >
            Cerrar
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              background:
                "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              boxShadow: "0 4px 12px rgba(30, 60, 114, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(30, 60, 114, 0.4)",
              },
            }}
          >
            Imprimir Recibo
          </Button>
        </DialogActions>
      </TicketDialog>
    </>
  );
};

export default PedidosRecibo;
