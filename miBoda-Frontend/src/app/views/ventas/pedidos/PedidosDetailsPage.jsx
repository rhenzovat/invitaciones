import React, { useEffect, useState, useCallback, useRef } from "react";
import { useIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import {
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Divider,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Button as ButtonDev } from "devextreme-react";
import { SelectBox } from "devextreme-react/select-box";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  SearchPanel,
} from "devextreme-react/data-grid";
import { EstadoDeEntrega } from "../../../utils/utils";
import FileViewer from "./FileViewer";
import PedidosRecibo from "./PedidosRecibo";
import { appLogoUrl } from "app/utils/appLogoUrl";
import {
  listar_historial_estados,
  actualizar_historial_estado,
  eliminar_historial_estado,
  eliminar_historial_por_estado,
  eliminar_todo_historial,
  actualizar_estado_pedido,
} from "../../../api/pedidos.api";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import DescriptionIcon from "@mui/icons-material/Description";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import { authJWTConfig } from "app/authJWTConfig";

// STYLED COMPONENTS
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "#f0f4f8",
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  marginBottom: theme.spacing(3),
  borderRadius: "16px",
  background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  boxShadow: "0 10px 40px rgba(30, 60, 114, 0.3)",
}));

const HeaderLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const HeaderIconWrapper = styled(Box)({
  width: "60px",
  height: "60px",
  borderRadius: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(10px)",
  "& svg": {
    fontSize: "32px",
    color: "#fff",
  },
});

const HeaderActions = styled(Box)({
  display: "flex",
  gap: "12px",
  alignItems: "center",
});

const InfoCard = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  height: "100%",
}));

const CardHeader = styled(Box)({
  padding: "16px 20px",
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
});

const CardIcon = styled(Box)(({ color }) => ({
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  backgroundColor: color || "#1e3c72",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& svg": {
    fontSize: "22px",
    color: "#fff",
  },
}));

const CardContent = styled(Box)({
  padding: "20px",
  backgroundColor: "#fff",
});

const InfoRow = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "16px",
  "&:last-child": {
    marginBottom: 0,
  },
});

const InfoIcon = styled(Box)(({ color }) => ({
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  backgroundColor: `${color}15`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  "& svg": {
    fontSize: "18px",
    color: color,
  },
}));

const ReceiptBox = styled(Paper)({
  border: "1px solid #e0e0e0",
  borderRadius: "16px",
  padding: "24px",
  textAlign: "center",
  backgroundColor: "#ffffff",
  position: "relative",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  background: "linear-gradient(to bottom, #ffffff 0%, #fdfdfd 100%)",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "6px",
    background: "repeating-linear-gradient(45deg, #1e3c72, #1e3c72 10px, #ffffff 10px, #ffffff 20px)",
    opacity: 0.8
  }
});

const StatusChip = styled(Chip)(({ statuscolor }) => ({
  fontWeight: 600,
  fontSize: "12px",
  height: "28px",
  backgroundColor: `${statuscolor}15`,
  color: statuscolor,
  border: `1px solid ${statuscolor}`,
  "& .MuiChip-icon": {
    color: statuscolor,
  },
}));

const SwitchCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ active }) => ({
  padding: "16px",
  borderRadius: "12px",
  backgroundColor: active ? "rgba(76, 175, 80, 0.08)" : "rgba(158, 158, 158, 0.08)",
  border: `1px solid ${active ? "#4caf50" : "#e0e0e0"}`,
  transition: "all 0.3s ease",
}));

const SummaryCard = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  marginTop: theme.spacing(3),
}));

const SummaryRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "highlight",
})(({ highlight }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: highlight ? "none" : "1px solid #f0f0f0",
  "&:last-child": {
    borderBottom: "none",
  },
}));

const DataGridWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  "& .dx-datagrid": {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  "& .dx-datagrid-headers": {
    backgroundColor: "#f8fafc",
    borderBottom: "2px solid #e8ecf0",
  },
  "& .dx-header-row td": {
    fontWeight: 600,
    color: "#1e3c72",
    fontSize: "13px",
    padding: "14px 12px",
  },
  "& .dx-data-row td": {
    padding: "14px 12px",
    fontSize: "14px",
  },
  "& .dx-row-alt > td": {
    backgroundColor: "#fafbfc",
  },
}));

const LogoWrapper = styled(Box)({
  display: "flex",
  justifyContent: "center",
  marginBottom: "20px",
  "& img": {
    maxWidth: "120px",
    height: "auto",
  },
});

const PedidosDetailsPage = (props) => {
  const { accessButton, dataRowEditNew } = props;
  const intl = useIntl();
  const [estadoDelProducto, setEstadoDelProducto] = useState([]);
  const [idEstadoProducto, setIdEstadoProducto] = useState(null);
  const [devuelto, setDevuelto] = useState(false);
  const [isComprobante, setIsComprobante] = useState(false);
  const [openRecibo, setOpenRecibo] = useState(false);
  const [openModalObservacion, setOpenModalObservacion] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [historialEstados, setHistorialEstados] = useState([]);
  const [editingHistorial, setEditingHistorial] = useState(null);
  const [editObservacion, setEditObservacion] = useState("");
  const [openModalBorrarHistorial, setOpenModalBorrarHistorial] = useState(false);
  const [estadoABorrar, setEstadoABorrar] = useState(null);
  const [openModalConfirmarEliminar, setOpenModalConfirmarEliminar] = useState(false);
  const [historialAEliminar, setHistorialAEliminar] = useState(null);
  const [openModalEliminarTodo, setOpenModalEliminarTodo] = useState(false);
  const [evidenciaFile, setEvidenciaFile] = useState(null);
  const [evidenciaPreviewUrl, setEvidenciaPreviewUrl] = useState(null);
  const [evidenciaPreviewFullUrl, setEvidenciaPreviewFullUrl] = useState(null);
  const [openCameraDialog, setOpenCameraDialog] = useState(false);
  const evidenciaInputRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const pedidoData = props.dataRowEditNew.listarDetalle?.[0] || {};
  const hasData = Object.keys(dataRowEditNew).length > 0;

  const buildEvidenciaPublicUrl = (relativePath) => {
    if (!relativePath) return "";
    const base = (authJWTConfig.domain || "").replace(/\/$/, "");
    const p = String(relativePath).replace(/^\//, "");
    return `${base}/${p}`;
  };

  const clearEvidenciaPendiente = useCallback(() => {
    setEvidenciaPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setEvidenciaFile(null);
    if (evidenciaInputRef.current) evidenciaInputRef.current.value = "";
  }, []);

  const aplicarArchivoEvidencia = useCallback((file) => {
    if (!file) return;
    setEvidenciaPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setEvidenciaFile(file);
  }, []);

  const stopCameraStream = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }, []);

  const handleEvidenciaChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    aplicarArchivoEvidencia(f);
  };

  const handleAbrirCamaraWeb = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert(
        "Este navegador no permite usar la cámara desde la página. Use “Elegir imagen” o pruebe con Chrome, Edge o Firefox actualizado."
      );
      return;
    }
    setOpenCameraDialog(true);
  };

  const captureCameraFrame = useCallback(() => {
    const video = cameraVideoRef.current;
    if (!video || !video.videoWidth) {
      alert("Espere a que la cámara muestre imagen.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `evidencia_${Date.now()}.jpg`, { type: "image/jpeg" });
        aplicarArchivoEvidencia(file);
        stopCameraStream();
        setOpenCameraDialog(false);
      },
      "image/jpeg",
      0.92
    );
  }, [aplicarArchivoEvidencia, stopCameraStream]);

  useEffect(() => {
    if (!openCameraDialog) return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        cameraStreamRef.current = stream;
        const el = cameraVideoRef.current;
        if (el) {
          el.srcObject = stream;
          await el.play().catch(() => {});
        }
      } catch (err) {
        console.error(err);
        alert(
          "No se pudo acceder a la cámara (permisos denegados o cámara en uso). Puede usar “Elegir imagen” para subir una foto."
        );
        setOpenCameraDialog(false);
      }
    })();
    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [openCameraDialog, stopCameraStream]);

  const isCheck = hasData ? pedidoData?.devolucion ?? false : false;
  const isCheckComprobante = hasData ? pedidoData?.comprobante_conforme ?? false : false;

  const handleChangeDevuelto = (event) => {
    const nuevoEstado = event.target.checked;
    setDevuelto(nuevoEstado);
    props.actualizarEstadoDevuelto({
      id_pedido: pedidoData.id_pedido,
      devolucion: nuevoEstado,
    });
  };

  const handleChangeComprobante = (event) => {
    const nuevoEstado = event.target.checked;
    setIsComprobante(nuevoEstado);
    props.actualizarComprobanteConforme({
      id_pedido: pedidoData.id_pedido,
      comprobante_conforme: nuevoEstado,
    });
  };

  async function cargarCombos() {
    const estadoProducto = EstadoDeEntrega();
    setEstadoDelProducto(estadoProducto);
  }

  const cargarHistorial = useCallback(async () => {
    if (pedidoData.id_pedido) {
      try {
        const historial = await listar_historial_estados({
          id_pedido: pedidoData.id_pedido,
        });
        setHistorialEstados(historial || []);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    }
  }, [pedidoData.id_pedido]);

  const changeEstadoPedido = useCallback((e) => {
    // Validar que pedidoData esté disponible
    if (!pedidoData || !pedidoData.id_pedido || pedidoData.estado === undefined || pedidoData.estado === null) {
      return;
    }

    const nuevoEstado = parseInt(e.value);
    const estadoActual = parseInt(pedidoData.estado);
    
    // Validar que ambos estados sean números válidos
    if (isNaN(nuevoEstado) || isNaN(estadoActual)) {
      return;
    }
    
    // Si el estado nuevo es igual al actual, no hacer nada
    if (nuevoEstado === estadoActual) {
      return;
    }
    
    // Detectar si está retrocediendo (nuevo estado < estado actual)
    // Excluir solo cuando se cambia DESDE cancelado (estado 7)
    const esRetroceso = nuevoEstado < estadoActual;
    const esDesdeCancelado = estadoActual === 7;
    
    // Mostrar modal si es retroceso y NO es desde cancelado
    if (esRetroceso && !esDesdeCancelado) {
      // Mostrar alerta para borrar historial del estado actual
      setEstadoABorrar(estadoActual);
      setIdEstadoProducto(nuevoEstado);
      setOpenModalBorrarHistorial(true);
    } else {
      // Avanzando normalmente o cambiando desde cancelado
      setIdEstadoProducto(nuevoEstado);
      setObservacion("");
      clearEvidenciaPendiente();
      setOpenModalObservacion(true);
    }
  }, [pedidoData.estado, pedidoData.id_pedido, clearEvidenciaPendiente]);

  const handleConfirmarBorrarHistorial = async (borrar) => {
    setOpenModalBorrarHistorial(false);
    
    if (borrar) {
      try {
        await eliminar_historial_por_estado({
          id_pedido: pedidoData.id_pedido,
          estado: estadoABorrar,
        });
        await cargarHistorial();
      } catch (error) {
        console.error("Error al borrar historial:", error);
      }
    }
    
    // Continuar con el cambio de estado
    setObservacion("");
    clearEvidenciaPendiente();
    setOpenModalObservacion(true);
  };

  const handleGuardarEstado = async () => {
    try {
      // Validar que el estado nuevo sea diferente al actual
      const estadoActualNum = parseInt(pedidoData.estado);
      const estadoNuevoNum = parseInt(idEstadoProducto);
      
      if (isNaN(estadoActualNum) || isNaN(estadoNuevoNum)) {
        setOpenModalObservacion(false);
        setObservacion("");
        clearEvidenciaPendiente();
        return;
      }
      
      if (estadoNuevoNum === estadoActualNum) {
        setOpenModalObservacion(false);
        setObservacion("");
        clearEvidenciaPendiente();
        return;
      }

      if (evidenciaFile) {
        const fd = new FormData();
        fd.append("id_pedido", String(pedidoData.id_pedido));
        fd.append("estado", String(estadoNuevoNum));
        fd.append("observacion", observacion || "");
        fd.append("evidencia", evidenciaFile);
        await actualizar_estado_pedido(fd);
      } else {
        await actualizar_estado_pedido({
          id_pedido: pedidoData.id_pedido,
          estado: estadoNuevoNum,
          observacion: observacion || null,
        });
      }

      setOpenModalObservacion(false);
      setObservacion("");
      clearEvidenciaPendiente();
      await cargarHistorial();
      
      // Forzar actualización local del estado inmediatamente ANTES de recargar
      if (dataRowEditNew?.listarDetalle?.[0]) {
        dataRowEditNew.listarDetalle[0].estado = estadoNuevoNum;
      }
      
      // Actualizar el estado en el componente padre para que se recargue
      // IMPORTANTE: actualizarEstaPedido solo debe recargar datos, NO actualizar de nuevo
      await props.actualizarEstaPedido({
        id_pedido: pedidoData.id_pedido,
        estado: estadoNuevoNum,
      });
    } catch (error) {
      console.error("Error al guardar estado:", error);
      // Mostrar mensaje de error al usuario
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const handleEditarHistorial = (item) => {
    setEditingHistorial(item.id_historial);
    setEditObservacion(item.observacion || "");
  };

  const handleGuardarEdicion = async () => {
    try {
      await actualizar_historial_estado({
        id_historial: editingHistorial,
        observacion: editObservacion,
      });
      setEditingHistorial(null);
      setEditObservacion("");
      await cargarHistorial();
    } catch (error) {
      console.error("Error al editar historial:", error);
    }
  };

  const handleEliminarHistorial = (idHistorial) => {
    setHistorialAEliminar(idHistorial);
    setOpenModalConfirmarEliminar(true);
  };

  const handleConfirmarEliminarHistorial = async () => {
    if (historialAEliminar) {
      try {
        await eliminar_historial_estado({ id_historial: historialAEliminar });
        await cargarHistorial();
        setOpenModalConfirmarEliminar(false);
        setHistorialAEliminar(null);
      } catch (error) {
        console.error("Error al eliminar historial:", error);
      }
    }
  };

  const handleEliminarTodoHistorial = async () => {
    try {
      await eliminar_todo_historial({ id_pedido: pedidoData.id_pedido });
      await cargarHistorial();
      setOpenModalEliminarTodo(false);
    } catch (error) {
      console.error("Error al eliminar todo el historial:", error);
    }
  };

  const getEstadoNombre = (estado) => {
    
    const estadosMap = {
      1: "Pedido recibido",
      2: "Pedido confirmado / Pago confirmado",
      3: "Preparando pedido",
      4: "Pedido listo",
      5: "En camino",
      6: "Entregado",
      7: "Cancelado o rechazado",
    };
    
   
    const estadoObj = estadoDelProducto.find((e) => e.Valor === estado);
    if (estadoObj) {
      return estadoObj.Descripcion;
    }
    
    
    if (estado !== null && estado !== undefined && estadosMap[estado]) {
      return estadosMap[estado];
    }
    
    return estado !== null && estado !== undefined ? `Estado ${estado}` : "Estado desconocido";
  };

  useEffect(() => {
    cargarCombos();
    setDevuelto(isCheck === 1);
    setIsComprobante(isCheckComprobante === 1);
  }, [isCheck, isCheckComprobante]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  
  useEffect(() => {
    if (pedidoData && pedidoData.id_pedido && pedidoData.estado !== undefined && pedidoData.estado !== null) {
      // Resetear el estado seleccionado al estado actual del pedido
      const estadoActual = parseInt(pedidoData.estado);
      if (!isNaN(estadoActual)) {
        setIdEstadoProducto(estadoActual);
        setObservacion("");
        clearEvidenciaPendiente();
        setOpenModalObservacion(false);
        setOpenModalBorrarHistorial(false);
        setEstadoABorrar(null);
      }
    }
  }, [pedidoData?.id_pedido, pedidoData?.estado, clearEvidenciaPendiente]);

  return (
    <PageContainer>
      {/* Header */}
      <HeaderCard elevation={0}>
        <HeaderLeft>
          <HeaderIconWrapper>
            <ReceiptLongIcon />
          </HeaderIconWrapper>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              {props.titulo}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <StatusChip
                icon={<ShoppingCartIcon />}
                label={`Pedido #${pedidoData.codigo_pedido || "---"}`}
                statuscolor="#fff"
                sx={{ backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.4)" }}
              />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Sistema de Gestión de Pedidos
              </Typography>
            </Box>
          </Box>
        </HeaderLeft>

        <HeaderActions>
          <ButtonDev
            icon="print"
            text="Recibo"
            type="normal"
            stylingMode="contained"
            onClick={() => setOpenRecibo(true)}
            style={{
              borderRadius: "12px",
              fontWeight: 600,
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
            }}
          />
          <ButtonDev
            icon="close"
            text="Volver"
            type="normal"
            stylingMode="outlined"
            onClick={props.cancelarEdicion}
            style={{
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
            }}
          />
        </HeaderActions>
      </HeaderCard>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Cliente Info */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <CardHeader>
              <CardIcon color="#1e3c72">
                <PersonIcon />
              </CardIcon>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="#1a2038">
                  Información del Cliente
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Datos del comprador
                </Typography>
              </Box>
            </CardHeader>
            <CardContent>
              <Box mb={3} textAlign="center">
                <LogoWrapper>
                   <img src={appLogoUrl()} alt="Logo" style={{ maxWidth: '140px' }} />
                </LogoWrapper>
                <Typography variant="h6" fontWeight={700} color="#1e3c72" mt={1}>
                  {pedidoData.cliente_nombre || "---"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                   Registro de cliente verificado
                </Typography>
              </Box>

              <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', width: 36, height: 36 }}>
                    <LocationOnIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Ubicación de Envío
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {pedidoData.direccion_envio_distrito || "---"} - {pedidoData.direccion_envio_provincia || "---"}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 36, height: 36 }}>
                    <EmailIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Correo Electrónico
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                      {pedidoData.direccion_envio_correo || "---"}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: '#fff3e0', color: '#ef6c00', width: 36, height: 36 }}>
                    <PhoneIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Teléfono / Celular
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {pedidoData.direccion_envio_telefono || "---"}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 36, height: 36 }}>
                    <HomeIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Dirección Completa
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                      {pedidoData.direccion_envio_ubicacion || "---"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {hasData && pedidoData.subido_comprobante_url && (
                <Box mt={3} p={2} bgcolor="#f0f4f8" borderRadius="12px" border="1px solid #d1d9e6">
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="#1e3c72" display="flex" alignItems="center" gap={1}>
                    <DescriptionIcon sx={{ fontSize: 18 }} />
                    Comprobante Adjunto
                  </Typography>
                  <FileViewer
                    fileUrl={`${import.meta.env.VITE_AUTHJWT_DOMAIN}/api/storage/${pedidoData.subido_comprobante_url}`}
                    fileName={pedidoData.subido_comprobante_url}
                  />
                </Box>
              )}
            </CardContent>
          </InfoCard>
        </Grid>

        {/* Pedido Info */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <CardHeader>
              <CardIcon color="#2196f3">
                <LocalShippingIcon />
              </CardIcon>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="#1a2038">
                  Estado del Pedido
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Seguimiento y control
                </Typography>
              </Box>
            </CardHeader>
            <CardContent>
              <InfoRow>
                <InfoIcon color="#ff9800">
                  <InventoryIcon />
                </InfoIcon>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Código de referencia
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#1e3c72">
                    {pedidoData.codigo_pedido || "---"}
                  </Typography>
                </Box>
              </InfoRow>

              <InfoRow>
                <InfoIcon color="#9c27b0">
                  <CalendarTodayIcon />
                </InfoIcon>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Fecha del pedido
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {pedidoData.created_at || "---"}
                  </Typography>
                </Box>
              </InfoRow>

              <Box my={2}>
                <SelectBox
                  value={idEstadoProducto ?? (pedidoData?.estado !== undefined && pedidoData?.estado !== null ? parseInt(pedidoData.estado) : null)}
                  onValueChanged={changeEstadoPedido}
                  valueExpr="Valor"
                  displayExpr="Descripcion"
                  label="Estado de entrega"
                  dataSource={estadoDelProducto}
                  placeholder="Seleccione estado..."
                  stylingMode="outlined"
                  labelMode="floating"
                  height={48}
                  disabled={!pedidoData || !pedidoData.id_pedido || pedidoData.estado === undefined || pedidoData.estado === null || estadoDelProducto.length === 0}
                />
              </Box>

              <SwitchCard active={devuelto}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AssignmentReturnIcon sx={{ color: devuelto ? "#f44336" : "#9e9e9e" }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    ¿Producto devuelto?
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={devuelto}
                      onChange={handleChangeDevuelto}
                      color="error"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      {devuelto ? "Sí, devuelto" : "No devuelto"}
                    </Typography>
                  }
                />
              </SwitchCard>
              {/* AGREGAR EL CODIGO DEL PRODUCTO */}
              <Box mt={2} p={2} bgcolor="#f8fafc" borderRadius="12px" border="1px solid #e0e6ed">
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <InventoryIcon sx={{ color: "#1e3c72", fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={600} color="#1e3c72">
                    Código(s) de Producto
                  </Typography>
                </Box>
                {dataRowEditNew?.listarDetalle?.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {dataRowEditNew.listarDetalle.map((item, index) => (
                      <Chip
                        key={index}
                        label={item.codigo_producto || "Sin código"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: "#1e3c72",
                          color: "#fff",
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">---</Typography>
                )}
              </Box>
            </CardContent>
          </InfoCard>
        </Grid>

        {/* Recibo Info */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <CardHeader>
              <CardIcon color="#4caf50">
                <ReceiptLongIcon />
              </CardIcon>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="#1a2038">
                  Comprobante de Pago
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Datos de facturación
                </Typography>
              </Box>
            </CardHeader>
            <CardContent>
              <ReceiptBox elevation={0}>
                <Box display="flex" justifyContent="center" mb={2}>
                    <Avatar sx={{ bgcolor: '#e8f0fe', color: '#1e3c72', width: 44, height: 44 }}>
                        <ReceiptLongIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                </Box>

                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    Documento Electrónico
                  </Typography>
                  <Typography variant="h6" fontWeight={900} color="#1e3c72" sx={{ mt: 0.5, letterSpacing: 0.5 }}>
                    {pedidoData.codigo_boleta_o_factura?.startsWith('F') ? "FACTURA DE VENTA" : "BOLETA DE VENTA"}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                
                <Box display="flex" justifyContent="space-between" mb={2} px={1}>
                    <Box textAlign="left">
                        <Typography variant="caption" color="text.secondary" display="block">
                            {pedidoData.codigo_boleta_o_factura?.startsWith('F') ? "RUC RECEPTOR" : "DNI / RUC"}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                            {pedidoData.direccion_envio_ruc || pedidoData.direccion_envio_dni || "---"}
                        </Typography>
                    </Box>
                    <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary" display="block">
                            Número de comprobante
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#2e7d32">
                            {pedidoData.codigo_boleta_o_factura || "---"}
                        </Typography>
                    </Box>
                </Box>

                <Chip
                  label={pedidoData.codigo_boleta_o_factura?.startsWith('F') ? "FACTURA" : "BOLETA"}
                  color={pedidoData.codigo_boleta_o_factura?.startsWith('F') ? "secondary" : "primary"}
                  size="small"
                  sx={{ fontWeight: 800, px: 2, height: 24 }}
                />
              </ReceiptBox>

              <Box mt={4} px={1}>
                <Typography variant="subtitle2" fontWeight={800} color="#1a2038" mb={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaymentIcon sx={{ fontSize: 18, color: '#1e3c72' }} />
                  Información de Pago
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2.5}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <InfoIcon color="#1e3c72">
                      <CreditCardIcon sx={{ fontSize: 16 }} />
                    </InfoIcon>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>
                        Canal de Pago
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {pedidoData.metodo_pago === 'Pago Online' || pedidoData.radio_metodo_pago === 1 || pedidoData.radio_metodo_pago === "1" 
                          ? "Tarjeta / Pasarela Online" 
                          : "Pago contra entrega"}
                      </Typography>
                    </Box>
                  </Box>

                  {pedidoData.metodo_pago !== 'Pago Online' && pedidoData.radio_metodo_pago !== 1 && pedidoData.radio_metodo_pago !== "1" && (
                    <Box display="flex" alignItems="center" gap={2}>
                      <InfoIcon color={pedidoData.radio_tipo_pago === "yape" ? "#8e24aa" : "#4caf50"}>
                        <DescriptionIcon sx={{ fontSize: 16 }} />
                      </InfoIcon>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>
                          Modalidad
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {pedidoData.radio_tipo_pago === "yape" ? "Yape con DESCUENTO" : "Pago Normal"}
                          </Typography>
                          {pedidoData.radio_tipo_pago === "yape" && (
                            <Chip 
                              label="OFERTA" 
                              size="small" 
                              sx={{ backgroundColor: "#8e24aa", color: "white", fontWeight: 800, fontSize: '0.6rem', height: 16 }} 
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Monto pagado y vuelto — solo contra entrega */}
              {(pedidoData.radio_metodo_pago !== 1 && pedidoData.radio_metodo_pago !== "1") &&
                Number(pedidoData.monto_pagado_cliente || 0) > 0 && (() => {
                  const _subtotal   = Number(pedidoData.pro_total || 0);
                  const _desc       = Number(pedidoData.pro_descuento || 0) + Number(pedidoData.pro_descuento_cupon || 0);
                  const _igv        = Number(pedidoData.pro_igv || 0);
                  const _envio      = Number(pedidoData.pro_costo_envio || 0);
                  const _total      = _subtotal - _desc + _igv + _envio;
                  const _pagado     = Number(pedidoData.monto_pagado_cliente);
                  const _vuelto     = _pagado - _total;
                  return (
                    <Box mt={3} p={2} bgcolor="#f0fdf4" borderRadius="12px" border="1px solid #86efac">
                      <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="#16a34a"
                        display="flex" alignItems="center" gap={1}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />
                        Pago en Efectivo
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1.5}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <InfoIcon color="#16a34a">
                            <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
                          </InfoIcon>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>
                              Monto que pagará el cliente
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="#16a34a" fontSize="1rem">
                              S/ {_pagado.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                        {_vuelto > 0 && (
                          <Box display="flex" alignItems="center" gap={2}>
                            <InfoIcon color="#d97706">
                              <PaymentIcon sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>
                                Vuelto estimado
                              </Typography>
                              <Typography variant="body2" fontWeight={700} color="#d97706" fontSize="0.95rem">
                                S/ {_vuelto.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })()
              }

              <Box mt={4}>
                <SwitchCard active={isComprobante}>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <VerifiedIcon sx={{ color: isComprobante ? "#4caf50" : "#9e9e9e" }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                      ¿Comprobante aprobado?
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isComprobante}
                        onChange={handleChangeComprobante}
                        color="success"
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={600} color={isComprobante ? "success.main" : "text.secondary"}>
                        {isComprobante ? "Conforme" : "Pendiente"}
                      </Typography>
                    }
                  />
                </SwitchCard>
              </Box>
            </CardContent>
          </InfoCard>
        </Grid>
      </Grid>

      {/* Products DataGrid */}
      <DataGridWrapper>
        <Paper sx={{ borderRadius: "16px", overflow: "hidden" }}>
          <Box p={2} bgcolor="#f8fafc" borderBottom="1px solid #e8ecf0">
            <Box display="flex" alignItems="center" gap={1}>
              <ShoppingCartIcon sx={{ color: "#1e3c72" }} />
              <Typography variant="h6" fontWeight={600} color="#1e3c72">
                Detalle de Productos
              </Typography>
            </Box>
          </Box>
          <DataGrid
            keyExpr="RowIndex"
            dataSource={dataRowEditNew.listarDetalle}
            showBorders={false}
            focusedRowEnabled={true}
            defaultFocusedRowIndex={0}
            columnAutoWidth={true}
            rowAlternationEnabled={true}
            showColumnLines={false}
          >
            <Paging defaultPageSize={10} />
            <Pager showPageSizeSelector={true} showInfo={true} />
            <FilterRow visible={false} />
            <SearchPanel visible={false} />

            <Column
              dataField="pro_nombre"
              caption="Producto"
              width="50%"
              cellRender={(data) => (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: "#1e3c72", width: 32, height: 32 }}>
                    <InventoryIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="body2" fontWeight={500}>
                    {data.value}
                  </Typography>
                </Box>
              )}
            />
            <Column
              dataField="pro_precio"
              caption="Precio Unit."
              width="15%"
              alignment="right"
              cellRender={(data) => (
                <Typography variant="body2" fontWeight={500}>
                  S/ {Number(data.value || 0).toFixed(2)}
                </Typography>
              )}
            />
            <Column
              dataField="pro_cantidad"
              caption="Cant."
              width="10%"
              alignment="center"
              cellRender={(data) => (
                <Chip label={data.value} size="small" color="primary" variant="outlined" />
              )}
            />
            <Column
              dataField="pro_total"
              caption="Total"
              width="15%"
              alignment="right"
              cellRender={(data) => (
                <Typography variant="body2" fontWeight={700} color="#2e7d32">
                  S/ {Number(data.value || 0).toFixed(2)}
                </Typography>
              )}
            />
          </DataGrid>
        </Paper>
      </DataGridWrapper>

      {/* Summary */}
      <Grid container justifyContent="flex-end" mt={3}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard>
            <Box p={2} bgcolor="#1e3c72" color="#fff">
              <Typography variant="subtitle1" fontWeight={600}>
                Resumen del Pedido
              </Typography>
            </Box>
            <Box p={3}>
              <SummaryRow>
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  S/ {hasData ? Number(pedidoData.pro_total || 0).toFixed(2) : "0.00"}
                </Typography>
              </SummaryRow>

              <SummaryRow>
                <Typography variant="body2" color="text.secondary">
                  Descuento
                </Typography>
                <Typography variant="body1" fontWeight={500} color="#f44336">
                  - S/ {hasData ? pedidoData.pro_descuento || "0.00" : "0.00"}
                </Typography>
              </SummaryRow>

              <SummaryRow>
                <Typography variant="body2" color="text.secondary">
                  Cupón de descuento
                </Typography>
                <Typography variant="body1" fontWeight={500} color="#f44336">
                  - S/ {hasData ? pedidoData.pro_descuento_cupon || "0.00" : "0.00"}
                </Typography>
              </SummaryRow>

              <SummaryRow>
                <Typography variant="body2" color="text.secondary">
                  IGV (18%)
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  S/ {hasData ? pedidoData.pro_igv || "0.00" : "0.00"}
                </Typography>
              </SummaryRow>

              <SummaryRow>
                <Typography variant="body2" color="text.secondary">
                  Costo de envío
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  S/ {hasData ? pedidoData.pro_costo_envio || "0.00" : "0.00"}
                </Typography>
              </SummaryRow>

              <Divider sx={{ my: 2 }} />

              <SummaryRow highlight>
                <Typography variant="h6" fontWeight={700} color="#1e3c72">
                  TOTAL
                </Typography>
                <Typography variant="h5" fontWeight={700} color="#2e7d32">
                  S/ {hasData ? Number(pedidoData.pro_total || 0).toFixed(2) : "0.00"}
                </Typography>
              </SummaryRow>
            </Box>
          </SummaryCard>
        </Grid>
      </Grid>
      {/* Historial de Estados */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <InfoCard>
            <CardHeader>
              <CardIcon color="#9c27b0">
                <HistoryIcon />
              </CardIcon>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} color="#1a2038">
                  Historial de Estados
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Registro de cambios de estado ({historialEstados.length} registro{historialEstados.length !== 1 ? 's' : ''})
                </Typography>
              </Box>
              {historialEstados.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenModalEliminarTodo(true)}
                  sx={{ ml: 2 }}
                >
                  Eliminar todo
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {historialEstados.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                  No hay historial de estados registrado
                </Typography>
              ) : (
                <Box
                  sx={{
                    maxHeight: historialEstados.length > 8 ? '600px' : 'none',
                    overflowY: historialEstados.length > 8 ? 'auto' : 'visible',
                    pr: historialEstados.length > 8 ? 1 : 0,
                  }}
                >
                  <List>
                    {historialEstados.map((item, index) => (
                    <React.Fragment key={item.id_historial}>
                      <ListItem
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#fafbfc" : "#fff",
                          borderRadius: "8px",
                          mb: 1,
                          border: "1px solid #e8ecf0",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Chip
                              label={getEstadoNombre(item.estado_anterior) || "Inicial"}
                              size="small"
                              sx={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              →
                            </Typography>
                            <Chip
                              label={getEstadoNombre(item.estado_nuevo)}
                              size="small"
                              sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32", fontWeight: 600 }}
                            />
                          </Box>
                          {editingHistorial === item.id_historial ? (
                            <Box>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                value={editObservacion}
                                onChange={(e) => setEditObservacion(e.target.value)}
                                placeholder="Observación (opcional)"
                                size="small"
                                sx={{ mb: 1 }}
                              />
                              <Box display="flex" gap={1}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<SaveIcon />}
                                  onClick={handleGuardarEdicion}
                                  sx={{ backgroundColor: "#4caf50" }}
                                >
                                  Guardar
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CancelIcon />}
                                  onClick={() => {
                                    setEditingHistorial(null);
                                    setEditObservacion("");
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <>
                              {item.observacion && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  <strong>Observación:</strong> {item.observacion}
                                </Typography>
                              )}
                              {item.evidencia_url && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    mb: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                                    Evidencia:
                                  </Typography>
                                  <Box
                                    component="img"
                                    src={buildEvidenciaPublicUrl(item.evidencia_url)}
                                    alt="Evidencia de entrega"
                                    onClick={() =>
                                      setEvidenciaPreviewFullUrl(buildEvidenciaPublicUrl(item.evidencia_url))
                                    }
                                    sx={{
                                      maxWidth: 140,
                                      maxHeight: 100,
                                      borderRadius: 1,
                                      objectFit: "cover",
                                      border: "1px solid #e0e0e0",
                                      cursor: "pointer",
                                    }}
                                  />
                                  <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<ImageIcon />}
                                    onClick={() =>
                                      setEvidenciaPreviewFullUrl(buildEvidenciaPublicUrl(item.evidencia_url))
                                    }
                                  >
                                    Vista previa
                                  </Button>
                                </Box>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {item.usuario?.name || "Sistema"} • {new Date(item.created_at).toLocaleString("es-PE")}
                              </Typography>
                            </>
                          )}
                        </Box>
                        {editingHistorial !== item.id_historial && (
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleEditarHistorial(item)}
                              sx={{ mr: 1, color: "#2196f3" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleEliminarHistorial(item.id_historial)}
                              sx={{ color: "#f44336" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                      {index < historialEstados.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </InfoCard>
        </Grid>
      </Grid>

      {/* Modal de Confirmación para Borrar Historial */}
      <Dialog
        open={openModalBorrarHistorial}
        onClose={() => {
          setOpenModalBorrarHistorial(false);
          setEstadoABorrar(null);
          setIdEstadoProducto(pedidoData.estado);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={600}>
              ¿Borrar historial del estado anterior?
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Estás retrocediendo el pedido de <strong>{getEstadoNombre(estadoABorrar)}</strong> a <strong>{getEstadoNombre(idEstadoProducto)}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ¿Deseas eliminar el historial del estado anterior ({getEstadoNombre(estadoABorrar)}) para evitar acumulación de registros?
          </Typography>
          {estadoABorrar && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
              Estado actual del pedido: {getEstadoNombre(pedidoData.estado)} (Estado {pedidoData.estado})
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => handleConfirmarBorrarHistorial(false)}
            variant="outlined"
            color="primary"
          >
            No borrar
          </Button>
          <Button
            onClick={() => handleConfirmarBorrarHistorial(true)}
            variant="contained"
            color="error"
            autoFocus
          >
            Sí, borrar historial
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmación para Eliminar Todo el Historial */}
      <Dialog
        open={openModalEliminarTodo}
        onClose={() => setOpenModalEliminarTodo(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={600}>
              ¿Eliminar todo el historial?
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Estás a punto de eliminar <strong>todos los registros</strong> del historial de estados de este pedido.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción no se puede deshacer. Se eliminarán permanentemente <strong>{historialEstados.length} registro{historialEstados.length !== 1 ? 's' : ''}</strong> del historial.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setOpenModalEliminarTodo(false)}
            variant="outlined"
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEliminarTodoHistorial}
            variant="contained"
            color="error"
            autoFocus
          >
            Eliminar todo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmación para Eliminar Registro Individual */}
      <Dialog
        open={openModalConfirmarEliminar}
        onClose={() => {
          setOpenModalConfirmarEliminar(false);
          setHistorialAEliminar(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={600}>
              Confirmar eliminación
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Está seguro de eliminar este registro del historial?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción no se puede deshacer. El registro será eliminado permanentemente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => {
              setOpenModalConfirmarEliminar(false);
              setHistorialAEliminar(null);
            }}
            variant="outlined"
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminarHistorial}
            variant="contained"
            color="error"
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Observación */}
      <Dialog
        open={openModalObservacion}
        onClose={() => {
          setOpenModalObservacion(false);
          setIdEstadoProducto(pedidoData.estado);
          clearEvidenciaPendiente();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShippingIcon sx={{ color: "#1e3c72" }} />
              <Typography variant="h6" fontWeight={600}>
                Cambiar estado del pedido
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setOpenModalObservacion(false);
                setIdEstadoProducto(pedidoData.estado);
                clearEvidenciaPendiente();
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Estado actual: <strong>{getEstadoNombre(pedidoData.estado)}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nuevo estado: <strong>{getEstadoNombre(idEstadoProducto)}</strong>
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Observación (opcional)"
            label="Observación"
            variant="outlined"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Evidencia fotográfica (opcional): use la cámara dentro de la web, o elija un archivo (galería / carpeta).
              En PC suele abrirse el selector de archivos; “Cámara en esta página” usa la webcam sin salir del sitio.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<VideocamIcon />}
                onClick={handleAbrirCamaraWeb}
              >
                Cámara en esta página
              </Button>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
                size="small"
              >
                Elegir imagen
                <input
                  ref={evidenciaInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleEvidenciaChange}
                />
              </Button>
            </Box>
            {evidenciaPreviewUrl && (
              <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Box
                  component="img"
                  src={evidenciaPreviewUrl}
                  alt="Vista previa evidencia"
                  sx={{
                    maxWidth: 160,
                    maxHeight: 120,
                    borderRadius: 1,
                    objectFit: "cover",
                    border: "1px solid #e0e0e0",
                  }}
                />
                <Button size="small" color="inherit" onClick={clearEvidenciaPendiente}>
                  Quitar imagen
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpenModalObservacion(false);
              setIdEstadoProducto(pedidoData.estado);
              clearEvidenciaPendiente();
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarEstado}
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: "#1e3c72" }}
          >
            Guardar Cambio
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCameraDialog}
        onClose={() => {
          stopCameraStream();
          setOpenCameraDialog(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Cámara web
          <IconButton
            size="small"
            onClick={() => {
              stopCameraStream();
              setOpenCameraDialog(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Si el navegador lo pide, permita el acceso a la cámara. Pulse “Capturar foto” cuando la imagen esté lista.
          </Typography>
          <Box
            sx={{
              bgcolor: "#111",
              borderRadius: 1,
              overflow: "hidden",
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", maxHeight: 360, objectFit: "contain" }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={() => {
              stopCameraStream();
              setOpenCameraDialog(false);
            }}
          >
            Cerrar
          </Button>
          <Button variant="contained" onClick={captureCameraFrame} startIcon={<PhotoCameraIcon />}>
            Capturar foto
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(evidenciaPreviewFullUrl)}
        onClose={() => setEvidenciaPreviewFullUrl(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Evidencia fotográfica
          <IconButton onClick={() => setEvidenciaPreviewFullUrl(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", p: 2 }}>
          {evidenciaPreviewFullUrl && (
            <Box
              component="img"
              src={evidenciaPreviewFullUrl}
              alt="Evidencia"
              sx={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain" }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Recibo Térmico Modal */}
      <PedidosRecibo
        open={openRecibo}
        onClose={() => setOpenRecibo(false)}
        pedidoData={pedidoData}
        listarDetalle={dataRowEditNew.listarDetalle}
      />
    </PageContainer>
  );
};

export default PedidosDetailsPage;
