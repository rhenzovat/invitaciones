import React, { useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Box, Typography, TextField, Rating, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PortletHeader, PortletHeaderToolbar } from "../../partials/content/Portlet";
import { Button as ButtonDev } from "devextreme-react";
import { Avatar } from "@files-ui/react";
import Badge from "@mui/material/Badge";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { toasts } from "../../components/notify-messages";
import { authJWTConfig } from "app/authJWTConfig";
export const DomainBackend = authJWTConfig.domain + "/";
import ProductoFotoEditPage from "./ProductoFotoEditPage";
import { createNumericInputHandlers } from "../../utils/utils";
import { analizarImagenProducto, PRODUCTO_IMAGEN_RECOMENDACION } from "../../utils/productoImagenValidacion";
import ProductoImagenRecomendacionModal from "./ProductoImagenRecomendacionModal";

const numericPriceHandlers = createNumericInputHandlers({ decimals: true });

const BRAND = '#2c7d3f';

const OldPriceTextField = styled(TextField)({
  '& .MuiInputBase-input': { textDecoration: 'line-through', color: 'text.secondary' },
});
const PrecioYapeTextField = styled(TextField)({
  '& .MuiInputBase-input': { color: '#6d28d9' },
});

/** Divisor visual de sección con icono y línea */
const SectionHeader = ({ icon, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1, mb: 0.5 }}>
    <Box sx={{ color: BRAND, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography sx={{
      color: BRAND,
      fontWeight: 700,
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: '0.09em',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </Typography>
    <Box sx={{ flex: 1, height: '1px', bgcolor: `${BRAND}30` }} />
  </Box>
);

/** Campo monetario compacto */
const MoneyField = ({ label, logo, inputRef, defaultValue, StyledInput }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
      {label}
      {logo}
    </Typography>
    <StyledInput
      variant="outlined"
      size="small"
      fullWidth
      defaultValue={defaultValue ?? ""}
      inputRef={inputRef}
      inputProps={{
        onKeyDown: numericPriceHandlers.onKeyDown,
        onPaste: numericPriceHandlers.onPaste,
        inputMode: "decimal",
      }}
      InputProps={{
        startAdornment: <Typography variant="body2" sx={{ mr: 0.5, color: 'text.secondary', lineHeight: 1 }}>S/</Typography>,
      }}
    />
  </Box>
);

const ProductoEditPage = props => {
  const { accessButton, codigosError = {}, onVerificarCodigo } = props;
  const intl = useIntl();
  const debounceRef = useRef({});

  const [imagenProfile, setImagenProfile] = useState(null);
  const [imagenError, setImagenError] = useState(false);
  const [ratingValueValid, setRatingValueValid] = useState(false);
  const [ratingValue, setRatingValue] = useState(
    props.dataRowEditNew?.admin_rating
      ? Number(props.dataRowEditNew.admin_rating)
      : (props.dataRowEditNew?.numero_estrellas ? Number(props.dataRowEditNew.numero_estrellas) : 0)
  );
  const [imgModal, setImgModal] = useState({
    open: false,
    file: null,
    analysis: null,
    previewUrl: null,
  });

  const oldPriceRef = useRef(null);
  const precioMayoristaOldRef = useRef(null);
  const precioYapeRef = useRef(null);

  const [ratingsEnabled, setRatingsEnabled] = useState(() => {

    const value = props.dataRowEditNew?.ratings_enabled;
    const isEnabled = value === true || value === 1 || value === '1' || value === 'true';

    if (props.dataRowEditNew && props.dataRowEditNew.ratings_enabled !== isEnabled) {
      props.dataRowEditNew.ratings_enabled = isEnabled;
    }
    return isEnabled;
  });

  const handleRatingChange = (event, newValue) => {
    setRatingValue(newValue);
    setRatingValueValid(true);
  };

  function grabar(e) {
    const result = e.validationGroup.validate();
    const esNuevo = props.dataRowEditNew.esNuevoRegistro;
    const sinImagen = esNuevo && imagenProfile === null;

    if (sinImagen) {
      setImagenError(true);
      toasts('error', 'Debe subir una imagen para el producto');
    }
    if (!result.isValid) {
      toasts('info', intl.formatMessage({ id: "COMMON.MESSAGES.VALIDACION.CAMPOS.IMGEN" }));
    }
    if (!result.isValid || sinImagen) return;

    props.dataRowEditNew.precio_old = oldPriceRef.current.value;
    props.dataRowEditNew.precio_mayorista_old = precioMayoristaOldRef.current.value;
    if (!ratingsEnabled) {
      props.dataRowEditNew.numero_estrellas = ratingValue;
      props.dataRowEditNew.admin_rating = ratingValue;
    }
    props.dataRowEditNew.precio_yape = precioYapeRef.current.value;
    props.dataRowEditNew.ratings_enabled = ratingsEnabled;

    if (esNuevo) {
      props.agregarProducto(props.dataRowEditNew);
    } else {
      props.actualizarProducto(props.dataRowEditNew);
    }
  }

  const handleChangeSource = async (selectedFile) => {
    const raw = selectedFile?.target?.files?.[0] ?? selectedFile;
    if (!raw || !(raw instanceof File)) return;
    const res = await analizarImagenProducto(raw);
    if (!res.ok) {
      toasts("error", res.error);
      return;
    }
    const previewUrl = URL.createObjectURL(raw);
    setImgModal({ open: true, file: raw, analysis: res, previewUrl });
  };

  const closeImgModal = () => {
    if (imgModal.previewUrl) URL.revokeObjectURL(imgModal.previewUrl);
    setImgModal({ open: false, file: null, analysis: null, previewUrl: null });
  };

  const confirmImgModal = () => {
    const { file, previewUrl } = imgModal;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      props.dataRowEditNew.pro_imagen = file;
      setImagenProfile(file);
      setImagenError(false);
    }
    setImgModal({ open: false, file: null, analysis: null, previewUrl: null });
  };

  useEffect(() => {
    setRatingValue(
      props.dataRowEditNew?.admin_rating
        ? Number(props.dataRowEditNew.admin_rating)
        : (props.dataRowEditNew?.numero_estrellas ? Number(props.dataRowEditNew.numero_estrellas) : 0)
    );


    const ratingsValue = props.dataRowEditNew?.ratings_enabled;
    const isEnabled = ratingsValue === true || ratingsValue === 1 || ratingsValue === '1' || ratingsValue === 'true';


    if (props.dataRowEditNew && typeof props.dataRowEditNew.ratings_enabled !== 'boolean') {
      props.dataRowEditNew.ratings_enabled = isEnabled;
    }


    if (ratingsEnabled !== isEnabled) {
      setRatingsEnabled(isEnabled);
    }
  }, [props.dataRowEditNew?.admin_rating, props.dataRowEditNew?.numero_estrellas, props.dataRowEditNew?.ratings_enabled]);


  return (
    <div className="container mt-3">
      <ProductoImagenRecomendacionModal
        open={imgModal.open}
        file={imgModal.file}
        analysis={imgModal.analysis}
        previewUrl={imgModal.previewUrl}
        onCancel={closeImgModal}
        onConfirm={confirmImgModal}
        titulo="Recomendación de imagen del producto"
      />
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <ButtonDev
              icon="save" type="default" hint="Guardar"
              onClick={grabar} useSubmitBehavior={true}
              validationGroup="FormEdicion" visible={accessButton.crear}
            />
            &nbsp;
            <ButtonDev icon="remove" type="normal" stylingMode="outlined" onClick={props.cancelarEdicion} />
          </PortletHeaderToolbar>
        }
      />

      {/* ═══════════════════════════════════════════════════
          PANEL PRINCIPAL: Sidebar + Formulario
      ═══════════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ border: '1px solid #e0e6ed', borderRadius: 2, mt: 1, overflow: 'hidden' }}>
        <Grid container>

          {/* ── SIDEBAR: Imagen + Valoración ── */}
          <Grid item xs={12} md={3}
            sx={{
              bgcolor: '#f6f8fa',
              borderRight: { md: '1px solid #e0e6ed' },
              borderBottom: { xs: '1px solid #e0e6ed', md: 'none' },
            }}
          >
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, height: '100%' }}>

              {/* Imagen principal */}
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  display: 'inline-block',
                  borderRadius: '50%',
                  border: imagenError ? '3px solid #d32f2f' : '3px solid transparent',
                  padding: '3px',
                  transition: 'border-color 0.25s ease',
                }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <PhotoCameraIcon sx={{
                        border: "4px solid #f6f8fa",
                        backgroundColor: "#ff558f",
                        borderRadius: "50%",
                        padding: ".15rem",
                        width: 30, height: 30,
                      }} />
                    }
                  >
                    <Avatar
                      accept="image/*"
                      src={
                        imagenProfile
                          ? imagenProfile
                          : props.dataRowEditNew?.url_imagen
                            ? DomainBackend + props.dataRowEditNew.url_imagen
                            : `${import.meta.env.BASE_URL}assets/logos/subir_imagen.svg`
                      }
                      alt="Imagen del producto"
                      onChange={handleChangeSource}
                    />
                  </Badge>
                </Box>
                {imagenError && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#d32f2f', fontWeight: 600 }}>
                    La imagen es obligatoria
                  </Typography>
                )}
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: imagenError ? 0.25 : 1, maxWidth: 220 }}>
                  Clic para cambiar imagen
                </Typography>
                <Typography variant="caption" component="div" sx={{ display: 'block', mt: 0.75, maxWidth: 260, lineHeight: 1.35, color: "text.secondary", fontSize: "0.65rem" }}>
                  Ideal {PRODUCTO_IMAGEN_RECOMENDACION.recomendadoPx}×{PRODUCTO_IMAGEN_RECOMENDACION.recomendadoPx} px, 1:1 (también desde {PRODUCTO_IMAGEN_RECOMENDACION.minEjemploPx}×{PRODUCTO_IMAGEN_RECOMENDACION.minEjemploPx} px). Verás la guía al elegir archivo.
                </Typography>
              </Box>

              {/* Valoración manual */}
              {!ratingsEnabled && (
                <Box sx={{ textAlign: 'center', width: '100%', bgcolor: 'white', borderRadius: 1.5, p: 1.5, border: '1px solid #e8ecf0' }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: BRAND, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                    Valoración manual
                  </Typography>
                  <Rating
                    name="product-rating"
                    value={ratingValueValid ? Number(ratingValue) : Number(props.dataRowEditNew?.numero_estrellas ?? ratingValue ?? 0)}
                    onChange={handleRatingChange}
                    precision={0.5}
                    size="medium"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                    {ratingValue} / 5 estrellas
                  </Typography>
                </Box>
              )}

            </Box>
          </Grid>

          {/* ── FORMULARIO PRINCIPAL ── */}
          <Grid item xs={12} md={9}>
            <Box sx={{ p: 2.5 }}>
              <Form formData={props.dataRowEditNew} id="editForm" validationGroup="FormEdicion">

                {/* ─ Información del producto ─ */}
                <GroupItem colCount={2}>
                  <Item colSpan={2}><SectionHeader icon={<InfoOutlinedIcon fontSize="small" />} label="Información del producto" /></Item>
                 
                 
                  <Item
                    dataField="codigo_producto_new"
                    label={{ text: "Código Producto" }}
                    editorOptions={{
                      showClearButton: true,
                      placeholder: "Ingrese código de producto",
                      onValueChanged: (e) => {
                        const valor = e.value;
                        const idProducto = props.dataRowEditNew?.id_producto;
                        clearTimeout(debounceRef.current.codigo_producto_new);
                        debounceRef.current.codigo_producto_new = setTimeout(() => {
                          if (onVerificarCodigo) onVerificarCodigo('codigo_producto_new', valor, idProducto);
                        }, 600);
                      },
                    }}
                  />
                  {codigosError.codigo_producto_new && (
                    <Item>
                      <Box sx={{ mt: -1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          ⚠ {codigosError.codigo_producto_new}
                        </Typography>
                      </Box>
                    </Item>
                  )}
                  <Item
                    dataField="codigo_barra"
                    label={{ text: "Código Barra" }}
                    editorOptions={{
                      showClearButton: true,
                      placeholder: "Ingrese código de barra",
                      onValueChanged: (e) => {
                        const valor = e.value;
                        const idProducto = props.dataRowEditNew?.id_producto;
                        clearTimeout(debounceRef.current.codigo_barra);
                        debounceRef.current.codigo_barra = setTimeout(() => {
                          if (onVerificarCodigo) onVerificarCodigo('codigo_barra', valor, idProducto);
                        }, 600);
                      },
                    }}
                  />
                  {codigosError.codigo_barra && (
                    <Item>
                      <Box sx={{ mt: -1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          ⚠ {codigosError.codigo_barra}
                        </Typography>
                      </Box>
                    </Item>
                  )}
                  <Item
                    itemType="group"
                    colCount={2}
                    colSpan={2}
                  >
                    <Item
                      dataField="nombre"
                      isRequired={true}
                      label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.NOMBRE" }) }}
                    />
                    <Item
                      dataField="ratings_enabled"
                      editorType="dxCheckBox"
                      label={{ text: "Permitir calificación por usuarios" }}
                      editorOptions={{
                        value: ratingsEnabled, // Bind to state
                        onValueChanged: (e) => {

                          const newValue = e.value === true || e.value === 1 || e.value === '1' || e.value === 'true';

                          if (ratingsEnabled !== newValue) {
                            setRatingsEnabled(newValue);

                            if (props.dataRowEditNew) {
                              props.dataRowEditNew.ratings_enabled = newValue;
                            }
                          } else {

                            if (props.dataRowEditNew && typeof props.dataRowEditNew.ratings_enabled !== 'boolean') {
                              props.dataRowEditNew.ratings_enabled = newValue;
                            }
                          }
                        }
                      }}
                    />
                  </Item>
                  <Item
                    dataField="descripcion"
                    colSpan={2}
                    label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.DESCRIPCION" }) }}
                    editorType="dxTextArea"
                    editorOptions={{ maxLength: 500, showClearButton: true, width: "100%", height: 90 }}
                  />
                </GroupItem>

                {/* ─ Precios ─ */}
                <GroupItem colCount={4}>
                  <Item colSpan={4}><SectionHeader icon={<LocalOfferOutlinedIcon fontSize="small" />} label="Precios" /></Item>

                  <Item>
                    <MoneyField
                      label="Precio publico anterior"
                      inputRef={oldPriceRef}
                      defaultValue={props.dataRowEditNew.precio_old}
                      StyledInput={OldPriceTextField}
                    />
                  </Item>
                  <Item
                    dataField="precio"
                    isRequired={true}
                    label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.PRECIO_PUBLICO" }) }}
                    editorType="dxNumberBox"
                    editorOptions={{ format: "#0.##", min: 0, showSpinButtons: false }}
                  />

                  <Item>
                    <MoneyField
                      label="Precio mayorista anterior"
                      inputRef={precioMayoristaOldRef}
                      defaultValue={props.dataRowEditNew.precio_mayorista_old}
                      StyledInput={OldPriceTextField}
                    />
                  </Item>


                  <Item
                    dataField="precio_mayorista"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.PRECIO_MAYORISTA" }) }}
                    editorType="dxNumberBox"
                    editorOptions={{ format: "#0.##", min: 0, showSpinButtons: false }}
                  />

                  <Item>
                    <MoneyField
                      label="Precio Yape"
                      logo={<img src={`${import.meta.env.BASE_URL}assets/images/logo-yape.jpg`} alt="Yape" style={{ height: '15px' }} />}
                      inputRef={precioYapeRef}
                      defaultValue={props.dataRowEditNew.precio_yape}
                      StyledInput={PrecioYapeTextField}
                    />
                  </Item>
                  <Item
                    dataField="oferta_maxima_cantidad"
                    label={{ text: "Cantidad mínima (oferta por volumen)" }}
                    editorType="dxNumberBox"
                    editorOptions={{ format: "#0", min: 1, showSpinButtons: false }}
                  />
                  <Item
                    dataField="oferta_maxima_cantidad_por_precio"
                    label={{ text: "Precio unitario desde esa cantidad" }}
                    editorType="dxNumberBox"
                    editorOptions={{ format: "#0.##", min: 0, showSpinButtons: false }}
                  />
                </GroupItem>

                {/* ─ Inventario y Categorías ─ */}
                <GroupItem colCount={3}>
                  <Item colSpan={3}><SectionHeader icon={<Inventory2OutlinedIcon fontSize="small" />} label="Inventario y Categorías" /></Item>
                  <Item
                    dataField="stock"
                    isRequired={true}
                    label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.STOCK" }) }}
                    editorType="dxNumberBox"
                    editorOptions={{ format: "#0", min: 0, showSpinButtons: false }}
                  />
                  <Item
                    dataField="id_producto_categoria"
                    isRequired={true}
                    editorType="dxSelectBox"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.CATEGORIA" }) }}
                    editorOptions={{
                      items: props.listaCategoria,
                      valueExpr: "id_producto_categoria",
                      displayExpr: "nombre",
                      showClearButton: true,
                      onValueChanged: e => props.obtenerListaSubCategoria({ id_producto_categoria: e.value }),
                    }}
                  />
                  <Item
                    dataField="id_producto_categoria_sub"
                    editorType="dxSelectBox"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.CATEGORIA.SUB" }) }}
                    editorOptions={{ items: props.listaCategoriaSub, valueExpr: "id_producto_categoria_sub", displayExpr: "nombre", showClearButton: true }}
                  />
                  <Item
                    dataField="id_producto_tipo"
                    editorType="dxSelectBox"
                    label={{ text: intl.formatMessage({ id: "COMMON.ACTION.ESTIQUETA" }) }}
                    editorOptions={{ items: props.listaTipo, valueExpr: "id_producto_tipo", displayExpr: "nombre", showClearButton: true }}
                  />
                  <Item
                    dataField="Activo"
                    label={{ text: intl.formatMessage({ id: "COMMON.ACTION.ESTADO" }) }}
                    editorType="dxSelectBox"
                    editorOptions={{ items: props.estadoSimple, valueExpr: "Valor", displayExpr: "Descripcion" }}
                  />
                </GroupItem>

                {/* ─ SEO y Código ─ */}
                <GroupItem colCount={2}>
                  <Item colSpan={2}><SectionHeader icon={<ManageSearchIcon fontSize="small" />} label="SEO descripción" /></Item>
                  <Item
                    dataField="meta_titulo_producto"
                    isRequired={true}
                    label={{ text: intl.formatMessage({ id: "COMMON.ACTION.META_TITULO_PRODUCTO" }) }}
                  />
                  <Item
                    dataField="meta_descripcion_producto"
                    isRequired={true}
                    label={{ text: intl.formatMessage({ id: "COMMON.ACTION.META_DESCRIPCION_PRODUCTO" }) }}
                  />
                 
                </GroupItem>

              </Form>
            </Box>
          </Grid>

        </Grid>
      </Paper>

      {/* ═══════════════════════════════════════════════════
          GALERÍA DE FOTOS (solo en edición)
      ═══════════════════════════════════════════════════ */}
      {!props.dataRowEditNew.esNuevoRegistro && (
        <Paper elevation={0} sx={{ border: '1px solid #e0e6ed', borderRadius: 2, mt: 2, p: 2.5 }}>
          <SectionHeader icon={<PhotoCameraIcon sx={{ fontSize: 18 }} />} label="Galería de Fotos" />
          <Box sx={{ mt: 1.5 }}>
            <ProductoFotoEditPage
              listarFotos={props.listarFotos}
              agregarFotoProducto={(event) => props.agregarFotoProducto(event)}
              eliminarRegistroFotos={(event) => props.eliminarRegistroFotos(event)}
              actualizarOrdenFoto={(event) => props.actualizarOrdenFoto(event)}
            />
          </Box>
        </Paper>
      )}

    </div>
  );
};

export default ProductoEditPage;
