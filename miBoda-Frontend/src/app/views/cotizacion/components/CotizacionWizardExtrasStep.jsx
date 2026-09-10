import { useState } from 'react';
import {
  Box, Typography, Button, Paper, IconButton, Tooltip,
  Stack, Divider, TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon               from '@mui/icons-material/CheckCircle';
import EditIcon                      from '@mui/icons-material/Edit';
import AddIcon                       from '@mui/icons-material/Add';
import CloseIcon                     from '@mui/icons-material/Close';
import SaveIcon                      from '@mui/icons-material/Save';
import CotizacionExtrasInfoGrid        from './CotizacionExtrasInfoGrid';
import CmsPanelRoot                    from 'app/components/cms/CmsPanelRoot';
import CotizacionSortableCaracteristicas from './CotizacionSortableCaracteristicas';
import CotizacionCmsIconField            from './CotizacionCmsIconField';
import { guardarConfig }                 from '../../../api/cotizacion.api';
import { toastSuccess, handleErrorMessages } from '../../../components/notify-messages';

// ── Estilos oscuros del panel CMS ─────────────────────────────────────────────
const DF = styled(TextField)(() => ({
  '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.07)', color: '#f1f5f9', borderRadius: 6 },
  '& .MuiInputBase-input': { color: '#f1f5f9' },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,74,153,0.6)' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#004A99' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#60a5fa' },
}));

const Tag = styled(Typography)(() => ({
  fontSize: '0.60rem', fontWeight: 700, letterSpacing: '0.10em',
  textTransform: 'uppercase', color: '#60a5fa', marginBottom: 5, marginTop: 2,
}));

const Sep = () => <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1.5 }} />;

export default function CotizacionWizardExtrasStep({
  hasHosting,
  onHostingChange,
  discountHosting = 50,
  currency = 'S/',
  infoBlocks = [],
  hostingError = false,
  editable = false,
  onBlockSaved,
}) {
  const fmt = (n) => `${currency} ${Math.round(n).toLocaleString('es-PE')}`;

  // ── Estado del panel activo: 'hosting' | 'block' | null ──────────────────
  const [activePanel, setActivePanel] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [activeBlock, setActiveBlock] = useState(null);

  // ── Panel: editar bloque informativo ─────────────────────────────────────
  const [editDatos, setEditDatos] = useState({});
  const [editIdx,   setEditIdx]   = useState(null);

  const openBlock = (bloque, idx) => {
    setEditDatos({ ...bloque, items: Array.isArray(bloque.items) ? [...bloque.items] : [] });
    setEditIdx(idx);
    setActiveBlock(bloque.id ?? idx);
    setActivePanel('block');
  };

  const setItem    = (i, val) => setEditDatos((p) => { const a = [...p.items]; a[i] = val; return { ...p, items: a }; });
  const addItem    = () => setEditDatos((p) => ({ ...p, items: [...p.items, ''] }));
  const removeItem = (i) => setEditDatos((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  const saveBlock = async () => {
    setSaving(true);
    try {
      const blocks = infoBlocks.map((b, i) =>
        i === editIdx ? { ...b, ...editDatos, items: editDatos.items.filter(Boolean) } : b
      );
      await guardarConfig({ info_bloques: blocks });
      toastSuccess('Bloque guardado');
      closePanel();
      onBlockSaved?.();
    } catch (e) {
      handleErrorMessages('Error al guardar bloque', e);
    } finally {
      setSaving(false);
    }
  };

  // ── Panel: editar descuento hosting ──────────────────────────────────────
  const [hostingVal, setHostingVal] = useState('');

  const openHosting = () => {
    setHostingVal(String(discountHosting));
    setActivePanel('hosting');
  };

  const saveHosting = async () => {
    setSaving(true);
    try {
      await guardarConfig({ descuento_hosting: parseFloat(hostingVal) || 50 });
      toastSuccess('Descuento actualizado');
      closePanel();
      onBlockSaved?.();
    } catch (e) {
      handleErrorMessages('Error', e);
    } finally {
      setSaving(false);
    }
  };

  const closePanel = () => { setActivePanel(null); setActiveBlock(null); };

  return (
    <>
      <Paper sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>

        {/* ── Sección hosting ── */}
        <Box sx={{ position: 'relative', '&:hover .hosting-edit-btn': { opacity: 1 } }}>
          {editable && (
            <Tooltip title="Editar descuento de hosting" placement="top" arrow>
              <IconButton className="hosting-edit-btn" size="small" onClick={openHosting}
                sx={{
                  position: 'absolute', top: 0, right: 0, zIndex: 1,
                  opacity: 0, transition: 'opacity 0.15s',
                  bgcolor: '#004A99', color: '#fff', width: 28, height: 28,
                  '&:hover': { bgcolor: '#003580', opacity: '1 !important' },
                }}>
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
            ¿Ya cuentas con hosting y dominio?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Si ya los tienes, aplicamos un descuento automático de {fmt(discountHosting)}.
          </Typography>
        </Box>

        {/* Botones Sí / No */}
        <Box sx={{
          display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2,
          ...(hostingError && {
            '& button': { borderColor: '#dc2626 !important', animation: 'shake 0.4s ease' },
            '@keyframes shake': {
              '0%, 100%': { transform: 'translateX(0)' },
              '25%':      { transform: 'translateX(-4px)' },
              '75%':      { transform: 'translateX(4px)' },
            },
          }),
        }}>
          <Button fullWidth variant="outlined" onClick={() => onHostingChange(true)} sx={{
            flex: 1, minWidth: 160, py: 1.75, fontWeight: 600, textTransform: 'none', borderWidth: 2,
            borderColor: hasHosting === true ? '#16a34a' : '#e2e8f0',
            bgcolor:     hasHosting === true ? 'rgba(22,163,74,0.06)' : '#fff',
            color:       hasHosting === true ? '#15803d' : '#1e293b',
            boxShadow:   hasHosting === true ? '0 4px 16px rgba(22,163,74,0.14)' : '0 2px 6px rgba(0,0,0,0.04)',
            '&:hover': { borderColor: '#16a34a', transform: 'translateY(-1px)' },
          }}>
            Sí, ya cuento con hosting
          </Button>
          <Button fullWidth variant="outlined" onClick={() => onHostingChange(false)} sx={{
            flex: 1, minWidth: 160, py: 1.75, fontWeight: 600, textTransform: 'none', borderWidth: 2,
            borderColor: hasHosting === false ? '#004A99' : '#e2e8f0',
            bgcolor:     hasHosting === false ? 'rgba(0,74,153,0.05)' : '#fff',
            color:       hasHosting === false ? '#004A99' : '#1e293b',
            boxShadow:   hasHosting === false ? '0 4px 16px rgba(0,74,153,0.14)' : '0 2px 6px rgba(0,0,0,0.04)',
            '&:hover': { borderColor: '#004A99', transform: 'translateY(-1px)' },
          }}>
            No cuento con hosting
          </Button>
        </Box>

        {hasHosting === true && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            p: 1.25, mb: 2, borderRadius: 1,
            bgcolor: 'rgba(22,163,74,0.07)', border: '1.5px solid rgba(22,163,74,0.28)',
            color: '#15803d', fontWeight: 700, fontSize: '0.8rem',
          }}>
            <CheckCircleIcon sx={{ fontSize: 18 }} />
            Descuento aplicado: −{fmt(discountHosting)}
          </Box>
        )}

        {/* ── Info blocks con lápiz ── */}
        <CotizacionExtrasInfoGrid
          bloques={infoBlocks}
          editable={editable}
          activeBlockId={activeBlock}
          onEditBlock={openBlock}
        />
      </Paper>

      {/* ── Panel lateral CMS: editar bloque informativo ── */}
      <CmsPanelRoot open={activePanel === 'block'} panelLeft={0}>
        <Box sx={{
          px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(0,0,0,0.25)',
          position: 'sticky', top: 0, zIndex: 1, gap: 1,
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#f1f5f9', lineHeight: 1.3 }}>
              Editar bloque informativo
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.60rem', display: 'block' }}>
              {editDatos.titulo || ''}
            </Typography>
          </Box>
          <IconButton size="small" onClick={closePanel}
            sx={{ color: '#94a3b8', flexShrink: 0, '&:hover': { color: '#60a5fa' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
          <Tag>Bloque</Tag>
          <DF size="small" fullWidth label="Título" sx={{ mb: 1.5 }}
            value={editDatos.titulo ?? ''}
            onChange={(e) => setEditDatos((p) => ({ ...p, titulo: e.target.value }))}
            placeholder="Todos los proyectos incluyen"
          />
          <CotizacionCmsIconField
            Field={DF}
            label="Ícono Bootstrap (ej. bi-gift)"
            fieldKey="icon"
            value={editDatos.icon}
            onChange={(key, val) => setEditDatos((p) => ({ ...p, [key]: val }))}
            placeholder="bi-gift"
          />
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
            Puedes usar {'{renovacion_dominio}'} o {'{soporte_hora}'} en los ítems.
          </Typography>

          <Sep />
          <Tag>Ítems de la lista</Tag>
          <CotizacionSortableCaracteristicas
            items={editDatos.items || []}
            onChange={(arr) => setEditDatos((p) => ({ ...p, items: arr }))}
            onRemove={removeItem}
            emptyHint="Sin ítems — agrega uno abajo"
            hint="Arrastra ⋮⋮ para cambiar el orden"
            renderField={(item, i) => (
              <DF size="small" fullWidth value={item}
                placeholder={`Ítem ${i + 1}`}
                onChange={(e) => setItem(i, e.target.value)}
                sx={{ mb: 0 }}
              />
            )}
          />
          <Button size="small" startIcon={<AddIcon />} onClick={addItem}
            sx={{ color: '#60a5fa', textTransform: 'none', fontSize: '0.72rem', mt: 0.5 }}>
            Agregar ítem
          </Button>
        </Box>

        <Box sx={{
          px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(0,0,0,0.25)', position: 'sticky', bottom: 0,
        }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />}
                onClick={saveBlock} disabled={saving}
                sx={{ bgcolor: '#004A99', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#003580' } }}>
                {saving ? 'Guardando…' : 'Guardar bloque'}
              </Button>
              <Button variant="outlined" onClick={closePanel}
                sx={{ borderColor: 'rgba(255,255,255,0.20)', color: '#94a3b8', minWidth: 44 }}>
                <CloseIcon fontSize="small" />
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CmsPanelRoot>

      {/* ── Panel lateral CMS: editar descuento hosting ── */}
      <CmsPanelRoot open={activePanel === 'hosting'} panelLeft={0}>
        <Box sx={{
          px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(0,0,0,0.25)',
          position: 'sticky', top: 0, zIndex: 1, gap: 1,
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#f1f5f9', lineHeight: 1.3 }}>
              Descuento por hosting propio
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.60rem', display: 'block' }}>
              Se aplica cuando el cliente ya tiene hosting
            </Typography>
          </Box>
          <IconButton size="small" onClick={closePanel}
            sx={{ color: '#94a3b8', flexShrink: 0, '&:hover': { color: '#60a5fa' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
          <Tag>Monto del descuento</Tag>
          <DF size="small" fullWidth label={`Descuento (${currency})`} type="number"
            value={hostingVal}
            onChange={(e) => setHostingVal(e.target.value)}
            inputProps={{ min: 0, step: 10 }}
            sx={{ mb: 1.5 }}
          />
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.5 }}>
            Importe que se resta automáticamente del total cuando el cliente selecciona
            "Sí, ya cuento con hosting".
          </Typography>
        </Box>

        <Box sx={{
          px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(0,0,0,0.25)', position: 'sticky', bottom: 0,
        }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />}
                onClick={saveHosting} disabled={saving}
                sx={{ bgcolor: '#004A99', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#003580' } }}>
                {saving ? 'Guardando…' : 'Guardar descuento'}
              </Button>
              <Button variant="outlined" onClick={closePanel}
                sx={{ borderColor: 'rgba(255,255,255,0.20)', color: '#94a3b8', minWidth: 44 }}>
                <CloseIcon fontSize="small" />
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CmsPanelRoot>
    </>
  );
}
