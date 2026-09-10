import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { useIntl, injectIntl } from "react-intl";
import {
  crear_imagen,
  listar_imagen,
  eliminar_imagen,
  actualizar_imagen_orden,
} from "../../../api/producto.api";

import AddImageListPage from "./AddImageListPage";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const AddImageIndexPage = (props) => {

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Materiales");
  const [listarDatos, setListarDatos] = useState([]);
  const [dataRowEditNew, setDataRowEditNew] = useState({});

  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
  };

  async function listarRegistros() {
    setLoading(true);
    setTitulo("Lista de Imagenes");
    await listar_imagen({ id_producto: props.idProducto }).then(response => {
      setListarDatos(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  }

  async function agregarMaterial(imagenProfile) {
    const formData = new FormData();
    formData.append("id_producto", props.idProducto);
    formData.append("image", imagenProfile);
    formData.append("Activo", 'S');
    await crear_imagen(formData).then(response => {
      if (response)
        toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      listarRegistros();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow) {
    setLoading(true);
    const { id_producto_imagen } = dataRow;
    await eliminar_imagen({ id_producto_imagen: id_producto_imagen }).then(() => {
      toastSuccess(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.MESSAGES.REMOVE.SUCESS" }));
      listarRegistros();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarImagenOrden(dataRow) {

    setLoading(true);
    await actualizar_imagen_orden(dataRow).then(() => {
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      listarRegistros();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  useEffect(() => {
    listarRegistros();
  }, []);

  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={props.showPopup.isVisiblePopUp}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Lista de Imagenes
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>

          <AddImageListPage
            listarDatos={listarDatos}
            titulo={titulo}
            selectData={props.selectData}
            showPopup={props.showPopup}
            agregarMaterial={agregarMaterial}
            eliminarRegistro={eliminarRegistro}
            actualizarImagenOrden={actualizarImagenOrden}
          />

        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

AddImageIndexPage.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  contratista: PropTypes.string,
  isContratista: PropTypes.string,
  isControlarAsistencia: PropTypes.string
};
AddImageIndexPage.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "AddImageIndexPage",
  contratista: "",
  isContratista: "",
  isControlarAsistencia: ""
};
export default injectIntl(WithLoandingPanel(AddImageIndexPage));
