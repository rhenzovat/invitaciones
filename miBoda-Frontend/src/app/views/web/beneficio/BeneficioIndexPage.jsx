import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, TextField,
  Button, CircularProgress, Divider
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { listar, actualizar } from '../../../api/beneficio.api';
import { toastSuccess, handleErrorMessages } from '../../../components/notify-messages';

const BeneficioIndexPage = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => { cargarCards(); }, []);

  const cargarCards = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setCards(data);
    } catch (err) {
      handleErrorMessages('Error', err);
    } finally {
      setLoading(false);
    }
  };

 const procesarIcono = (input) => {
  if (!input) return '';

   input = input.trim();

    // Si viene URL de fontawesome
    if (input.includes('fonts.google.com/icons/')) {
      const match = input.match(/icons\/([^?]+)/);
      const nombre = match ? match[1] : '';
      return `fas fa-${nombre}`;
    }

    // Si viene HTML
    if (input.includes('<i ')) {
    const match = input.match(/class=["']([^"']+)["']/);
    input = match ? match[1] : input;
    }
    return input
      .replace(/^fa /, 'fas ')
      .replace(/fa-(solid|regular|light|thin|duotone)/g, 'fas')
      .replace('fa-brands', 'fab')
      .trim();
  };

  const handleChange = (id, field, value) => {
    const valorProcesado = field === 'icono' ? procesarIcono(value) : value;
    setCards(prev => prev.map(card =>
      card.id === id ? { ...card, [field]: valorProcesado } : card
    ));
  };

  const handleGuardarCard = async (card) => {
    setSavingId(card.id);
    try {
      await actualizar({ cards: [card] });
      toastSuccess(`Beneficio ${card.orden} actualizado correctamente`);
    } catch (err) {
      handleErrorMessages('Error', err);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <InfoOutlinedIcon sx={{ color: '#1976d2' }} />
        <Typography variant="h5" fontWeight={700}>
          Administrar Beneficios
        </Typography>
      </Box>
      <Divider sx={{ mb: 3, borderColor: '#1976d2', borderWidth: 2 }} />

      <Grid container spacing={3}>
        {cards.map(card => {
          const isSaving = savingId === card.id;

          return (
            <Grid item xs={12} key={card.id}>
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e6ed', overflow: 'hidden' }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 3, py: 2, borderBottom: '1px solid #e0e6ed',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: '#e3f0ff', color: '#1976d2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14,

                    }}>
                      #{card.orden}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Beneficio
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon />}
                    onClick={() => handleGuardarCard(card)}
                    disabled={isSaving}
                    sx={{
                      borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3,
                      background: '#1976d2', '&:hover': { background: '#1565c0' },
                    }}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="flex-start">

                    {/* Col izquierda: Icono + Preview */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth size="small"
                        label="Icono (URL, HTML o clases de FontAwesome)"
                        value={card.icono || ''}
                        onChange={e => handleChange(card.id, 'icono', e.target.value)}
                        onBlur={e => handleChange(card.id, 'icono', procesarIcono(e.target.value))}
                        helperText="Pega la URL, el HTML o las clases directamente"
                        sx={{ mb: 1.5 }}
                      />
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        background: '#f5f5f5', p: 1.5, borderRadius: 2, border: '1px solid #e0e0e0',
                      }}>
                        <i className={card.icono} style={{ fontSize: 28, color: '#e5251c', width: 36, textAlign: 'center' }} />
                        <Typography variant="caption" color="text.secondary">
                          Preview: <strong>{card.icono || '—'}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth size="small"
                        label="Título"
                        value={card.titulo || ''}
                        onChange={e => handleChange(card.id, 'titulo', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth size="small"
                        label="Descripción"
                        value={card.descripcion || ''}
                        onChange={e => handleChange(card.id, 'descripcion', e.target.value)}
                        multiline
                        minRows={3}
                      />
                    </Grid>

                  </Grid>
                </Box>

              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default BeneficioIndexPage;