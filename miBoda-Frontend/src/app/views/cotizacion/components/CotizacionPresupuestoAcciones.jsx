import { useState } from 'react';
import {
  IconButton, Tooltip, Stack, Menu, MenuItem, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';

const DOC_ITEMS = [
  { docType: 'cotizacion', label: 'Visualizar cotización', icon: DescriptionOutlinedIcon, color: '#004A99' },
  { docType: 'contrato', label: 'Visualizar contrato', icon: ArticleOutlinedIcon, color: '#0f766e' },
  { docType: 'proforma', label: 'Visualizar proforma', icon: RequestQuoteOutlinedIcon, color: '#1d4ed8' },
  { docType: 'recibo', label: 'Visualizar recibo', icon: ReceiptLongOutlinedIcon, color: '#7c3aed' },
];

export default function CotizacionPresupuestoAcciones({
  row, onPreview, onDelete, onQrManage, onEdit, onEditProforma, onEditContrato,
  onSendActividades,
}) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const handleOpenDoc = (docType) => {
    setAnchor(null);
    onPreview?.(row, docType);
  };

  return (
    <Stack direction="row" spacing={0.3} justifyContent="center" alignItems="center">
      <Tooltip title="Más opciones" arrow>
        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ color: '#64748b', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: '#004A99' } }}
          aria-label="Más opciones"
        >
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220, borderRadius: '10px', mt: 0.5 } } }}
      >
        {/* Editar cotización canvas */}
        <MenuItem
          onClick={() => { setAnchor(null); onEdit?.(row); }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <EditOutlinedIcon sx={{ fontSize: 18, color: '#004A99' }} />
          </ListItemIcon>
          <ListItemText
            primary="Editar cotización"
            secondary="Datos, estado y configuración"
            primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 700, color: '#004A99' }}
            secondaryTypographyProps={{ fontSize: '0.68rem' }}
          />
        </MenuItem>

        {/* Editar proforma canvas */}
        <MenuItem
          onClick={() => { setAnchor(null); onEditProforma?.(row); }}
          sx={{ py: 1, mb: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <BrushOutlinedIcon sx={{ fontSize: 18, color: '#1d4ed8' }} />
          </ListItemIcon>
          <ListItemText
            primary="Editar proforma"
            secondary="Canvas con lápiz editable"
            primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 700, color: '#1d4ed8' }}
            secondaryTypographyProps={{ fontSize: '0.68rem' }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => { setAnchor(null); onEditContrato?.(row); }}
          sx={{ py: 1, mb: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <ArticleOutlinedIcon sx={{ fontSize: 18, color: '#0f766e' }} />
          </ListItemIcon>
          <ListItemText
            primary="Editar contrato"
            secondary="Canvas editable del contrato"
            primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f766e' }}
            secondaryTypographyProps={{ fontSize: '0.68rem' }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => { setAnchor(null); onSendActividades?.(row); }}
          sx={{ py: 1, mb: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <EventNoteOutlinedIcon sx={{ fontSize: 18, color: '#0ea5e9' }} />
          </ListItemIcon>
          <ListItemText
            primary="Enviar hoja de actividades"
            secondary="Cronograma (PDF) por WhatsApp"
            primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 700, color: '#0284c7' }}
            secondaryTypographyProps={{ fontSize: '0.68rem' }}
          />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        {DOC_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <MenuItem key={item.docType} onClick={() => handleOpenDoc(item.docType)} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Icon sx={{ fontSize: 18, color: item.color }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary="Ver, descargar y WhatsApp"
                primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.68rem' }}
              />
            </MenuItem>
          );
        })}
        <MenuItem
          onClick={() => { setAnchor(null); onQrManage?.(row); }}
          sx={{ py: 1, borderTop: '1px solid #f1f5f9' }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <QrCode2Icon sx={{ fontSize: 18, color: '#0d9488' }} />
          </ListItemIcon>
          <ListItemText
            primary="Gestionar QR"
            secondary="Vigencia, renovar, revocar"
            primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: '0.68rem' }}
          />
        </MenuItem>
      </Menu>

      <Tooltip title="Eliminar" arrow>
        <IconButton
          size="small"
          onClick={() => onDelete?.(row.id_presupuesto)}
          sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
