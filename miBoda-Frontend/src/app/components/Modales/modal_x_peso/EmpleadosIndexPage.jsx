import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
} from "../../../api/empleados.api";

import EmpleadosListPage from "./EmpleadosListPage";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Typography, Box, Chip, Divider } from '@mui/material';
import ScaleIcon from '@mui/icons-material/Scale';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const EmpleadosIndexPage = (props) => {
  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Materiales");
  const [listarDatos, setListarDatos] = useState([]);  // Mantenido por si se usa en el futuro

  // Estados para edición (agregados, ya que se usan en funciones)
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const nuevoRegistro = () => {
    let dataState = { Activo: "S" };
    setDataRowEditNew({ ...dataState, esNuevoRegistro: true });
    setTitulo("Nuevo");
    setModoEdicion(true);
  };

  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
  };

  const editarRegistro = dataRow => {
    const { id_perfil: id_usuario } = dataRow;
    let filtro = { id: id_usuario };
    setModoEdicion(true);
    setTitulo("Editar");
    obtenerRegistro(filtro);
  };

  async function obtenerRegistro(filtro) {
    const { id: id_usuario } = filtro;
    if (id_usuario) {
      try {
        let usuarios = await obtener({ id: id_usuario });
        setDataRowEditNew({ ...usuarios[0], esNuevoRegistro: false });
      } catch (error) {
        handleErrorMessages(intl.formatMessage({ id: "ERRORS.LOAD" }), error);
      }
    }
  }

  const seleccionarRegistro = dataRow => {
    console.log('%c [test]-96', 'font-size:13px; background:pink; color:#bf2c9f;', dataRow);
  };

  const verRegistroDblClick = async (dataRow) => {
    // Implementar lógica si es necesario, ej. abrir modal de vista
  };

  // useEffect para cargar datos si es necesario (ej. si no vienen por props)
  useEffect(() => {
    if (props.listarPesosPrecios && props.listarPesosPrecios.length > 0) {
      setListarDatos(props.listarPesosPrecios);
    } else {
      // Opcional: cargar desde API si no hay props
      // cargarDatos();
    }
  }, [props.listarPesosPrecios]);

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={props.showPopup.isVisiblePopUp}
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "87%",  // Set your width here
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Cargando Excel x Peso Envio
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
        {/* Mejora integrada: Box con detalles del producto */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start', 
          gap: 1, 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 1, 
          boxShadow: 1,
          mb: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon color="primary" fontSize="small" />
            <Typography variant="body1" fontWeight="medium">
              Producto: {props.tituloPrecio?.nombre || 'N/A'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScaleIcon color="secondary" fontSize="small" />
            <Typography variant="body1">
              Peso en Gramos: {props.tituloPrecio?.peso_kilogramo || 'N/A'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon color="success" fontSize="small" />
            <Chip 
              label={props.tituloPrecio?.precio ? `S/ ${parseFloat(props.tituloPrecio.precio).toFixed(2)}` : 'N/A'} 
              color="success" 
              variant="outlined" 
              size="small"
            />
          </Box>
          
          <Divider sx={{ width: '100%', mt: 1 }} />
        </Box>

        <EmpleadosListPage
          listarDatos={props.listarPesosPrecios || []}  // Fallback a [] para evitar errores
          seleccionarRegistro={seleccionarRegistro}
          verRegistroDblClick={verRegistroDblClick}
          editarRegistro={editarRegistro}
          titulo={titulo}
          nuevoRegistro={nuevoRegistro}
          selectData={props.selectData}
          showPopup={props.showPopup}
          setLoading={setLoading}
        />
      </DialogContent>
    </BootstrapDialog>
  );
};

// PropTypes para validación (opcional, pero buena práctica)
EmpleadosIndexPage.propTypes = {
  setLoading: PropTypes.func,
  showPopup: PropTypes.object,
  selectData: PropTypes.func,
  tituloPrecio: PropTypes.object,
  listarPesosPrecios: PropTypes.array,
};

export default injectIntl(WithLoandingPanel(EmpleadosIndexPage));