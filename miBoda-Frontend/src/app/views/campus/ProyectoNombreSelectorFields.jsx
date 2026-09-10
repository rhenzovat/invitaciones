import {
  Box, Typography, TextField, Stack, ToggleButton, ToggleButtonGroup, Autocomplete,
} from '@mui/material';

export default function ProyectoNombreSelector({
  modo, onModoChange, tipos, loadingTipos, tipoSel, onTipoChange,
  nombrePersonalizado, onNombrePersonalizadoChange,
}) {
  const resetAlCambiarModo = (nuevoModo) => {
    onModoChange(nuevoModo);
    onTipoChange(null);
    onNombrePersonalizadoChange('');
  };

  return (
    <Stack spacing={1}>
      <ToggleButtonGroup
        exclusive
        size="small"
        fullWidth
        value={modo}
        onChange={(_, v) => v && resetAlCambiarModo(v)}
      >
        <ToggleButton value="catalogo" sx={{ textTransform: 'none', fontSize: 12 }}>
          Del catálogo
        </ToggleButton>
        <ToggleButton value="personalizado" sx={{ textTransform: 'none', fontSize: 12 }}>
          Nombre personalizado
        </ToggleButton>
      </ToggleButtonGroup>

      {modo === 'catalogo' ? (
        <Autocomplete
          size="small"
          options={tipos}
          loading={loadingTipos}
          value={tipoSel}
          onChange={(_, v) => onTipoChange(v)}
          getOptionLabel={(o) => o?.titulo || ''}
          isOptionEqualToValue={(a, b) => a?.id_tipo === b?.id_tipo}
          noOptionsText="Sin tipos en catálogo"
          renderInput={(params) => (
            <TextField {...params} label="Tipo de proyecto *" placeholder="Seleccione del catálogo…" />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id_tipo}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{option.titulo}</Typography>
                {option.descripcion && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {option.descripcion}
                  </Typography>
                )}
              </Box>
            </li>
          )}
        />
      ) : (
        <>
          <TextField
            label="Nombre personalizado *"
            size="small"
            fullWidth
            value={nombrePersonalizado}
            onChange={(e) => onNombrePersonalizadoChange(e.target.value)}
            placeholder="Ej: Portal interno Jorge SPA"
          />
          <Typography variant="caption" color="text.secondary">
            Proyecto privado del cliente; no se agrega a la tabla de cotización.
          </Typography>
        </>
      )}
    </Stack>
  );
}
