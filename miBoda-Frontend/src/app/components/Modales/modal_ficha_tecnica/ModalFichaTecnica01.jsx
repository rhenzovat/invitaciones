import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const ModalFichaTecnica01 = forwardRef(({ onGenerarFicha, dataRowEditNew }, ref) => {
  // Estados para el formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [camposDinamicos, setCamposDinamicos] = useState([{ nombre: '', descripcion: '' }]);

  // Efecto para cargar datos existentes cuando dataRowEditNew cambie
  useEffect(() => {
    if (dataRowEditNew) {
      // Cargar título y descripción
      if (dataRowEditNew.nuevo_titulo) {
        setTitulo(dataRowEditNew.nuevo_titulo);
      }
      
      if (dataRowEditNew.nuevo_descripcion) {
        setDescripcion(dataRowEditNew.nuevo_descripcion);
      }
      
      // Cargar características dinámicas si existen
      if (dataRowEditNew.caracteristicas_array) {
        try {
          // Intentar parsear el JSON string
          const caracteristicasParseadas = typeof dataRowEditNew.caracteristicas_array === 'string' 
            ? JSON.parse(dataRowEditNew.caracteristicas_array)
            : dataRowEditNew.caracteristicas_array;
          
          if (Array.isArray(caracteristicasParseadas) && caracteristicasParseadas.length > 0) {
            setCamposDinamicos(caracteristicasParseadas);
          }
        } catch (error) {
          console.error('Error al parsear características:', error);
          // Si hay error, mantener los campos vacíos
          setCamposDinamicos([{ nombre: '', descripcion: '' }]);
        }
      } else if (dataRowEditNew.nuevo_caracteristicas) {
        try {
          // Intentar parsear nuevo_caracteristicas si existe
          const nuevasCaracteristicas = typeof dataRowEditNew.nuevo_caracteristicas === 'string' 
            ? JSON.parse(dataRowEditNew.nuevo_caracteristicas)
            : dataRowEditNew.nuevo_caracteristicas;
          
          if (Array.isArray(nuevasCaracteristicas) && nuevasCaracteristicas.length > 0) {
            setCamposDinamicos(nuevasCaracteristicas);
          }
        } catch (error) {
          console.error('Error al parsear nuevo_caracteristicas:', error);
        }
      }
    }
  }, [dataRowEditNew]);

  // Manejar cambios en campos dinámicos
  const handleCampoDinamicoChange = (index, field, value) => {
    const nuevosCampos = [...camposDinamicos];
    nuevosCampos[index][field] = value;
    setCamposDinamicos(nuevosCampos);
  };

  // Agregar nuevo campo dinámico
  const agregarCampoDinamico = () => {
    setCamposDinamicos([...camposDinamicos, { nombre: '', descripcion: '' }]);
  };

  // Eliminar campo dinámico
  const eliminarCampoDinamico = (index) => {
    if (camposDinamicos.length > 1) {
      const nuevosCampos = camposDinamicos.filter((_, i) => i !== index);
      setCamposDinamicos(nuevosCampos);
    }
  };

  const generarFichaTecnica = () => {
    const fichaTecnica = {
      titulo: titulo || dataRowEditNew?.nuevo_titulo || '',
      descripcion: descripcion || dataRowEditNew?.nuevo_descripcion || '',
      caracteristicas: camposDinamicos
        .filter(campo => campo.nombre && campo.descripcion)
        .map(campo => ({
          nombre: campo.nombre,
          descripcion: campo.descripcion
        }))
    };

    // Si se proporcionó una función callback, llamarla con los datos
    if (onGenerarFicha) {
      onGenerarFicha(fichaTecnica);
    }

    return fichaTecnica;
  };

  // Exponer la función al componente padre usando useImperativeHandle
  useImperativeHandle(ref, () => ({
    generarFichaTecnica
  }));

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Grid container spacing={0}>
        {/* Columna izquierda - Características Dinámicas */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              Características Dinámicas
              <IconButton color="primary" onClick={agregarCampoDinamico} sx={{ ml: 1 }}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Typography>

            {camposDinamicos.map((campo, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      variant="outlined"
                      value={campo.nombre}
                      onChange={(e) => handleCampoDinamicoChange(index, 'nombre', e.target.value)}
                      placeholder="Ej: Peso, Color, Material"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Descripción"
                      variant="outlined"
                      value={campo.descripcion}
                      onChange={(e) => handleCampoDinamicoChange(index, 'descripcion', e.target.value)}
                      placeholder="Ej: 2kg, Rojo, Algodón"
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      color="error"
                      onClick={() => eliminarCampoDinamico(index)}
                      disabled={camposDinamicos.length <= 1}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            {camposDinamicos.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No hay características definidas. Agrega al menos una característica.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Columna derecha - Información Básica */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Información Básica
            </Typography>

            <TextField
              fullWidth
              label="Título de la ficha técnica"
              variant="outlined"
              value={titulo || dataRowEditNew?.nuevo_titulo || ''}
              onChange={(e) => setTitulo(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Ej: Especificaciones Técnicas"
            />

            <TextField
              fullWidth
              label="Descripción del producto"
              variant="outlined"
              multiline
              rows={25}
              value={descripcion || dataRowEditNew?.nuevo_descripcion || ''}
              onChange={(e) => setDescripcion(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Describe las características generales del producto"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});

// Añade displayName para mejor debugging
ModalFichaTecnica01.displayName = 'ModalFichaTecnica01';

export default ModalFichaTecnica01;