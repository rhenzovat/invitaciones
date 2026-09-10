import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

const isFunctionDefined = (functionName) => functionName && typeof functionName === "function";
const isNullOrUndefined = (value) => value === null || value === undefined;

/**
 * Diálogo de confirmación.
 * Soporta API antigua (isVisible, setIsVisible, message, onHide) y API usada en menú (open, text, onCancel).
 */
const Confirm = ({
  isVisible,
  open,
  setIsVisible,
  setInstance,
  size,
  title,
  message,
  text,
  contentRender: userContentRender,
  onConfirm: onUserConfirm,
  onHide: onUserHide,
  onCancel,
  className: dialogClassName,
  confirmText,
  cancelText,
  ...rest
}) => {
  const dialogOpen = Boolean(open ?? isVisible);
  const bodyMessage = message ?? text;

  const closeDialog = () => {
    if (isFunctionDefined(onUserHide)) onUserHide();
    if (isFunctionDefined(onCancel)) onCancel();
    if (isFunctionDefined(setIsVisible)) setIsVisible(false);
  };

  const onConfirm = () => {
    if (isFunctionDefined(onUserConfirm)) onUserConfirm();
    if (isFunctionDefined(setIsVisible)) setIsVisible(false);
  };

  const onHide = () => {
    closeDialog();
  };

  return (
    <>
      <Dialog fullWidth open={dialogOpen} onClose={onHide} className={dialogClassName} {...rest}>
        <DialogTitle>{title ? title.toUpperCase() : "CONFIRMATION"}</DialogTitle>
        <DialogContent>
          <div className="content">
            {!isNullOrUndefined(bodyMessage) && <span>{bodyMessage}</span>}
            {isNullOrUndefined(bodyMessage) && isFunctionDefined(userContentRender) && userContentRender()}
          </div>
        </DialogContent>
        <DialogActions>
          <Button className="btn-confirm" onClick={onConfirm}>
            {confirmText || "Confirm"}
          </Button>
          <Button className="btn-cancel" onClick={onHide} variant="light">
            {cancelText || "Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Confirm;
