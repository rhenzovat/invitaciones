import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

const ConfirmPopular = ({ tipo, isVisible, setIsVisible, onConfirm }) => {
  const getMessage = () => {
    switch(tipo) {
      case 'categoria_popular':
        return '¿Está seguro que desea eliminar esta categoría popular?';
      case 'banner_popular':
        return '¿Está seguro que desea eliminar este banner popular?';
      default:
        return '¿Está seguro que desea eliminar este elemento?';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleConfirm = () => {
    onConfirm();
    setIsVisible(false);
  };

  return (
    <Dialog
      open={isVisible}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Confirmar eliminación
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {getMessage()}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          variant="outlined"
          color="primary"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          color="error"
          autoFocus
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmPopular;