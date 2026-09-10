import { useCallback, useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Collapse, Stack,
  TextField, Button, CircularProgress, Tooltip, IconButton, Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BackHandIcon    from '@mui/icons-material/BackHand';
import ExpandMoreIcon  from '@mui/icons-material/ExpandMore';
import ExpandLessIcon  from '@mui/icons-material/ExpandLess';
import AddIcon         from '@mui/icons-material/Add';
import CloseIcon       from '@mui/icons-material/Close';
import SaveIcon        from '@mui/icons-material/Save';
import CotizacionCanvas from './CotizacionCanvas';
import { CotizacionIcon } from './CotizacionIcon';
import CmsPanelRoot from 'app/components/cms/CmsPanelRoot';
import CotizacionCmsIconField from './CotizacionCmsIconField';
import { guardarModuloCatalogo } from '../../../api/cotizacion.api';
import { toastSuccess, handleErrorMessages } from '../../../components/notify-messages';

// ── Estilos oscuros del panel CMS ────────────────────────────────────────────
const DarkField = styled(TextField)(() => ({
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

// ── Agrupa módulos por categoría ──────────────────────────────────────────────
function groupByCategoria(modules) {
  const groups = {};
  modules.forEach((m) => {
    const cat = m.categoria?.trim() || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(m);
  });
  return Object.entries(groups);
}

/**
 * Paso "Arma tu sistema en el lienzo" — módulos agrupados por categoría.
 */
export default function CotizacionWizardBuilderStep({
  canvasRef,
  modules = [],
  selectedModules = [],
  currency = 'S/',
  optional = false,
  onModulesChange,
  onModuleCreated,
}) {
  const [activeIds,  setActiveIds]  = useState(() => new Set(selectedModules.map((m) => m.id)));
  const [openGroups, setOpenGroups] = useState({});

  // ── Panel lateral "Nuevo módulo" ──────────────────────────────────────────
  const EMPTY = { nombre: '', precio: '', descripcion: '', icono: '', categoria: '' };
  const [panelOpen,  setPanelOpen]  = useState(false);
  const [addDatos,   setAddDatos]   = useState(EMPTY);
  const [addSaving,  setAddSaving]  = useState(false);

  const openPanel = (e, cat) => {
    e.stopPropagation();
    setAddDatos({ ...EMPTY, categoria: cat });
    setPanelOpen(true);
  };
  const closePanel = () => setPanelOpen(false);

  const handleChange = (key, val) =>
    setAddDatos((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!addDatos.nombre?.trim()) return;
    setAddSaving(true);
    try {
      await guardarModuloCatalogo(addDatos);
      toastSuccess(`Módulo "${addDatos.nombre}" creado`);
      closePanel();
      onModuleCreated?.();
    } catch (e) {
      handleErrorMessages('Error al crear módulo', e);
    } finally {
      setAddSaving(false);
    }
  };

  const fmt = (n) => `${currency} ${Math.round(n).toLocaleString('es-PE')}`;
  const groups = useMemo(() => groupByCategoria(modules), [modules]);

  // Sin efecto de apertura automática — todos cerrados por defecto

  const handleCanvasChange = useCallback((mods) => {
    onModulesChange(mods);
    setActiveIds(new Set(mods.map((m) => m.id)));
  }, [onModulesChange]);

  const toggleChip = (mod) => {
    canvasRef.current?.toggleModule(mod);
    const mods = canvasRef.current?.getModules?.() || [];
    handleCanvasChange(mods);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const mod = modules.find((m) => m.id === id);
    if (mod) {
      canvasRef.current?.addModule(mod);
      handleCanvasChange(canvasRef.current?.getModules?.() || []);
    }
  };

  const toggleGroup = (cat) =>
    setOpenGroups((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const ModuleItem = ({ m }) => {
    const on = activeIds.has(m.id);
    return (
      <Box
        component="button" type="button" draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', m.id)}
        onClick={() => toggleChip(m)}
        title={m.desc || m.descripcion || ''}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          p: '8px 10px', textAlign: 'left', width: '100%',
          border: '1.5px solid',
          borderColor: on ? 'rgba(241,90,36,0.35)' : '#e2e8f0',
          borderLeft: '3px solid',
          borderLeftColor: on ? '#f97316' : 'transparent',
          borderRadius: '8px',
          bgcolor: on ? 'rgba(241,90,36,0.05)' : '#fff',
          cursor: 'grab', fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          boxShadow: on ? '0 2px 8px rgba(241,90,36,0.1)' : 'none',
          '&:hover': {
            borderColor: 'rgba(0,74,153,0.3)',
            borderLeftColor: '#004A99',
            bgcolor: '#f5f8ff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          },
        }}
      >
        <CotizacionIcon icon={m.icon} fontSize="0.95rem" color={on ? '#f97316' : '#004A99'} />
        <Typography variant="body2" sx={{
          flex: 1, minWidth: 0, fontWeight: 600, fontSize: '0.70rem',
          color: '#181D38', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {m.name}
        </Typography>
        <Typography component="span" sx={{
          flexShrink: 0, fontWeight: 700, fontSize: '0.62rem',
          color: '#f97316', bgcolor: 'rgba(241,90,36,0.09)',
          px: 0.8, py: 0.2, borderRadius: '999px',
        }}>
          {fmt(m.price)}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      <Paper sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
          Arma tu sistema en el lienzo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Arrastra módulos desde el catálogo o haz clic para agregarlos. Doble clic en el lienzo para quitar.
          {optional && ' Este paso es opcional: puedes continuar sin agregar módulos.'}
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
          gap: 1.75, minHeight: 380,
        }}>
          {/* ── Catálogo agrupado por categoría ── */}
          <Box sx={{
            display: 'flex', flexDirection: 'column', gap: 0,
            maxHeight: 480, overflowY: 'auto', pr: 0.5,
            '&::-webkit-scrollbar': { width: 5 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,74,153,0.2)', borderRadius: 2 },
          }}>
            {groups.map(([cat, mods]) => {
              const isOpen      = openGroups[cat] === true;
              const activeCount = mods.filter((m) => activeIds.has(m.id)).length;
              return (
                <Box key={cat} sx={{ mb: 0.5 }}>
                  {/* Header de categoría */}
                  <Box
                    onClick={() => toggleGroup(cat)}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      px: 1.2, py: 0.6,
                      bgcolor: '#f1f5f9', borderRadius: '7px',
                      cursor: 'pointer', userSelect: 'none',
                      border: '1px solid #e2e8f0',
                      mb: isOpen ? 0.5 : 0,
                      '&:hover': { bgcolor: '#e8edf5' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#004A99',
                        textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {cat}
                      </Typography>
                      <Typography sx={{ fontSize: '0.60rem', color: '#94a3b8', fontWeight: 600 }}>
                        ({mods.length})
                      </Typography>
                      {activeCount > 0 && (
                        <Box sx={{
                          bgcolor: '#f97316', color: '#fff', borderRadius: '999px',
                          fontSize: '0.58rem', fontWeight: 800, px: 0.7, lineHeight: 1.6,
                        }}>
                          {activeCount}
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title={`Agregar módulo en "${cat}"`} placement="top" arrow>
                        <Box
                          component="span"
                          onClick={(e) => openPanel(e, cat)}
                          sx={{
                            width: 18, height: 18, borderRadius: '50%',
                            bgcolor: '#004A99', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0,
                            transition: 'all 0.15s',
                            '&:hover': { bgcolor: '#f97316', transform: 'scale(1.2)' },
                          }}
                        >
                          <AddIcon sx={{ fontSize: 12 }} />
                        </Box>
                      </Tooltip>
                      {isOpen
                        ? <ExpandLessIcon sx={{ fontSize: 15, color: '#64748b' }} />
                        : <ExpandMoreIcon sx={{ fontSize: 15, color: '#64748b' }} />}
                    </Box>
                  </Box>

                  {/* Módulos */}
                  <Collapse in={isOpen}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 0.5 }}>
                      {mods.map((m) => <ModuleItem key={m.id} m={m} />)}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>

          {/* Zona lienzo */}
          <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            sx={{
              minHeight: 320, borderRadius: '12px',
              border: '2px dashed rgba(0,74,153,0.16)',
              transition: 'border-color 0.2s',
              '&:hover': { borderColor: 'rgba(0,74,153,0.3)' },
            }}
          >
            <CotizacionCanvas ref={canvasRef} currency={currency} onChange={handleCanvasChange} />
          </Box>
        </Box>

        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.75,
          mt: 1.25, px: 1.5, py: 1,
          bgcolor: 'rgba(0,74,153,0.04)', borderRadius: 1, borderLeft: '3px solid #004A99',
        }}>
          <BackHandIcon sx={{ fontSize: 16, color: '#f97316' }} />
          <Typography variant="caption" color="text.secondary">
            Los precios se suman automáticamente en el resumen.
          </Typography>
        </Box>
      </Paper>

      {/* ── Panel lateral CMS: Nuevo módulo ── */}
      <CmsPanelRoot open={panelOpen} panelLeft={0}>
        {/* Cabecera */}
        <Box sx={{
          px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(0,0,0,0.25)',
          position: 'sticky', top: 0, zIndex: 1, gap: 1,
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#f1f5f9', lineHeight: 1.3 }}>
              Nuevo módulo
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.60rem', display: 'block' }}>
              Categoría: <span style={{ color: '#60a5fa' }}>{addDatos.categoria}</span>
            </Typography>
          </Box>
          <IconButton size="small" onClick={closePanel}
            sx={{ color: '#94a3b8', flexShrink: 0, '&:hover': { color: '#60a5fa' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Campos */}
        <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
          <Tag>Identificación</Tag>
          <CotizacionCmsIconField
            Field={DarkField}
            label="Ícono (clase Bootstrap, ej. bi-cart3)"
            fieldKey="icono"
            value={addDatos.icono}
            onChange={handleChange}
            placeholder="bi-cart3"
          />
          <DarkField size="small" fullWidth label="Nombre del módulo *"
            value={addDatos.nombre} placeholder="Chat en vivo"
            onChange={(e) => handleChange('nombre', e.target.value)} sx={{ mb: 1.5 }} />
          <DarkField size="small" fullWidth label="Descripción" multiline rows={3}
            value={addDatos.descripcion} placeholder="Descripción del módulo..."
            onChange={(e) => handleChange('descripcion', e.target.value)} sx={{ mb: 1.5 }} />

          <Sep />
          <Tag>Precio</Tag>
          <DarkField size="small" fullWidth label="Precio (S/.)" type="number"
            value={addDatos.precio} placeholder="80"
            onChange={(e) => handleChange('precio', e.target.value)} sx={{ mb: 1.5 }} />
        </Box>

        {/* Botones */}
        <Box sx={{
          px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(0,0,0,0.25)', position: 'sticky', bottom: 0,
        }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained"
                startIcon={addSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                onClick={handleSave} disabled={addSaving || !addDatos.nombre?.trim()}
                sx={{ bgcolor: '#004A99', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#003580' } }}>
                {addSaving ? 'Creando…' : 'Crear módulo'}
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
