import Box from '@mui/material/Box';
import { parseCotizacionIcon } from 'app/utils/cotizacionIcon';

/** Ícono Bootstrap Icons o emoji, centrado. */
export function CotizacionIcon({ icon, fontSize = '1.35rem', color = 'inherit', sx = {} }) {
  const parsed = parseCotizacionIcon(icon);

  if (parsed.kind === 'bi') {
    return (
      <Box
        component="i"
        className={parsed.className}
        aria-hidden
        sx={{
          fontSize,
          lineHeight: 1,
          color,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1em',
          height: '1em',
          ...sx,
        }}
      />
    );
  }

  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        fontSize,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      {parsed.value}
    </Box>
  );
}

/** Cuadro azul con ícono (vista catálogo admin / preview). */
export function CotizacionIconBox({
  icon,
  size = 52,
  fontSize = '1.35rem',
  bgcolor = '#004A99',
  sx = {},
}) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '12px',
        bgcolor,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 14px rgba(0,74,153,0.28)',
        ...sx,
      }}
    >
      <CotizacionIcon icon={icon} fontSize={fontSize} color="#fff" />
    </Box>
  );
}

export default CotizacionIcon;
