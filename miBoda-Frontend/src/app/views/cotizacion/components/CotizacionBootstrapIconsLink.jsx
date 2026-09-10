import { Link } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

/** Catálogo oficial (clases bi-* usadas en el cotizador). */
export const BOOTSTRAP_ICONS_CATALOG_URL = 'https://icons.getbootstrap.com/';

export default function CotizacionBootstrapIconsLink() {
  return (
    <Link
      href={BOOTSTRAP_ICONS_CATALOG_URL}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.35,
        fontSize: '0.62rem',
        color: '#60a5fa',
        flexShrink: 0,
        '&:hover': { color: '#f97316' },
      }}
    >
      Buscar iconos en Bootstrap Icons
      <OpenInNewIcon sx={{ fontSize: 12 }} />
    </Link>
  );
}
