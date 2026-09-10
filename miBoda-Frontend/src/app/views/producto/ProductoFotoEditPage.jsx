import React, { useEffect, useState, useRef } from "react";
import { styled, } from "@mui/material/styles";
import DataGrid, {
  Column,
  RowDragging,
  Button as ColumnButton,
} from 'devextreme-react/data-grid';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { authJWTConfig } from "app/authJWTConfig";
import { analizarImagenProducto, PRODUCTO_IMAGEN_RECOMENDACION } from "../../utils/productoImagenValidacion";
import { toasts } from "../../components/notify-messages";
import ProductoImagenRecomendacionModal from "./ProductoImagenRecomendacionModal";
export const DomainBackend = authJWTConfig.domain + "/";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ProductoFotoEditPage = props => {
  const { accessButton } = props;

  const fileInputRef = useRef(null);
  const [dataOrdenImages, setDataOrdenImages] = useState(props.listarFotos);
  const [showDragIcons, setShowDragIcons] = useState(true);
  const [imgModal, setImgModal] = useState({
    open: false,
    file: null,
    analysis: null,
    previewUrl: null,
  });

  const handleChangeFoto = async (e) => {
    const raw = e.target.files?.[0];
    if (e.target) e.target.value = "";
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmImgModal = () => {
    const { file, previewUrl } = imgModal;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) props.agregarFotoProducto(file);
    setImgModal({ open: false, file: null, analysis: null, previewUrl: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cellEstadoRenderImg = e => {
    let url_imagen = e.data.url_imagen;
    return <img alt={''} height={'40rem'} src={url_imagen != null ? DomainBackend + url_imagen : `${import.meta.env.BASE_URL}assets/logos/subir_imagen.svg`} />;
  };

  const onReorder = (e) => {

    const visibleRows = e.component.getVisibleRows();
    const fromIndex = dataOrdenImages.findIndex(item => item === visibleRows[e.fromIndex].data);
    const toIndex = dataOrdenImages.findIndex(item => item === visibleRows[e.toIndex].data);

    const updated = [...dataOrdenImages];
    const movedItem = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, movedItem);

    //  Asignar nuevo orden antes de guardar
    const dataConOrden = updated.map((item, index) => ({
      ...item,
      orden: index + 1
    }));

    setDataOrdenImages(dataConOrden);
    props.actualizarOrdenFoto(dataConOrden)

  };

  useEffect(() => {
    if (props.listarFotos) {
      setDataOrdenImages(props.listarFotos);
    }
  }, [props.listarFotos]);

  return (
    <div className="container mt-4">

      <ProductoImagenRecomendacionModal
        open={imgModal.open}
        file={imgModal.file}
        analysis={imgModal.analysis}
        previewUrl={imgModal.previewUrl}
        onCancel={closeImgModal}
        onConfirm={confirmImgModal}
        titulo="Recomendación al agregar imagen"
      />

      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        Agregar Imagen
        <VisuallyHiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChangeFoto}
        />
      </Button>
      <Typography variant="caption" component="div" sx={{ display: "block", mt: 1, mb: 2, maxWidth: 420, lineHeight: 1.35, color: "text.secondary", fontSize: "0.65rem" }}>
        Ideal {PRODUCTO_IMAGEN_RECOMENDACION.recomendadoPx}×{PRODUCTO_IMAGEN_RECOMENDACION.recomendadoPx} px, 1:1 (desde {PRODUCTO_IMAGEN_RECOMENDACION.minEjemploPx}×{PRODUCTO_IMAGEN_RECOMENDACION.minEjemploPx} px). Verás la guía al elegir archivo.
      </Typography>

      <DataGrid
        keyExpr="id_producto_foto"
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
          type="buttons"
          visible={true}
        >
          <ColumnButton
            icon="trash"
            hint={"Eliminar"}
            onClick={(evt) => props.eliminarRegistroFotos(evt.row.data)}
            // visible={accessButton.eliminar ? true : false}
          />
        </Column>

      </DataGrid>
    </div>
  );
}

export default ProductoFotoEditPage;

