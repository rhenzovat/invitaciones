import { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { listarOpciones } from 'app/api/administracion_etiquetas.api';

/**
 * Selector múltiple de etiquetas (globales + del rol).
 */
export default function MenuEtiquetaSelect({ idRoles, value = [], onChange, disabled = false }) {
  const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idRoles) {
      setOpciones([]);
      return;
    }
    setLoading(true);
    listarOpciones(idRoles)
      .then((rows) => setOpciones(Array.isArray(rows) ? rows : []))
      .catch(() => setOpciones([]))
      .finally(() => setLoading(false));
  }, [idRoles]);

  const selected = opciones.filter((o) => value.includes(o.id_etiqueta));

  return (
    <Box sx={{ mt: 1, mb: 0.5 }}>
      <Autocomplete
        multiple
        disabled={disabled || !idRoles || loading}
        options={opciones}
        value={selected}
        onChange={(_, newVal) => onChange(newVal.map((v) => v.id_etiqueta))}
        getOptionLabel={(o) => o.nombre || ''}
        isOptionEqualToValue={(a, b) => a.id_etiqueta === b.id_etiqueta}
        filterSelectedOptions
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id_etiqueta}
              label={option.nombre}
              size="small"
              sx={{
                bgcolor: option.color || '#6366f1',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Etiquetas (opcional)"
            placeholder="Seleccione etiquetas recomendadas..."
            helperText="Organiza y filtra menús por rol. Puede elegir varias."
          />
        )}
      />
      {!idRoles && (
        <Typography variant="caption" color="text.secondary">
          Inicie sesión con un rol para asignar etiquetas.
        </Typography>
      )}
    </Box>
  );
}
