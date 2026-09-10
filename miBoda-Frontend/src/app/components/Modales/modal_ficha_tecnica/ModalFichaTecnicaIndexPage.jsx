import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { useIntl, injectIntl } from "react-intl";
import {
  actualizar_ficha_tecnica,
  obtener_ficha_tecnica,
} from "../../../api/producto.api";


import ModalFichaTecnicaListPage from "./ModalFichaTecnicaListPage";


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

const ModalFichaTecnicaIndexPage = ({ setLoading, ...props }) => {

  const intl = useIntl();
  const [dataRowEditNew, setDataRowEditNew] = useState({});

  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
  };

  async function obtenerRegistro() {
    setLoading(true);
    await obtener_ficha_tecnica({ id_producto: props.idProducto }).then((response) => {
      setDataRowEditNew({ ...response || [], esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function agregarFichaTecnica(dataRow) {
    setLoading(true);
    let params = {
      ...dataRow
      , Activo: 'S'
    };
    await actualizar_ficha_tecnica(params).then(response => {
      if (response)
        toastSuccess(response);
      handleClose();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  useEffect(() => {
    obtenerRegistro();
  }, []);


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
              maxWidth: "87%",  // Set your width here
            },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Ficha Técnica
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
          <ModalFichaTecnicaListPage
            idProducto={props.idProducto}
            agregarFichaTecnica={agregarFichaTecnica}
            dataRowEditNew={dataRowEditNew}
          />

        </DialogContent>
      </BootstrapDialog>
    </>
  );
};


export default injectIntl(WithLoandingPanel(ModalFichaTecnicaIndexPage));
