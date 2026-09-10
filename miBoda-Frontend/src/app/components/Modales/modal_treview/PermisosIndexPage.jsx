import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useIntl, injectIntl } from "react-intl";
import {
  agregar_permisos,
} from "../../../api/roles.api";

import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";

import RolesPermisosIndexPage from "../../../views/roles/RolesPermisosIndexPage";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const PermisosIndexPage = (props) => {

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Materiales");
  const [listarDatos, setListarDatos] = useState([]);


  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
  };


  async function agregarPermisos(listIdMenus) {
    setLoading(true);
    let params = { id_menu: listIdMenus, id_roles: props.detalleRol.id_roles };
    await agregar_permisos(params).then(response => {
      if (response) toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));

      // setModoNavEdit(false);
      // setModoNavList(true);
      // setModoNavPermiso(false);
      // listarRegistros();

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }



  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={props.showPopup.isVisiblePopUp}
        sx={{
          "& .MuiDialog-container": {
            "& .MuiPaper-root": {
              width: "100%",
              maxWidth: "700px",  // Set your width here
            },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Lista de Permisos
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

          <RolesPermisosIndexPage
            cancelarEdicion={handleClose}
            agregarPermisos={agregarPermisos}
            detalleRol={props.detalleRol}
          // accessButton={accessButton}
          />

        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

PermisosIndexPage.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  contratista: PropTypes.string,
  isContratista: PropTypes.string,
  isControlarAsistencia: PropTypes.string
};
PermisosIndexPage.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "PermisosIndexPage",
  contratista: "",
  isContratista: "",
  isControlarAsistencia: ""
};
export default injectIntl((PermisosIndexPage));
