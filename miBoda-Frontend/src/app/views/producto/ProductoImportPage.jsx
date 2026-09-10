import React, { useState, useRef, useEffect } from "react";
import { useIntl, injectIntl } from "react-intl";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  SearchPanel,
  ColumnChooser,
  ColumnChooserSearch,
  ColumnChooserSelection,
  Position,
  Scrolling,
} from "devextreme-react/data-grid";
import { Button as ButtonDev } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../partials/content/Portlet";
import { SimpleCard } from "app/components";
import Confirm from "../../components/Confirm";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import {
  importarProductosExcel,
  importarImagenesZip,
  listarProductosPorFechas,
  descargarProductosExcel,
} from "../../api/producto.api";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import CloudUploadIcon         from "@mui/icons-material/CloudUpload";
import TableChartIcon          from "@mui/icons-material/TableChart";
import CheckCircleOutlineIcon  from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon        from "@mui/icons-material/WarningAmber";
import FolderZipIcon           from "@mui/icons-material/FolderZip";
import ImageIcon               from "@mui/icons-material/Image";
import InfoOutlinedIcon        from "@mui/icons-material/InfoOutlined";
import { TextField, Box, IconButton } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ProductoImportPage = (props) => {
  const intl = useIntl();
  const fileInputRef = useRef(null);
  const [listProductos, setListProductos] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [importResult, setImportResult] = useState({
    totalImportados: 0,
    totalFallidos: 0,
    noImportados: [],
  });

  // ZIP de imágenes
  const zipInputRef = useRef(null);
  const [pendingZip, setPendingZip] = useState(null);
  const [showZipConfirmModal, setShowZipConfirmModal] = useState(false);
  const [showImageResultModal, setShowImageResultModal] = useState(false);
  const [imageImportResult, setImageImportResult] = useState(null);

  const loadProductos = async () => {
    try {
      props.setLoading(true);
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      const data = await listarProductosPorFechas(params);
      setListProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
    } finally {
      props.setLoading(false);
    }
  };

  const handleFiltrar = () => {
    loadProductos();
  };

  const handleDescargar = async () => {
    try {
      props.setLoading(true);
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      const res = await descargarProductosExcel(params);
      if (res.success && res.result?.fileBase64 && res.result?.fileName) {
        const link = document.createElement("a");
        link.href = res.result.fileBase64;
        link.download = res.result.fileName;
        link.click();
        toastSuccess("Archivo descargado correctamente");
      } else {
        handleErrorMessages("Descarga", new Error(res.message || "Error al descargar"));
      }
    } catch (err) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
    } finally {
      props.setLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        new Error("Seleccione un archivo Excel válido (.xlsx, .xls, .csv)")
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setPendingFile(file);
    setShowConfirmModal(true);
  };

  const doUpload = async (file) => {
    if (!file) return;
    try {
      props.setLoading(true);
      const formData = new FormData();
      formData.append("archivo_excel", file);

      const response = await importarProductosExcel(formData);
      if (response.success) {
        setImportResult({
          totalImportados: response.total_importados ?? 0,
          totalFallidos:   response.total_fallidos   ?? 0,
          noImportados:    Array.isArray(response.no_importados) ? response.no_importados : [],
        });
        setShowResultModal(true);
        loadProductos();
      } else {
        handleErrorMessages(
          intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
          new Error(response.message || "Error al importar")
        );
      }
    } catch (error) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        error
      );
    } finally {
      props.setLoading(false);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmUpload = () => {
    if (pendingFile) {
      doUpload(pendingFile);
    }
    setShowConfirmModal(false);
  };

  const handleCancelUpload = () => {
    setPendingFile(null);
    setShowConfirmModal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    loadProductos();
  }, []);


  // ── Handlers imágenes ZIP ─────────────────────────────────────────────────
  const triggerZipInput = () => zipInputRef.current?.click();

  const handleZipSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        new Error("Seleccione un archivo .zip válido")
      );
      if (zipInputRef.current) zipInputRef.current.value = "";
      return;
    }
    setPendingZip(file);
    setShowZipConfirmModal(true);
  };

  const doUploadZip = async (file) => {
    if (!file) return;
    try {
      props.setLoading(true);
      const formData = new FormData();
      formData.append("archivo_zip", file);
      const response = await importarImagenesZip(formData);
      if (response.success) {
        setImageImportResult(response);
        setShowImageResultModal(true);
        await loadProductos();
        toastSuccess(response.message || "Imágenes procesadas");
      } else {
        handleErrorMessages(
          intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
          new Error(response.message || "Error al procesar el ZIP")
        );
      }
    } catch (error) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        error
      );
    } finally {
      props.setLoading(false);
      setPendingZip(null);
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  };

  const handleConfirmZip = () => {
    if (pendingZip) doUploadZip(pendingZip);
    setShowZipConfirmModal(false);
  };

  const handleCancelZip = () => {
    setPendingZip(null);
    setShowZipConfirmModal(false);
    if (zipInputRef.current) zipInputRef.current.value = "";
  };

  const plantillaDownload = () => {
    window.open(`../../assets/images/prototipos/plantilla_productos.xlsx`, "_blank");
  };

  const chipColor = (motivo = "") =>
    motivo.toLowerCase().includes("duplicado") ? "warning" : "error";

  // ── Scroll estilo Excel ──────────────────────────────────────────
  const gridImportRef = useRef(null)
  const scrollbarRef  = useRef(null)
  const isSyncing     = useRef(false)
  const [scrollWidth, setScrollWidth] = useState(3000)

  const onCustomScroll = (e) => {
    if (isSyncing.current) return
    const scrollable = gridImportRef.current?.instance.getScrollable()
    if (scrollable) {
      isSyncing.current = true
      const el = e.target
      const customMax = el.scrollWidth - el.clientWidth
      const ratio = customMax > 0 ? el.scrollLeft / customMax : 0
      const content   = scrollable.content()
      const container = scrollable.container()
      if (content && container) {
        const gridMax = content.scrollWidth - container.clientWidth
        scrollable.scrollTo({ left: ratio * gridMax })
      }
      setTimeout(() => { isSyncing.current = false }, 50)
    }
  }

  const onGridContentReady = (e) => {
    const scrollable = e.component.getScrollable()
    if (scrollable) {
      scrollable.off('scroll')
      setScrollWidth(3000)
      scrollable.on('scroll', (args) => {
        if (isSyncing.current || !scrollbarRef.current) return
        const content   = scrollable.content()
        const container = scrollable.container()
        if (content && container) {
          isSyncing.current = true
          const gridMax   = content.scrollWidth - container.clientWidth
          const customMax = scrollbarRef.current.scrollWidth - scrollbarRef.current.clientWidth
          const ratio     = gridMax > 0 ? args.scrollOffset.left / gridMax : 0
          scrollbarRef.current.scrollLeft = ratio * customMax
          setTimeout(() => { isSyncing.current = false }, 50)
        }
      })
    }
  }

  const scrollLeft  = () => { if (scrollbarRef.current) scrollbarRef.current.scrollLeft -= 150 }
  const scrollRight = () => { if (scrollbarRef.current) scrollbarRef.current.scrollLeft += 150 }
  // ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="container mt-4">
        <PortletHeader
          title="Importar productos desde Excel"
          toolbar={
            <PortletHeaderToolbar>
              <ButtonDev
                icon="download"
                type="default"
                hint="Se descarga una plantilla Excel para importar productos"
                onClick={plantillaDownload}
                text="Descargar Plantilla"
              />
              &nbsp;
              <ButtonDev
                icon="upload"
                type="default"
                hint="Seleccionar archivo Excel para importar productos"
                onClick={triggerFileInput}
                text="Importar Excel"
              />
              &nbsp;
              <ButtonDev
                icon="photo"
                type="normal"
                hint="Subir imágenes masivas en .zip (principales/ y secundarias/)"
                onClick={triggerZipInput}
                text="Subir Imágenes (.zip)"
              />
            </PortletHeaderToolbar>
          }
        />

        {/* input oculto para ZIP */}
        <input
          type="file"
          ref={zipInputRef}
          onChange={handleZipSelect}
          accept=".zip"
          style={{ display: "none" }}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
        />

        {/* ── Modal: confirmación de subida ───────────────────────────── */}
        <Confirm
          title="Confirmar subida"
          message={
            pendingFile
              ? `¿Desea subir el archivo "${pendingFile.name}"? Se importarán los productos al sistema.`
              : "¿Desea subir el archivo?"
          }
          isVisible={showConfirmModal}
          setIsVisible={(v) => {
            setShowConfirmModal(v);
            if (!v) handleCancelUpload();
          }}
          onConfirm={handleConfirmUpload}
          confirmText="Sí, subir"
          cancelText="Cancelar"
        />

        {/* ── Modal: confirmación subida ZIP ──────────────────────────── */}
        <Confirm
          title="Confirmar subida de imágenes"
          message={
            pendingZip
              ? `¿Desea subir "${pendingZip.name}"? Se procesarán las imágenes de las carpetas principales/ y secundarias/.`
              : "¿Desea subir el archivo ZIP?"
          }
          isVisible={showZipConfirmModal}
          setIsVisible={(v) => { setShowZipConfirmModal(v); if (!v) handleCancelZip(); }}
          onConfirm={handleConfirmZip}
          confirmText="Sí, procesar"
          cancelText="Cancelar"
        />

        {/* ── Modal: resultado imágenes ZIP ────────────────────────────── */}
        <Dialog
          open={showImageResultModal}
          onClose={() => setShowImageResultModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <ImageIcon color="primary" /> Resultado — Importación de Imágenes
          </DialogTitle>
          <DialogContent dividers>
            {imageImportResult && (
              <>
                {/* Principales */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ fontWeight: 600, mb: 1, fontSize: 13, color: "#444" }}>
                    Imágenes principales
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "#e8f5e9", flex: 1, minWidth: 110 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#2e7d32" }}>
                        {imageImportResult.principales?.importadas ?? 0}
                      </div>
                      <div style={{ fontSize: 11, color: "#388e3c" }}>Importadas</div>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "#fff3e0", flex: 1, minWidth: 110 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#e65100" }}>
                        {(imageImportResult.principales?.no_encontradas?.length ?? 0) +
                         (imageImportResult.principales?.errores?.length ?? 0)}
                      </div>
                      <div style={{ fontSize: 11, color: "#bf360c" }}>Sin coincidencia / Error</div>
                    </Box>
                  </Box>
                  {imageImportResult.principales?.no_encontradas?.length > 0 && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: "#fff8e1", borderRadius: 1, fontSize: 11, color: "#795548" }}>
                      <strong>Códigos sin coincidencia:</strong>{" "}
                      {imageImportResult.principales.no_encontradas.slice(0, 10).join(", ")}
                      {imageImportResult.principales.no_encontradas.length > 10 && ` ... +${imageImportResult.principales.no_encontradas.length - 10} más`}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Secundarias */}
                <Box>
                  <Box sx={{ fontWeight: 600, mb: 1, fontSize: 13, color: "#444" }}>
                    Imágenes secundarias
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "#e8f5e9", flex: 1, minWidth: 110 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#2e7d32" }}>
                        {imageImportResult.secundarias?.importadas ?? 0}
                      </div>
                      <div style={{ fontSize: 11, color: "#388e3c" }}>Actualizadas</div>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "#fff3e0", flex: 1, minWidth: 110 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#e65100" }}>
                        {(imageImportResult.secundarias?.no_encontradas?.length ?? 0) +
                         (imageImportResult.secundarias?.errores?.length ?? 0) +
                         (imageImportResult.secundarias?.sin_registro_bd?.length ?? 0)}
                      </div>
                      <div style={{ fontSize: 11, color: "#bf360c" }}>Sin producto / sin fila BD / error</div>
                    </Box>
                  </Box>
                  {(imageImportResult.secundarias?.sin_registro_bd?.length ?? 0) > 0 && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: "#fce4ec", borderRadius: 1, fontSize: 11, color: "#880e4f" }}>
                      <strong>Sin fila previa en BD (no se crean registros):</strong> el ZIP solo actualiza imágenes ya registradas.
                      {" "}
                      {imageImportResult.secundarias.sin_registro_bd.slice(0, 8).join(", ")}
                      {imageImportResult.secundarias.sin_registro_bd.length > 8 && ` … +${imageImportResult.secundarias.sin_registro_bd.length - 8} más`}
                    </Box>
                  )}
                  {imageImportResult.secundarias?.no_encontradas?.length > 0 && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: "#fff8e1", borderRadius: 1, fontSize: 11, color: "#795548" }}>
                      <strong>Archivos sin coincidencia:</strong>{" "}
                      {imageImportResult.secundarias.no_encontradas.slice(0, 10).join(", ")}
                      {imageImportResult.secundarias.no_encontradas.length > 10 && ` ... +${imageImportResult.secundarias.no_encontradas.length - 10} más`}
                    </Box>
                  )}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button variant="contained" onClick={() => setShowImageResultModal(false)} sx={{ textTransform: "none", px: 3 }}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Modal: resultado de importación ─────────────────────────── */}
        <Dialog
          open={showResultModal}
          onClose={() => setShowResultModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Resultado de la Importación
          </DialogTitle>

          <DialogContent dividers>
            {/* Tarjetas resumen */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              {/* Importados OK */}
              <Box sx={{
                flex: 1, minWidth: 160, p: 2, borderRadius: 2, bgcolor: "#e8f5e9",
                display: "flex", alignItems: "center", gap: 1.5,
              }}>
                <CheckCircleOutlineIcon sx={{ color: "#2e7d32", fontSize: 38 }} />
                <Box>
                  <div style={{ fontSize: 30, fontWeight: 700, color: "#2e7d32", lineHeight: 1 }}>
                    {importResult.totalImportados}
                  </div>
                  <div style={{ fontSize: 12, color: "#388e3c", marginTop: 2 }}>
                    Producto{importResult.totalImportados !== 1 ? "s" : ""} importado{importResult.totalImportados !== 1 ? "s" : ""} correctamente
                  </div>
                </Box>
              </Box>

              {/* No importados */}
              <Box sx={{
                flex: 1, minWidth: 160, p: 2, borderRadius: 2,
                bgcolor: importResult.totalFallidos > 0 ? "#fff3e0" : "#f5f5f5",
                display: "flex", alignItems: "center", gap: 1.5,
              }}>
                <WarningAmberIcon sx={{
                  color: importResult.totalFallidos > 0 ? "#e65100" : "#bdbdbd",
                  fontSize: 38,
                }} />
                <Box>
                  <div style={{
                    fontSize: 30, fontWeight: 700, lineHeight: 1,
                    color: importResult.totalFallidos > 0 ? "#e65100" : "#9e9e9e",
                  }}>
                    {importResult.totalFallidos}
                  </div>
                  <div style={{
                    fontSize: 12, marginTop: 2,
                    color: importResult.totalFallidos > 0 ? "#bf360c" : "#757575",
                  }}>
                    No importado{importResult.totalFallidos !== 1 ? "s" : ""} — código duplicado u error
                  </div>
                </Box>
              </Box>
            </Box>

            {/* Tabla de no importados */}
            {importResult.noImportados.length > 0 && (
              <>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ mb: 1, fontWeight: 600, fontSize: 13, color: "#555" }}>
                  Detalle de productos no importados:
                </Box>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ maxHeight: 320, borderRadius: 1 }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", width: 52 }}>Fila</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Cód. Producto</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Cód. Barra</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Categoría</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Motivo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResult.noImportados.map((item, idx) => (
                        <TableRow
                          key={idx}
                          sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}
                        >
                          <TableCell align="center">{item.fila}</TableCell>
                          <TableCell>{item.codigo_producto || "—"}</TableCell>
                          <TableCell>{item.codigo_barra   || "—"}</TableCell>
                          <TableCell>{item.nombre         || "—"}</TableCell>
                          <TableCell>{item.nombre_categoria || "—"}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.motivo || "Error"}
                              color={chipColor(item.motivo)}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: 11 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => setShowResultModal(false)}
              sx={{ textTransform: "none", px: 3 }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        <SimpleCard>
          <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
            {/* Info Excel */}
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <p className="text-secondary mb-1">
                <CloudUploadIcon sx={{ verticalAlign: "middle", mr: 0.5 }} />
                Importación de productos: <strong>.xlsx</strong>
              </p>
            </Box>

            {/* Info ZIP imágenes */}
            <Box sx={{
              flex: 2, minWidth: 300, p: 2, borderRadius: 2,
              border: "1px dashed #90caf9", bgcolor: "#f0f7ff",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <FolderZipIcon sx={{ color: "#1565c0" }} />
                <span style={{ fontWeight: 600, fontSize: 13, color: "#1565c0" }}>
                  Subida masiva de imágenes (.zip)
                </span>
              </Box>
              <Box sx={{ fontSize: 12, color: "#444", lineHeight: 1.7 }}>
                <InfoOutlinedIcon sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5, color: "#888" }} />
                Cree un ZIP con esta estructura de carpetas:
                <Box
                  component="pre"
                  sx={{
                    mt: 0.5, mb: 0.5, p: 1, bgcolor: "#1a2038", color: "#90caf9",
                    borderRadius: 1, fontSize: 11, fontFamily: "monospace", lineHeight: 1.6,
                  }}
                >
{`imagenes.zip
├── principales/
│   ├── CODIGO1.jpg      ← nombre = codigo_producto
│   └── CODIGO2.png
└── secundarias/
    ├── CODIGO1_1.jpg    ← sufijo _N para ordenar
    └── CODIGO1_2.jpg`}
                </Box>
                El nombre del archivo (sin extensión) debe coincidir con la columna <strong>Cód. Producto</strong> de la tabla. Si en un producto ese dato está vacío, use el código interno (formato <strong>P-XXXXXX</strong>) que verá al editar el producto en el administrador.
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 2 }}>
            <TextField
              type="date"
              label="Fecha de inicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              type="date"
              label="Fecha final"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <ButtonDev
              icon="filter"
              type="default"
              text="Filtrar"
              onClick={handleFiltrar}
            />
            <ButtonDev
              icon="export"
              type="default"
              text="Descargar Productos"
              onClick={handleDescargar}
            />
          </Box>

          <h5 className="mb-2">
            <TableChartIcon sx={{ verticalAlign: "middle", mr: 0.5 }} />
            Productos ({listProductos.length})
          </h5>
          <DataGrid
            ref={gridImportRef}
            onContentReady={onGridContentReady} 
            id="grid-productos"
            dataSource={listProductos}
            keyExpr="id_producto"
            showBorders={true}
            columnAutoWidth={true}
            rowAlternationEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            showColumnLines={true}
            showRowLines={true}
            scrolling={{ mode: 'standard', showScrollbar: 'never', useNative: false }}
          >
            <Paging defaultPageSize={15} enabled={true} />
            <Pager
              visible={true}
              showPageSizeSelector={true}
              allowedPageSizes={[10, 15, 25, 50, 100]}
              showInfo={true}
              infoText="Página {0} de {1} ({2} registros)"
            />
            <FilterRow visible={true} />
            <SearchPanel visible={true} placeholder="Buscar..." />
            <ColumnChooser mode="select" enabled={true}>
              <Position my="right top" at="right top" of="#grid-productos" />
              <ColumnChooserSearch enabled={true} />
              <ColumnChooserSelection allowSelectAll={true} />
            </ColumnChooser>
            <Column dataField="id_producto"                  caption="ID"                         width={70}  alignment="center" />
            <Column dataField="codigo_producto_new"          caption="Cód. Producto"               width={130} />
            <Column dataField="codigo_barra"                 caption="Cód. Barra"                  width={120} />
            <Column dataField="nombre"                       caption="Nombre"                      minWidth={180} />
            <Column dataField="categoria.nombre"             caption="Categoría"                   width={120} />
            <Column dataField="subcategoria.nombre"          caption="Subcategoría"                width={120} />
            <Column dataField="descripcion"                  caption="Descripción"                 minWidth={150} visible={false} />
            <Column dataField="ubicacion"                    caption="Ubicación"                   width={120} />
            <Column dataField="precio"                       caption="Precio Venta"                width={100} dataType="number" format="#,##0.##" />
            <Column dataField="precio_old"                   caption="Precio Anterior"             width={110} dataType="number" format="#,##0.##" />
            <Column dataField="precio_costo"                 caption="Precio Costo"                width={100} dataType="number" format="#,##0.##" />
            <Column dataField="precio_mayorista"             caption="Precio Mayorista"            width={120} dataType="number" format="#,##0.##" />
            <Column dataField="stock"                        caption="Stock"                       width={80} />
            <Column dataField="stock_minimo"                 caption="Stock Mínimo"                width={110} dataType="number" format="#,##0.##" />
            <Column dataField="peso_kilogramo"               caption="Peso (kg)"                   width={90}  dataType="number" format="#,##0.###" />
            <Column dataField="url_imagen"                   caption="Imagen Principal"            width={130} visible={false} />
            <Column dataField="Activo"                       caption="Activo"                      width={70}  alignment="center" />
            <Column dataField="created_at"                   caption="Creado"                      width={130} dataType="datetime" format="dd/MM/yyyy HH:mm" />
          </DataGrid>

        </SimpleCard>
      </div>
      {/* ── Scrollbar flotante estilo Excel ── */}
      <Box sx={{
        position: 'fixed', bottom: 0, right: 20, zIndex: 99999,
        display: 'flex', alignItems: 'center',
        bgcolor: '#f8f9fa', borderRadius: '4px 4px 0 0',
        border: '1px solid #e0e0e0', borderBottom: 'none',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
        height: 32, px: 0.5, gap: 0,
      }}>
        <IconButton size="small" onClick={scrollLeft}
          sx={{ color: '#666', p: 0, width: 32, height: 32, borderRadius: 0, '& svg': { fontSize: 20 } }}>
          <ChevronLeftIcon />
        </IconButton>
        <Box ref={scrollbarRef} onScroll={onCustomScroll} sx={{
          width: 500, overflowX: 'auto', overflowY: 'hidden', height: 14,
          '&::-webkit-scrollbar': { height: '14px !important', display: 'block !important' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent', borderRadius: 10 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#888', borderRadius: 10,
            border: '2px solid transparent', backgroundClip: 'padding-box',
            '&:hover': { bgcolor: '#666' },
          },
        }}>
          <Box sx={{ width: scrollWidth, height: 1, margin: 10 }} />
        </Box>
        <IconButton size="small" onClick={scrollRight}
          sx={{ color: '#666', p: 0, width: 32, height: 32, borderRadius: 0, '& svg': { fontSize: 20 } }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </>
  );
};

export default injectIntl(WithLoandingPanel(ProductoImportPage));
