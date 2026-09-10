import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
} from "../../../api/clientes.api";

import ClienteListPage from "./ClienteListPage";
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

const ClienteIndexPage = (props) => {

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Materiales");
  const [listarDatos, setListarDatos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});

  const nuevoRegistro = () => {
    let dataState = { Activo: "S" };
    setDataRowEditNew({ ...dataState, esNuevoRegistro: true });
    setTitulo("Nuevo");
    setModoEdicion(true);
  };

  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
  };

  const editarRegistro = dataRow => {
    const { id_perfil: id_usuario } = dataRow;
    let filtro = { id: id_usuario };
    setModoEdicion(true);
    setTitulo("Editar");
    obtenerRegistro(filtro);
  };

  async function listarRegistros() {
    setLoading(true);
    setTitulo("Lista de Clientes");
    await listar().then(response => {
      setListarDatos(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  }

  async function obtenerRegistro(filtro) {
    const { id: id_usuario } = filtro;
    if (id_usuario) {
      let usuarios = await obtener({ id: id_usuario });
      setDataRowEditNew({ ...usuarios[0], esNuevoRegistro: false });
    }
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
          Lista de Clientes
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

          <ClienteListPage
            listarDatos={listarDatos}
            seleccionarRegistro={seleccionarRegistro}
            verRegistroDblClick={verRegistroDblClick}
            editarRegistro={editarRegistro}
            titulo={titulo}
            nuevoRegistro={nuevoRegistro}
            selectData={props.selectData}
            showPopup={props.showPopup}

          />

        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

ClienteIndexPage.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  contratista: PropTypes.string,
  isContratista: PropTypes.string,
  isControlarAsistencia: PropTypes.string
};
ClienteIndexPage.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "ClienteIndexPage",
  contratista: "",
  isContratista: "",
  isControlarAsistencia: ""
};
export default injectIntl(WithLoandingPanel(ClienteIndexPage));
