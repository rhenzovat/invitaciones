import React from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useIntl } from "react-intl";

const isFunctionDefined = functionName => functionName && typeof functionName === 'function';
const isNullOrUndefined = value => value === null || value === undefined;

const ConfirmEnvio = ({
  isVisible,
  setIsVisible,
  setInstance,
  size,
  title,
  message,
  contentRender: userContentRender,
  onConfirm: onUserConfirm,
  onHide: onUserHide,
  className: dialogClassName,
  confirmText,
  cancelText,
  tipo, // 'precio_peso' o 'costo_envio'
  ...rest
}) => {
  const intl = useIntl();

  const onConfirm = () => {
    if (isFunctionDefined(onUserConfirm)) {
      onUserConfirm();
    }
    setIsVisible(false);
  };

  const onHide = () => {
    if (isFunctionDefined(onUserHide)) {
      onUserHide();
    }
    setIsVisible(false);
  };

  // Mensajes predeterminados según el tipo de operación
  const getDefaultMessages = () => {
    switch(tipo) {
      case 'precio_peso':
        return {
          title: intl.formatMessage({ id: "ENVIO.CONFIRM.TITULO_PRECIO_PESO" }),
          message: intl.formatMessage({ id: "ENVIO.CONFIRM.MENSAJE_PRECIO_PESO" }),
          confirmText: intl.formatMessage({ id: "ENVIO.CONFIRM.ELIMINAR_PRECIO" }),
          cancelText: intl.formatMessage({ id: "ENVIO.CONFIRM.CANCELAR" })
        };
      case 'costo_envio':
        return {
          title: intl.formatMessage({ id: "ENVIO.CONFIRM.TITULO_COSTO_ENVIO" }),
          message: intl.formatMessage({ id: "ENVIO.CONFIRM.MENSAJE_COSTO_ENVIO" }),
          confirmText: intl.formatMessage({ id: "ENVIO.CONFIRM.ELIMINAR_COSTO" }),
          cancelText: intl.formatMessage({ id: "ENVIO.CONFIRM.CANCELAR" })
        };
      default:
        return {
          title: intl.formatMessage({ id: "CONFIRM.TITULO" }),
          message: message || intl.formatMessage({ id: "CONFIRM.MENSAJE" }),
          confirmText: confirmText || intl.formatMessage({ id: "CONFIRM.ACEPTAR" }),
          cancelText: cancelText || intl.formatMessage({ id: "CONFIRM.CANCELAR" })
        };
    }
  };

  const { title: defaultTitle, message: defaultMessage, confirmText: defaultConfirmText, cancelText: defaultCancelText } = getDefaultMessages();

  return (
    <Dialog 
      fullWidth 
      maxWidth={size || "sm"}
      open={isVisible} 
      onClose={onHide}
      className={`confirm-dialog ${dialogClassName || ''}`}
      {...rest}
    >
      <DialogTitle className="confirm-title">
        {title || defaultTitle}
      </DialogTitle>
      <DialogContent className="confirm-content">
        <div className="content">
          {!isNullOrUndefined(message) && <span>{message}</span>}
          {isNullOrUndefined(message) && isFunctionDefined(userContentRender) && userContentRender()}
          {isNullOrUndefined(message) && !isFunctionDefined(userContentRender) && <span>{defaultMessage}</span>}
        </div>
      </DialogContent>
      <DialogActions className="confirm-actions">
        <Button 
          className="btn-cancel"
          onClick={onHide} 
          variant="outlined"
          color="secondary"
        >
          {cancelText || defaultCancelText}
        </Button>
        <Button 
          className="btn-confirm"
          onClick={onConfirm} 
          variant="contained"
          color="primary"
          autoFocus
        >
          {confirmText || defaultConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmEnvio;