import { Box } from '@mui/material';
import CotizacionBootstrapIconsLink from './CotizacionBootstrapIconsLink';

/**
 * Campo de ícono CMS con enlace al catálogo Bootstrap Icons (bi-*).
 * @param {React.ComponentType} Field - TextField estilizado del panel (DarkField)
 */
export default function CotizacionCmsIconField({
  Field,
  label,
  fieldKey,
  value,
  onChange,
  placeholder = 'bi-cart3',
}) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
        <CotizacionBootstrapIconsLink />
      </Box>
      <Field
        size="small"
        fullWidth
        label={label}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        helperText='Ej. bi-whatsapp o solo "whatsapp" (se guarda como bi-whatsapp)'
        FormHelperTextProps={{ sx: { color: '#64748b', fontSize: '0.62rem', mt: 0.5 } }}
        sx={{ mb: 0 }}
      />
    </Box>
  );
}
