import React, { useEffect, useState, useCallback } from "react";
import { styled, } from "@mui/material/styles";
import { useIntl, } from "react-intl";
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

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DoneIcon from '@mui/icons-material/Done';
import AddIcon from '@mui/icons-material/Add';
import { analizarImagenProducto, PRODUCTO_IMAGEN_RECOMENDACION } from "../../../utils/productoImagenValidacion";
import { toasts } from "../../../components/notify-messages";
import ProductoImagenRecomendacionModal from "../../../views/producto/ProductoImagenRecomendacionModal";
import { authJWTConfig } from "app/authJWTConfig";
export const domainPage = authJWTConfig.domain + "/";
import { Avatar } from "@files-ui/react";
import Badge from "@mui/material/Badge";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const AddImageListPage = props => {
  const intl = useIntl();

  const [imagenProfile, setImagenProfile] = useState(null);
  const [imgModal, setImgModal] = useState({
    open: false,
    file: null,
    analysis: null,
    previewUrl: null,
  });
  const [showDragIcons, setShowDragIcons] = useState(true);

  function grabar() {
    if (imagenProfile) {
      props.agregarMaterial(imagenProfile);
      setImagenProfile(null)
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
    if (file) setImagenProfile(file);
    setImgModal({ open: false, file: null, analysis: null, previewUrl: null });
  };

  const onReorder = useCallback((e) => {

    const visibleRows = e.component.getVisibleRows();
    // console.log('%c [test]-70', 'font-size:13px; background:pink; color:#bf2c9f;', visibleRows[e.toIndex].data)
    // console.log('%c [test]-70', 'font-size:13px; background:pink; color:#bf2c9f;', e.itemData)

    const { id_producto_imagen: id_producto_imagen_old, orden: orden_old } = visibleRows[e.toIndex].data; //row OLD
    const { id_producto_imagen: id_producto_imagen_new, orden: orden_new } = e.itemData; //row NEW
    const params = {
      id_producto_imagen_old: id_producto_imagen_old, orden_old: orden_old,
      id_producto_imagen_new: id_producto_imagen_new, orden_new: orden_new
    }
      props.actualizarImagenOrden(params)
    // const newTasks = [...tasks];
    // const toIndex = newTasks.findIndex((item) => item.ID === visibleRows[e.toIndex].data.ID);
    // const fromIndex = newTasks.findIndex((item) => item.ID === e.itemData.ID);
    // newTasks.splice(fromIndex, 1);
    // newTasks.splice(toIndex, 0, e.itemData);
    // console.log('%c [test]-75', 'font-size:13px; background:pink; color:#bf2c9f;', newTasks)
    // setTasks(newTasks);
  }, [],);

  const cellEstadoRender = e => {
    let url_imagen = e.data.url_imagen;
    return <img alt={''} height={'40rem'} src={url_imagen != null ? domainPage + url_imagen : `${import.meta.env.BASE_URL}assets/logos/subir_imagen.svg`} />;
  };

  const eliminarRegistro = evt => {
    props.eliminarRegistro(evt.row.data);
  };

  return (
    <>
      <ProductoImagenRecomendacionModal
        open={imgModal.open}
        file={imgModal.file}
        analysis={imgModal.analysis}
        previewUrl={imgModal.previewUrl}
        onCancel={closeImgModal}
        onConfirm={confirmImgModal}
        titulo="Recomendación al agregar imagen"
      />

      <ContentBox className="mt-1">
        <div className="clsAlignUploadImagen text-center" >
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
              ></PhotoCameraIcon>
            }
          >
            <Avatar
              accept="image/*"
              src={imagenProfile ? imagenProfile : `${import.meta.env.BASE_URL}assets/logos/subir_imagen.svg`}
              alt="Avatar"
              onChange={handleChangeSource}
            />
          </Badge>

          <Typography variant="caption" component="div" sx={{ display: "block", mt: 1, maxWidth: 300, mx: "auto", lineHeight: 1.35, color: "text.secondary", fontSize: "0.65rem" }}>
            Ideal {PRODUCTO_IMAGEN_RECOMENDACION.recomendadoPx}×{PRODUCTO_IMAGEN_RECOMENDACION.recomendadoPx} px, 1:1 (desde {PRODUCTO_IMAGEN_RECOMENDACION.minEjemploPx}×{PRODUCTO_IMAGEN_RECOMENDACION.minEjemploPx} px). Verás la guía al elegir archivo.
          </Typography>

          <Button
            className="clsBotonAceptar"
            variant="outlined"
            color="success"
            startIcon={<AddIcon />}
            onClick={grabar}
          />
        </div>

        <DataGrid
          keyExpr="RowIndex"
          className={'dx-card wide-card'}
          dataSource={props.listarDatos}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          // columnAutoWidth={true}
          rowAlternationEnabled={true}
        >
          <RowDragging
            // width={"20%"}
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
            cellRender={cellEstadoRender}
          />

          <Column
            type="buttons"
            visible={true}
          >
            <ColumnButton
              icon="trash"
              hint={"Eliminar"}
              onClick={eliminarRegistro}
            />

          </Column>

        </DataGrid>
      </ContentBox>
    </>
  );
}
export default AddImageListPage;