import React, { useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { Rating } from '@mui/material';
import { Box, Typography, TextField } from '@mui/material';

import Form, {
  Item,
  GroupItem,
} from "devextreme-react/form";
import { PortletHeader, PortletHeaderToolbar, } from "../../partials/content/Portlet";
import { Button as ButtonDev } from "devextreme-react";
import { SimpleCard, } from "app/components";
import DataGrid, {
  Column,
  Pager,
  Paging,
  RowDragging,
  FilterRow,
  SearchPanel,
  Button as ColumnButton,
  // Editing, Summary, TotalItem
} from 'devextreme-react/data-grid';

import { authJWTConfig } from "app/authJWTConfig";
export const DomainBackend = authJWTConfig.domain + "/";

import { analizarImagenProducto, PRODUCTO_IMAGEN_RECOMENDACION } from "../../utils/productoImagenValidacion";
import { toasts } from "../../components/notify-messages";
import ProductoImagenRecomendacionModal from "./ProductoImagenRecomendacionModal";

import { Avatar } from "@files-ui/react";
import Badge from "@mui/material/Badge";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const OldPriceTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    textDecoration: 'line-through',
    color: 'text.secondary',
  },
});

const ProductoImgEditPage = props => {
  const { accessButton } = props;

  const intl = useIntl();
  const [estadosDelProducto, setEstadosDelProducto] = useState([]);
  const [dataOrdenImages, setDataOrdenImages] = useState(props.listarDatos);
  const [showDragIcons, setShowDragIcons] = useState(true);

  const [imgModal, setImgModal] = useState({
    open: false,
    file: null,
    analysis: null,
    previewUrl: null,
  });
  // Cambia aquí: ratingValue inicializa con el valor que viene en props.dataRowEditNew.numero_estrellas, si existe
  const [ratingValue, setRatingValue] = useState(
    props.dataRowEditNew?.numero_estrellas
      ? Number(props.dataRowEditNew.numero_estrellas)
      : 3.5
  );
  const oldPriceRef = useRef(null);
  const precioYapeRef = useRef(null);

  // Sincroniza ratingValue cada vez que cambie el dato de edición
  useEffect(() => {
    setRatingValue(
      props.dataRowEditNew?.numero_estrellas
        ? Number(props.dataRowEditNew.numero_estrellas)
        : 3.5
    );
  }, [props.dataRowEditNew?.numero_estrellas]);

  const handleRatingChange = (event, newValue) => {
    setRatingValue(newValue);
    // Si quieres que el padre también tenga el dato actualizado en tiempo real:
    // props.dataRowEditNew.numero_estrellas = newValue;
  };

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      props.dataRowEditNew.precio_old = oldPriceRef.current?.value;
      props.dataRowEditNew.precio_yape = precioYapeRef.current?.value;
      props.dataRowEditNew.numero_estrellas = ratingValue;
      props.dataRowEditNew.url_imagen = props.imagenProfile;

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarImagen(props.dataRowEditNew);
      } else {
        props.actualizarImagen(props.dataRowEditNew);
      }
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
    if (file) props.setImagenProfile(file);
    setImgModal({ open: false, file: null, analysis: null, previewUrl: null });
  };

  const editarRegistroImgEdit = evt => {
    props.editarRegistroImgEdit(evt.row.data);
  };

  const cellEstadoRenderImg = e => {
    let url_imagen = e.data.url_imagen;
    return <img alt={''} height={'40rem'} src={url_imagen != null ? DomainBackend + url_imagen : `${import.meta.env.BASE_URL}assets/logos/subir_imagen.svg`} />;
  };

  const cellEstadoRender = e => {
    let estado = e.data.Activo;
    let css = "";
    switch (estado) {
      case "S":
        css = <i className={`mdi mdi-check-circle-outline clsFontSizeCheck`} ></i>;
        break;
      case "N":
        css = <i className={`mdi mdi-close-circle-outline clsFontSizeCheckRed`} ></i>;
        break;
      default: break;
    }
    return css;
  };

  const imageClick = () => {
    props.limpiarImagen();
    props.setImagenProfile(null)
  }

  const onReorder = (e) => {
    const visibleRows = e.component.getVisibleRows();
    const fromIndex = dataOrdenImages.findIndex(item => item === visibleRows[e.fromIndex].data);
    const toIndex = dataOrdenImages.findIndex(item => item === visibleRows[e.toIndex].data);

    const updated = [...dataOrdenImages];
    const movedItem = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, movedItem);

    // 🔁 Asignar nuevo orden antes de guardar
    const dataConOrden = updated.map((item, index) => ({
      ...item,
      orden: index + 1
    }));

    setDataOrdenImages(dataConOrden);
    props.actualizarImagenOrden(dataConOrden)
  };

  useEffect(() => {
    if (props.listarDatos) {
      setDataOrdenImages(props.listarDatos);
    }
  }, [props.listarDatos]);

  return (
    <div className="container mt-4">

      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <ButtonDev
              icon="save"
              type="default"
              hint={"Grabar"}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            // visible={accessButton.crear ? true : false}
            />
            &nbsp;
            <ButtonDev
              icon="clearformat"
              type="default"
              hint={"Grabar"}
              onClick={() => imageClick()}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            // visible={accessButton.crear ? true : false}
            />
            &nbsp;
            <ButtonDev
              icon="remove"
              type="normal"
              stylingMode="outlined"
              onClick={props.cancelarEdicion}
            />
          </PortletHeaderToolbar>
        }
      />

      <ProductoImagenRecomendacionModal
        open={imgModal.open}
        file={imgModal.file}
        analysis={imgModal.analysis}
        previewUrl={imgModal.previewUrl}
        onCancel={closeImgModal}
        onConfirm={confirmImgModal}
        titulo="Recomendación de imagen (galería)"
      />

      <SimpleCard>
        <Form
          formData={props.dataRowEditNew}
          id={'editForm'}
          validationGroup="FormEdicion"
          colCount={6}
        >
          <GroupItem itemType="group">
            <Item>
              {/* PROFILE PHOTO */}
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <PhotoCameraIcon
                    sx={{
                      border: "5px solid white",
                      backgroundColor: "#ff558f",
                      borderRadius: "50%",
                      padding: ".2rem",
                      width: 35,
                      height: 35
                    }}
                  />
                }
              >
                <Avatar
                  accept="image/*"
                  style={{
                    width: '160px',
                    height: '160px',
                    minWidth: '160px',
                    minHeight: '160px'
                  }}
                  src={props.imagenProfile ? props.imagenProfile : props.dataRowEditNew.url_imagen ? DomainBackend + props.dataRowEditNew.url_imagen : `${import.meta.env.BASE_URL}assets/logos/subir_imagen.svg`} alt="Avatar" onChange={(e) => { handleChangeSource(e) }} />
              </Badge>
              <Typography variant="caption" component="div" sx={{ display: 'block', mt: 1, maxWidth: 300, lineHeight: 1.35, color: "text.secondary", fontSize: "0.65rem" }}>
                Ideal {PRODUCTO_IMAGEN_RECOMENDACION.recomendadoPx}×{PRODUCTO_IMAGEN_RECOMENDACION.recomendadoPx} px, 1:1 (desde {PRODUCTO_IMAGEN_RECOMENDACION.minEjemploPx}×{PRODUCTO_IMAGEN_RECOMENDACION.minEjemploPx} px). Guía al elegir archivo.
              </Typography>
            </Item>
          </GroupItem>

          <GroupItem itemType="group" colCount={4} colSpan={3}>
            <Item
              dataField="titulo"
              label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.TITULO" }), }}
              isRequired={true}
              colSpan={2}
            />

            <Item
              dataField="precio"
              label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.PRECIO" }) }}
              isRequired={true}
              colSpan={2}
            />

            <Item
              dataField="stock"
              isRequired={true}
              label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.STOCK" }) }}
              editorOptions={{
                // inputAttr: { style: "text-transform: uppercase" },
              }}
              colSpan={2}
            />

            <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.ACTIVO" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: props.estadoSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
              }}
              colSpan={2}
            />
          </GroupItem>

          {/* Sección Rating y Precio Antiguo - Diseño Mejorado */}
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item colSpan={1}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Valoración del Producto
                  </Typography>
                  <Rating
                    name="product-rating"
                    value={Number.isFinite(ratingValue) ? ratingValue : 0}
                    onChange={handleRatingChange}
                    precision={0.5}
                    size="medium"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#ffb400',
                      },
                      '& .MuiRating-iconHover': {
                        color: '#ffb400',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {ratingValue} estrellas
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Precio Yape <img src={`${import.meta.env.BASE_URL}assets/images/logo-yape.jpg`} alt="Yape" style={{ width: 'auto', height: '28px', verticalAlign: 'middle' }} />
                  </Typography>
                  <PrecioYapeTextField
                    variant="outlined"
                    defaultValue={props.dataRowEditNew.precio_yape ?? ""}
                    inputRef={precioYapeRef} // Asignamos la referencia
                    InputProps={{
                      startAdornment: (
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          S/
                        </Typography>
                      ),
                    }}
                  />
                </Box>
              </div>
            </Item>

            <Item colSpan={1}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Precio Anterior
                </Typography>
                <OldPriceTextField
                  variant="outlined"
                  defaultValue={props.dataRowEditNew?.precio_old || ""}
                  inputRef={oldPriceRef}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                        $
                      </Typography>
                    ),
                  }}
                />
              </Box>
            </Item>
            <Item
              dataField="descripcion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.DESCRIPCION" }), }}
              isRequired={true}
              colSpan={2}
              editorType="dxTextArea"
              editorOptions={{
                maxLength: 500,
                width: "100%",
                height: 145,
              }}
            />
          </GroupItem>
        </Form>
      </SimpleCard>

      <DataGrid
        keyExpr="id_producto_imagen"
        className={'dx-card wide-card'}
        dataSource={dataOrdenImages}
        showBorders={false}
        focusedRowEnabled={true}
        defaultFocusedRowIndex={0}
        rowAlternationEnabled={true}
      >
        <RowDragging
          allowReordering={true}
          onReorder={onReorder}
          showDragIcons={showDragIcons}
        />

        <Column
          dataField={'orden'}
          caption={'Orden'}
          alignment={"center"}
        />
        <Column
          dataField={'nombre'}
          caption={'Imagen'}
          cellRender={cellEstadoRenderImg}
        />
        <Column
          dataField={'titulo'}
          caption={'Titulo'}
          alignment={"center"}
        />

        <Column
          dataField={'precio'}
          caption={'Precio'}
          alignment={"center"}
        />
        <Column
          dataField={'stock'}
          caption={'Stock'}
          alignment={"center"}
        />
        <Column
          dataField={'Activo'}
          caption={'Activo'}
          width={"10%"}
          cellRender={cellEstadoRender}
        />

        <Column
          type="buttons"
          visible={true}
        >
          <ColumnButton
            icon="edit"
            hint={"Editar"}
            onClick={(evt) => props.editarRegistroImagen(evt.row.data)}
          />
          <ColumnButton
            icon="trash"
            hint={"Eliminar"}
            onClick={(evt) => props.eliminarRegistroImagen(evt.row.data)}
          />
        </Column>
      </DataGrid>
    </div>
  );
}

export default ProductoImgEditPage;