import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useIntl, injectIntl } from "react-intl";
import {
  listar,
} from "../../../api/usuario.api";

import UsuarioListPage from "./UsuarioListPage";
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

const UsuarioIndexPage = (props) => {

  const { setLoading, idUsuario, idEmpleado } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Materiales");
  const [listarDatos, setListarDatos] = useState([]);

  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
  };

  async function listarRegistros() {
    setLoading(true);
    setTitulo("Seleccione un Usuario");
    await listar().then(response => {
      if (idUsuario != null) {
        const isResult = response.filter((values) => values.id !== idUsuario.id_usuario)
        setListarDatos(isResult);
      } else {
        setListarDatos(response);
      }

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  }

  const seleccionarRegistro = dataRow => {
    console.log('%c [test]-96', 'font-size:13px; background:pink; color:#bf2c9f;', dataRow)
  }

  const verRegistroDblClick = async (dataRow) => {
  };

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
          Asigne un Usuario
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

          <UsuarioListPage
            idUsuario={idUsuario}
            listarDatos={listarDatos}
            seleccionarRegistro={seleccionarRegistro}
            verRegistroDblClick={verRegistroDblClick}
            titulo={titulo}
            selectData={props.selectData}
            removeUsuario={props.removeUsuario}
            showPopup={props.showPopup}
          />

        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

UsuarioIndexPage.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  contratista: PropTypes.string,
  isContratista: PropTypes.string,
  isControlarAsistencia: PropTypes.string
};
UsuarioIndexPage.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "UsuarioIndexPage",
  contratista: "",
  isContratista: "",
  isControlarAsistencia: ""
};
export default injectIntl(WithLoandingPanel(UsuarioIndexPage));
