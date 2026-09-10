import React, { useEffect, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import LabelIcon from '@mui/icons-material/Label';
import DataGrid, { Column, Pager, Paging, SearchPanel, Button as ColumnButton } from 'devextreme-react/data-grid';
import { WithLoandingPanel } from 'app/utils/withLoandingPanel';
import { listar, crear, actualizar, eliminar } from 'app/api/administracion_etiquetas.api';
import { listar as listarRoles } from 'app/api/roles.api';
import { handleErrorMessages, toastSuccess } from 'app/components/notify-messages';
import Confirm from 'app/components/Confirm';
import { isNotEmpty } from 'app/utils/utils';

const PageWrap = styled(Box)(({ theme }) => ({
  padding: '24px 28px',
  minHeight: '100vh',
  backgroundColor: '#f7f3f0',
  [theme.breakpoints.down('sm')]: { padding: '16px' },
}));

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#f15a24', '#0891b2', '#059669', '#4f46e5', '#0d9488', '#6366f1'];

function EtiquetasMenuIndexPageInner({ setLoading, useAuth }) {
  const { perfil } = useAuth();
  const [lista, setLista] = useState([]);
  const [rolesLista, setRolesLista] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ nombre: '', color: COLORS[0], id_roles: '' });
  const [editingId, setEditingId] = useState(null);
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const sessionRol = perfil?.id_roles != null ? Number(perfil.id_roles) : null;

  const loadList = async () => {
    setLoading?.(true);
    try {
      const params = { activos_only: '0' };
      if (filtroRol !== '') params.id_roles = filtroRol === 'global' ? 0 : Number(filtroRol);
      const data = await listar(params);
      setLista(Array.isArray(data) ? data : []);
    } catch (err) {
      handleErrorMessages('Error', err);
    } finally {
      setLoading?.(false);
    }
  };

  useEffect(() => {
    listarRoles().then((r) => setRolesLista(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadList();
  }, [filtroRol]);

  const gridData = useMemo(() => {
    if (filtroRol === '') return lista;
    if (filtroRol === 'global') return lista.filter((e) => e.id_roles == null);
    return lista.filter((e) => Number(e.id_roles) === Number(filtroRol));
  }, [lista, filtroRol]);

  const openNew = () => {
    setForm({
      nombre: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      id_roles: sessionRol != null ? String(sessionRol) : '',
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setForm({
      nombre: row.nombre || '',
      color: row.color || '#6366f1',
      id_roles: row.id_roles != null ? String(row.id_roles) : '',
      Activo: row.Activo || 'S',
    });
    setEditingId(row.id_etiqueta);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!isNotEmpty(form.nombre)) return;
    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        color: form.color,
        id_roles: form.id_roles === '' ? null : Number(form.id_roles),
      };
      if (editingId) {
        await actualizar({ id_etiqueta: editingId, ...payload, Activo: form.Activo || 'S' });
        toastSuccess('Etiqueta actualizada');
      } else {
        await crear(payload);
        toastSuccess('Etiqueta creada');
      }
      setDialogOpen(false);
      loadList();
    } catch (err) {
      handleErrorMessages('Error al guardar', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmEliminar) return;
    setLoading(true);
    try {
      await eliminar({ id_etiqueta: confirmEliminar.id_etiqueta });
      toastSuccess('Etiqueta eliminada');
      setConfirmEliminar(null);
      loadList();
    } catch (err) {
      handleErrorMessages('Error', err);
    } finally {
      setLoading(false);
    }
  };

  const total = lista.length;

  return (
    <PageWrap>

      {/* ── Header ── */}
      <Paper sx={{
        p: 2.5, mb: 3, borderRadius: '14px',
        background: 'linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)',
        boxShadow: '0 6px 25px rgba(44,26,14,0.35)',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 46, height: 46, borderRadius: '12px',
              background: 'linear-gradient(135deg,#cc6b8e,#a0455e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(160,69,94,0.4)',
            }}>
              <LabelIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                Etiquetas de Menú
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                Administra las etiquetas y categorías del menú de navegación
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Chip
              label={`${total} etiquetas`}
              size="small"
              sx={{
                bgcolor: 'rgba(204,107,142,0.25)',
                color: '#f5c6d8',
                fontWeight: 700,
                border: '1px solid rgba(204,107,142,0.4)',
              }}
            />
            <FormControl
              size="small"
              sx={{
                minWidth: 170,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiSvgIcon-root': { color: '#fff' },
              }}
            >
              <InputLabel>Filtrar por rol</InputLabel>
              <Select value={filtroRol} label="Filtrar por rol" onChange={(e) => setFiltroRol(e.target.value)}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="global">Globales (recomendadas)</MenuItem>
                {rolesLista.map((r) => (
                  <MenuItem key={r.id_roles} value={String(r.id_roles)}>
                    {r.nombre || `Rol ${r.id_roles}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Nueva etiqueta" placement="left">
              <IconButton
                onClick={openNew}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  width: 40, height: 40,
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.25)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* ── DataGrid ── */}
      <Paper sx={{
        borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(204,107,142,0.15)',
        boxShadow: '0 2px 12px rgba(44,26,14,0.08)',
        '& .dx-datagrid': { fontFamily: "'Inter','Roboto',sans-serif" },
        '& .dx-datagrid-headers': {
          background: 'linear-gradient(135deg, #fdf8f5, #f5eae4)',
          '& .dx-header-row td': {
            fontSize: '0.72rem !important',
            fontWeight: '700 !important',
            color: '#4a2a15 !important',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '2px solid rgba(184,134,11,0.2) !important',
            padding: '14px 12px !important',
          },
        },
        '& .dx-datagrid-rowsview .dx-row:hover td': {
          background: 'rgba(204,107,142,0.06) !important',
        },
        '& .dx-datagrid-rowsview .dx-row td': {
          padding: '12px 12px !important',
          fontSize: '0.84rem',
          color: '#2c1a0e',
        },
      }}>
      <DataGrid
        keyExpr="id_etiqueta"
        dataSource={gridData}
        showBorders={false}
        columnAutoWidth
        rowAlternationEnabled
        onRowDblClick={(e) => openEdit(e.data)}
      >
        <Paging defaultPageSize={20} />
        <Pager showPageSizeSelector showInfo />
        <SearchPanel visible placeholder="Buscar etiqueta..." />
        <Column dataField="id_etiqueta" caption="ID" width={70} alignment="center" />
        <Column dataField="nombre" caption="Nombre" />
        <Column
          caption="Color"
          width={90}
          cellRender={({ data }) => (
            <Box sx={{ width: 28, height: 18, borderRadius: 1, bgcolor: data.color || '#6366f1' }} />
          )}
        />
        <Column
          caption="Rol"
          calculateCellValue={(row) =>
            row.id_roles == null ? 'Global' : rolesLista.find((r) => Number(r.id_roles) === Number(row.id_roles))?.nombre || row.id_roles
          }
        />
        <Column
          caption="Tipo"
          width={130}
          cellRender={({ data }) => (
            <Chip
              size="small"
              label={data.es_recomendada === 'S' ? 'Recomendada' : 'Personalizada'}
              sx={data.es_recomendada === 'S'
                ? { bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.68rem', border: '1px solid #86efac' }
                : { bgcolor: 'rgba(204,107,142,0.12)', color: '#a0455e', fontWeight: 700, fontSize: '0.68rem', border: '1px solid rgba(204,107,142,0.3)' }
              }
            />
          )}
        />
        <Column dataField="Activo" caption="Activo" width={70} />
        <Column type="buttons" width={100} caption="Acciones">
          <ColumnButton icon="edit" hint="Editar" onClick={(e) => openEdit(e.row.data)} />
          <ColumnButton icon="trash" hint="Eliminar" onClick={(e) => setConfirmEliminar(e.row.data)} />
        </Column>
      </DataGrid>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Editar etiqueta' : 'Nueva etiqueta'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            value={form.nombre}
            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Color (hex)"
            margin="normal"
            value={form.color}
            onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol (vacío = global)</InputLabel>
            <Select
              value={form.id_roles}
              label="Rol (vacío = global)"
              onChange={(e) => setForm((p) => ({ ...p, id_roles: e.target.value }))}
            >
              <MenuItem value="">Global — todos los roles</MenuItem>
              {rolesLista.map((r) => (
                <MenuItem key={r.id_roles} value={String(r.id_roles)}>
                  {r.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {editingId && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Activo</InputLabel>
              <Select
                value={form.Activo || 'S'}
                label="Activo"
                onChange={(e) => setForm((p) => ({ ...p, Activo: e.target.value }))}
              >
                <MenuItem value="S">Sí</MenuItem>
                <MenuItem value="N">No</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.nombre.trim()}
            sx={{
              background: 'linear-gradient(135deg,#cc6b8e,#a0455e)',
              textTransform: 'none', fontWeight: 700,
              '&:hover': { background: 'linear-gradient(135deg,#a0455e,#7a2a3e)' },
              '&.Mui-disabled': { background: '#e2d3d8' },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Confirm
        open={!!confirmEliminar}
        onClose={() => setConfirmEliminar(null)}
        onConfirm={handleDelete}
        title="Eliminar etiqueta"
        message={`¿Eliminar «${confirmEliminar?.nombre}»? Se quitará de menús y módulos.`}
      />
    </PageWrap>
  );
}

export default WithLoandingPanel(EtiquetasMenuIndexPageInner);
