import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { transferirAdminPrincipal } from "../../api/usuario.api";

const TransferPrincipalDialog = ({
  open,
  onClose,
  usuarioActual,
  candidatos = [],
  onTransferred,
}) => {
  const [nuevoId, setNuevoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const opciones = candidatos.filter((u) => u.id !== usuarioActual?.id && u.Activo === "S");

  const handleTransfer = async () => {
    if (!nuevoId) {
      setError("Seleccione el nuevo administrador principal.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await transferirAdminPrincipal({ id_usuario_nuevo: Number(nuevoId) });
      onTransferred?.();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "No se pudo transferir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transferir administrador principal</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          La cuenta <strong>{usuarioActual?.email}</strong> es el administrador principal del sistema.
          Debe designar un sucesor antes de eliminarla o desactivarla. Siempre debe existir un responsable principal.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {opciones.length === 0 ? (
          <Alert severity="warning">
            No hay otros usuarios activos. Cree otro usuario y vuelva a intentar.
          </Alert>
        ) : (
          <FormControl fullWidth size="small">
            <InputLabel>Nuevo administrador principal</InputLabel>
            <Select
              label="Nuevo administrador principal"
              value={nuevoId}
              onChange={(e) => setNuevoId(e.target.value)}
            >
              {opciones.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <LoadingButton
          variant="contained"
          onClick={handleTransfer}
          loading={loading}
          disabled={opciones.length === 0}
        >
          Transferir cargo
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default TransferPrincipalDialog;
