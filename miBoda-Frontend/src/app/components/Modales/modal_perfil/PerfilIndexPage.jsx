import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useIntl, injectIntl } from "react-intl";
import PropTypes from "prop-types";
import { styled, alpha } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import InputAdornment from '@mui/material/InputAdornment';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import Confirm from "../../../components/Confirm";
import {
  obtener_check,
  obtener_lista,
  obtener_asignar,
  eliminar_multiple,
} from "../../../api/perfiles.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";

// ─── Styled Components ───────────────────────────────────────────────
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: 780,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2.5),
    background: theme.palette.grey[50],
  },
}));

const TransferContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  alignItems: 'stretch',
  minHeight: 420,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    minHeight: 'auto',
  },
}));

const PanelPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const PanelHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})(({ theme, variant }) => ({
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: variant === 'available'
    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
    : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
  color: '#fff',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1, 1.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    fontSize: '0.85rem',
    background: '#fff',
    '& fieldset': { borderColor: theme.palette.divider },
    '&:hover fieldset': { borderColor: theme.palette.primary.main },
    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.9, 1),
  },
}));

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.18),
    },
  },
}));

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 0),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    padding: theme.spacing(1),
  },
}));

const TransferButton = styled(Button)(({ theme }) => ({
  minWidth: 44,
  width: 44,
  height: 44,
  borderRadius: 10,
  padding: 0,
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: theme.shadows[2],
  '&:not(:disabled):hover': {
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[6],
  },
  '&:disabled': {
    opacity: 0.4,
    boxShadow: 'none',
  },
}));

// ─── Helper ──────────────────────────────────────────────────────────
function not(a, b) {
  return a.filter((item) => !b.some((bItem) => bItem.id_perfil === item.id_perfil));
}

function intersection(a, b) {
  return a.filter((item) => b.some((bItem) => bItem.id_perfil === item.id_perfil));
}

function isProfileActive(item) {
  const value = item?.Activo ?? item?.activo ?? item?.estado;
  if (value === undefined || value === null) return true;
  const normalized = String(value).trim().toUpperCase();
  return normalized === "S" || normalized === "1" || normalized === "A" || normalized === "ACTIVO" || normalized === "TRUE";
}

// ─── Component ───────────────────────────────────────────────────────
const PerfilIndexPage = (props) => {
  const { setLoading } = props;
  const intl = useIntl();

  const [disponibles, setDisponibles] = useState([]);
  const [asignados, setAsignados] = useState([]);
  const [checked, setChecked] = useState([]);
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Derived
  const leftChecked = intersection(checked, disponibles);
  const rightChecked = intersection(checked, asignados);

  const filteredLeft = useMemo(() => {
    if (!searchLeft) return disponibles;
    const q = searchLeft.toLowerCase();
    return disponibles.filter(
      (p) => p.nombre?.toLowerCase().includes(q) || String(p.id_perfil).includes(q)
    );
  }, [disponibles, searchLeft]);

  const filteredRight = useMemo(() => {
    if (!searchRight) return asignados;
    const q = searchRight.toLowerCase();
    return asignados.filter(
      (p) => p.nombre?.toLowerCase().includes(q) || String(p.id_perfil).includes(q)
    );
  }, [asignados, searchRight]);

  // ─── Data fetching ───
  const listarRegistros = useCallback(async () => {
    setLoading(true);
    try {
      const [todosPerfiles, perfilesAsignados] = await Promise.all([
        obtener_check({ id_usuario: props.idUsuario }),
        obtener_lista({ id_usuario: props.idUsuario }),
      ]);
      const activosDisponibles = (todosPerfiles || []).filter(isProfileActive);
      const activosAsignados = (perfilesAsignados || []).filter(isProfileActive);
      setDisponibles(activosDisponibles);
      setAsignados(activosAsignados);
      setChecked([]);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }, [props.idUsuario, setLoading, intl]);

  useEffect(() => {
    listarRegistros();
  }, [listarRegistros]);

  // ─── Toggle check ───
  const handleToggle = (item) => () => {
    const currentIndex = checked.findIndex((c) => c.id_perfil === item.id_perfil);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(item);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handleToggleAll = (items) => () => {
    if (intersection(checked, items).length === items.length) {
      setChecked(not(checked, items));
    } else {
      const merged = [...checked, ...not(items, checked)];
      setChecked(merged);
    }
  };

  // ─── Transfer actions ───
  const handleMoveRight = async () => {
    if (leftChecked.length === 0) return;
    const ids = leftChecked.map((x) => x.id_perfil).join('|');
    setLoading(true);
    try {
      await obtener_asignar({ id_perfil: ids, id_usuario: props.idUsuario });
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      await listarRegistros();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveLeft = () => {
    if (rightChecked.length === 0) return;
    setPendingAction({ type: 'remove', items: rightChecked });
    setIsVisible(true);
  };

  const handleMoveAllRight = async () => {
    if (disponibles.length === 0) return;
    const ids = disponibles.map((x) => x.id_perfil).join('|');
    setLoading(true);
    try {
      await obtener_asignar({ id_perfil: ids, id_usuario: props.idUsuario });
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      await listarRegistros();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveAllLeft = () => {
    if (asignados.length === 0) return;
    setPendingAction({ type: 'removeAll', items: asignados });
    setIsVisible(true);
  };

  const confirmRemoval = async () => {
    if (!pendingAction) return;
    const ids = pendingAction.items.map((x) => x.id_perfil).join('|');
    setIsVisible(false);
    setLoading(true);
    try {
      await eliminar_multiple({ id_perfil: ids, id_usuario: props.idUsuario });
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      await listarRegistros();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
  };

  // ─── Select profile for roles ───
  const handleSelectForRoles = (perfil) => {
    if (props.selectData) props.selectData(perfil);
  };

  // ─── Render panel ───
  const renderPanel = (title, icon, items, filteredItems, variant, search, setSearch) => {
    const numChecked = intersection(checked, items).length;
    const allChecked = items.length > 0 && numChecked === items.length;
    const someChecked = numChecked > 0 && numChecked < items.length;

    return (
      <PanelPaper elevation={0}>
        <PanelHeader variant={variant}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="subtitle1" fontWeight={600} fontSize="0.9rem">
              {title}
            </Typography>
          </Box>
          <Chip
            label={`${numChecked}/${items.length}`}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </PanelHeader>

        <SearchField
          size="small"
          placeholder="Buscar perfil..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Divider />

        <Box
          onClick={handleToggleAll(items)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.5,
            px: 1.5,
            bgcolor: 'grey.50',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          <Checkbox
            size="small"
            checked={allChecked}
            indeterminate={someChecked}
            disableRipple
            sx={{
              p: 0.25,
              mr: 1,
              '&.Mui-checked': { color: variant === 'available' ? 'primary.main' : 'success.main' }
            }}
          />
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            {allChecked ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </Typography>
        </Box>
        <Divider />

        {/* Items list */}
        <List dense sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {filteredItems.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.disabled">
                {search ? 'Sin resultados' : 'Sin perfiles'}
              </Typography>
            </Box>
          )}
          {filteredItems.map((item) => {
            const isChecked = checked.some((c) => c.id_perfil === item.id_perfil);
            return (
              <Fade in key={item.id_perfil} timeout={300}>
                <StyledListItem
                  role={undefined}
                  onClick={handleToggle(item)}
                  selected={isChecked}
                  dense
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      size="small"
                      checked={isChecked}
                      disableRipple
                      tabIndex={-1}
                      sx={{ '&.Mui-checked': { color: variant === 'available' ? 'primary.main' : 'success.main' } }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={isChecked ? 600 : 400}>
                        {item.nombre}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        ID: {item.id_perfil}
                      </Typography>
                    }
                  />
                  {variant === 'assigned' && (
                    <Tooltip title="Asignar Roles" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectForRoles(item);
                        }}
                        sx={{
                          color: 'success.main',
                          '&:hover': { bgcolor: alpha('#4caf50', 0.1) },
                        }}
                      >
                        <AssignmentIndIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </StyledListItem>
              </Fade>
            );
          })}
        </List>
      </PanelPaper>
    );
  };

  // ─── JSX ───
  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="perfil-transfer-dialog"
        open={props.showPopup.isVisiblePopUp}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
          id="perfil-transfer-dialog"
        >
          <SecurityIcon color="primary" />
          Asignación de Perfiles
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
            transition: 'all 0.2s',
            '&:hover': {
              color: theme.palette.error.main,
              transform: 'rotate(90deg)',
            },
          })}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers>
          <TransferContainer>
            {/* LEFT — Available */}
            {renderPanel(
              'Disponibles',
              <SecurityIcon fontSize="small" />,
              disponibles,
              filteredLeft,
              'available',
              searchLeft,
              setSearchLeft,
            )}

            {/* CENTER — Transfer buttons */}
            <ActionButtonsContainer>
              <Tooltip title="Asignar todos" arrow placement="right">
                <span>
                  <TransferButton
                    variant="outlined"
                    size="small"
                    onClick={handleMoveAllRight}
                    disabled={disponibles.length === 0}
                    color="primary"
                  >
                    <KeyboardDoubleArrowRightIcon />
                  </TransferButton>
                </span>
              </Tooltip>

              <Tooltip title="Asignar seleccionados" arrow placement="right">
                <span>
                  <TransferButton
                    variant="contained"
                    size="small"
                    onClick={handleMoveRight}
                    disabled={leftChecked.length === 0}
                    color="primary"
                  >
                    <ChevronRightIcon />
                  </TransferButton>
                </span>
              </Tooltip>

              <Tooltip title="Remover seleccionados" arrow placement="right">
                <span>
                  <TransferButton
                    variant="contained"
                    size="small"
                    onClick={handleMoveLeft}
                    disabled={rightChecked.length === 0}
                    color="error"
                  >
                    <ChevronLeftIcon />
                  </TransferButton>
                </span>
              </Tooltip>

              <Tooltip title="Remover todos" arrow placement="right">
                <span>
                  <TransferButton
                    variant="outlined"
                    size="small"
                    onClick={handleMoveAllLeft}
                    disabled={asignados.length === 0}
                    color="error"
                  >
                    <KeyboardDoubleArrowLeftIcon />
                  </TransferButton>
                </span>
              </Tooltip>
            </ActionButtonsContainer>

            {/* RIGHT — Assigned */}
            {renderPanel(
              'Asignados',
              <AssignmentIndIcon fontSize="small" />,
              asignados,
              filteredRight,
              'assigned',
              searchRight,
              setSearchRight,
            )}
          </TransferContainer>
        </DialogContent>
      </BootstrapDialog>

      <Confirm
        message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={(v) => {
          setIsVisible(v);
          if (!v) setPendingAction(null);
        }}
        onConfirm={confirmRemoval}
        title={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

PerfilIndexPage.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  contratista: PropTypes.string,
  isContratista: PropTypes.string,
  isControlarAsistencia: PropTypes.string,
};
PerfilIndexPage.defaultProps = {
  showButton: false,
  selectionMode: "row",
  uniqueId: "PerfilIndexPage",
  contratista: "",
  isContratista: "",
  isControlarAsistencia: "",
};
export default injectIntl(WithLoandingPanel(PerfilIndexPage));
