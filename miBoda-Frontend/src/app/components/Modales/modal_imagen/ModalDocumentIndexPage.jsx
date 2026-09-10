import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckIcon from '@mui/icons-material/Check';
import { injectIntl } from "react-intl";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const ModalDocumentIndexPage = (props) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleClose = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    props.showPopup.setisVisiblePopUp(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGuardar = () => {
    if (selectedFile && props.onCambiarImagen) {
      props.onCambiarImagen(selectedFile);
    }
  };

  const handleCancelarPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const imagenMostrada = previewUrl || props.imagenProducto;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={props.showPopup.isVisiblePopUp}
        sx={{
          "& .MuiDialog-container": {
            "& .MuiPaper-root": {
              width: "100%",
              maxWidth: "900px",
            },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          <Typography variant="h5">
            {previewUrl ? "Nueva imagen — vista previa" : "Imagen de Producto"}
          </Typography>
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
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={imagenMostrada}
              alt="Imagen producto"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                border: previewUrl ? '2px dashed #1976d2' : 'none',
              }}
            />
            {previewUrl && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Vista previa — aún no guardada
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          {!previewUrl ? (
            <>
              <Box />
              {props.onCambiarImagen && (
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar imagen
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="text" color="inherit" onClick={handleCancelarPreview}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={handleGuardar}
              >
                Guardar cambios
              </Button>
            </>
          )}
        </DialogActions>
      </BootstrapDialog>
    </>
  );
};

ModalDocumentIndexPage.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  onCambiarImagen: PropTypes.func,
};
ModalDocumentIndexPage.defaultProps = {
  showButton: false,
  selectionMode: "row",
  uniqueId: "ModalDocumentIndexPage",
  onCambiarImagen: null,
};
export default injectIntl(ModalDocumentIndexPage);
