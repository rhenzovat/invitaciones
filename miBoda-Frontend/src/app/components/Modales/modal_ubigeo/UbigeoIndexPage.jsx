import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import UbigueoListPage from "./UbigeoListPage";
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

const UbigeoIndexPage = (props) => {
  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Materiales");
  const [modoEdicion, setModoEdicion] = useState(false);

  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
  };

  const seleccionarRegistro = dataRow => {
    console.log('%c [test]-96', 'font-size:13px; background:pink; color:#bf2c9f;', dataRow)
  }

  const verRegistroDblClick = async (dataRow) => {
  };

  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={props.showPopup.isVisiblePopUp}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Obtener Ubigeo
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
          <UbigueoListPage
            seleccionarRegistro={seleccionarRegistro}
            verRegistroDblClick={verRegistroDblClick}
            titulo={titulo}
            obtenerDireccionDetalle={props.selectData}
            showPopup={props.showPopup}
          />
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

export default injectIntl(WithLoandingPanel(UbigeoIndexPage));
