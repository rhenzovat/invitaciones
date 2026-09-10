import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Button, Chip, Dialog, DialogContent,
  IconButton, Stack, TextField, Tooltip, Typography,
  InputAdornment, Fade,
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import LinkIcon from '@mui/icons-material/Link';
import NotesIcon from '@mui/icons-material/Notes';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import GridViewIcon from '@mui/icons-material/GridView';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  clienteNotasListar, clienteNotasCrear, clienteNotasActualizar, clienteNotasEliminar,
} from '../../api/campus.api';
import { toastSuccess, handleErrorMessages } from '../../components/notify-messages';
import { TINYMCE_API_KEY, getTinyMceInitNotes, TINYMCE_NOTE_PARAGRAPH_STYLE } from '../../components/cms/cmsTinyMceConfig';

// ── Colores sticky ────────────────────────────────────────────────────────────
const PALETTE = [
  { id: 'yellow', bg: '#fefce8', border: '#fbbf24', header: '#fef08a', text: '#78350f', label: 'Amarillo' },
  { id: 'blue',   bg: '#eff6ff', border: '#60a5fa', header: '#bfdbfe', text: '#1e3a8a', label: 'Azul' },
  { id: 'green',  bg: '#f0fdf4', border: '#4ade80', header: '#bbf7d0', text: '#14532d', label: 'Verde' },
  { id: 'pink',   bg: '#fdf2f8', border: '#f472b6', header: '#fbcfe8', text: '#831843', label: 'Rosa' },
  { id: 'purple', bg: '#faf5ff', border: '#c084fc', header: '#e9d5ff', text: '#581c87', label: 'Morado' },
  { id: 'orange', bg: '#fff7ed', border: '#fb923c', header: '#fed7aa', text: '#7c2d12', label: 'Naranja' },
  { id: 'slate',  bg: '#f8fafc', border: '#94a3b8', header: '#e2e8f0', text: '#1e293b', label: 'Pizarra' },
];

const TIPOS = [
  { value: 'nota',   label: 'Nota',   Icon: NotesIcon },
  { value: 'enlace', label: 'Enlace', Icon: LinkIcon },
  { value: 'video',  label: 'Video',  Icon: YouTubeIcon },
];

const EMPTY_FORM = {
  titulo: '', tipo: 'nota', contenido: '', url: '', colorId: 'yellow', fijado: false,
};

const NOTE_W = 280;
const NOTE_H_MIN = 180;

const youtubeId = (url) => {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const fmtFecha = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return ''; }
};

const getPalette = (colorId) => PALETTE.find(p => p.id === colorId) || PALETTE[0];

const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim();
};

const plainToHtml = (text) => {
  const lines = String(text || '').split('\n');
  if (!lines.some((l) => l.trim())) return '';
  return lines.map((l) => `<p>${l.trim() ? l.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '&nbsp;'}</p>`).join('');
};

// ── Posiciones (localStorage) ─────────────────────────────────────────────────
const posKey = (clienteId) => `notas_pos_${clienteId}`;

const loadPositions = (clienteId) => {
  try { return JSON.parse(localStorage.getItem(posKey(clienteId)) || '{}'); }
  catch { return {}; }
};

const savePositions = (clienteId, pos) => {
  try { localStorage.setItem(posKey(clienteId), JSON.stringify(pos)); }
  catch {}
};

// Auto-grid para notas sin posición
const autoPos = (index) => ({
  x: 30 + (index % 4) * (NOTE_W + 20),
  y: 20 + Math.floor(index / 4) * 220,
});

// ── Nota canvas card ──────────────────────────────────────────────────────────
function NotaCard({ nota, pos, onDragStart, onEdit, onDelete, onPin, onQuickSave, quickSaving, busqueda }) {
  const pal = getPalette(nota.colorId || nota.color);
  const yt = nota.tipo === 'video' ? youtubeId(nota.url) : null;
  const TipoIcon = TIPOS.find(t => t.value === nota.tipo)?.Icon || NotesIcon;
  const [quickEdit, setQuickEdit] = useState(false);
  const [draft, setDraft] = useState({ titulo: '', contenido: '' });
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!quickEdit) return;
    const t = setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 40);
    return () => clearTimeout(t);
  }, [quickEdit]);

  const startQuickEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDraft({
      titulo: nota.titulo || '',
      contenido: stripHtml(nota.contenido),
    });
    setQuickEdit(true);
  };

  const cancelQuickEdit = () => setQuickEdit(false);

  const saveQuickEdit = async () => {
    if (!onQuickSave || quickSaving) return;
    const ok = await onQuickSave(nota, draft);
    if (ok) setQuickEdit(false);
  };

  const handleQuickKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelQuickEdit();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveQuickEdit();
    }
  };

  const match = (txt) => {
    if (!busqueda || !txt) return txt;
    const q = busqueda.trim();
    const idx = txt.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return txt;
    return (
      <>
        {txt.slice(0, idx)}
        <mark style={{ background: '#fbbf24', borderRadius: 2, padding: '0 2px' }}>
          {txt.slice(idx, idx + q.length)}
        </mark>
        {txt.slice(idx + q.length)}
      </>
    );
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: pos.x, top: pos.y,
        width: NOTE_W, minHeight: NOTE_H_MIN,
        borderRadius: '12px',
        border: `2px solid ${pal.border}`,
        bgcolor: pal.bg,
        boxShadow: nota.fijado
          ? `0 0 0 2.5px #f59e0b, 0 8px 28px rgba(0,0,0,0.18)`
          : '0 4px 18px rgba(0,0,0,0.13)',
        display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.2s',
        zIndex: quickEdit ? 30 : (nota.fijado ? 10 : 1),
        '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.22)', zIndex: quickEdit ? 30 : 20 },
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* Header arrastrable */}
      <Box
        onMouseDown={(e) => onDragStart(e, nota.id_nota)}
        sx={{
          bgcolor: pal.header,
          borderRadius: '10px 10px 0 0',
          px: 1.2, py: 0.7,
          display: 'flex', alignItems: 'center', gap: 0.5,
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          borderBottom: `1px solid ${pal.border}`,
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: 15, color: pal.text, opacity: 0.45 }} />
        <TipoIcon sx={{ fontSize: 14, color: pal.text, opacity: 0.7 }} />
        <Typography sx={{ flex: 1, fontSize: '0.75rem', fontWeight: 800, color: pal.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {match(nota.titulo)}
        </Typography>
        {nota.fijado && <PushPinIcon sx={{ fontSize: 13, color: '#f59e0b' }} />}
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => onEdit(nota)} onMouseDown={e => e.stopPropagation()}
            sx={{ p: 0.3, color: pal.text, opacity: 0.6, '&:hover': { opacity: 1, bgcolor: `${pal.border}44` } }}>
            <EditIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={nota.fijado ? 'Desfijar' : 'Fijar'}>
          <IconButton size="small" onClick={() => onPin(nota)} onMouseDown={e => e.stopPropagation()}
            sx={{ p: 0.3, color: nota.fijado ? '#f59e0b' : pal.text, opacity: 0.6, '&:hover': { opacity: 1 } }}>
            <PushPinIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton size="small" onClick={() => onDelete(nota)} onMouseDown={e => e.stopPropagation()}
            sx={{ p: 0.3, color: '#ef4444', opacity: 0.5, '&:hover': { opacity: 1 } }}>
            <DeleteIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Body — doble clic para edición rápida */}
      <Box
        onDoubleClick={startQuickEdit}
        sx={{
          p: 1.4, flex: 1, overflow: quickEdit ? 'auto' : 'hidden',
          cursor: quickEdit ? 'text' : 'pointer',
          userSelect: quickEdit ? 'text' : 'none',
          '&:hover .quick-edit-hint': { opacity: quickEdit ? 0 : 0.55 },
        }}
      >
        {quickEdit ? (
          <Stack spacing={0.8} onKeyDown={handleQuickKeyDown}>
            <TextField
              size="small"
              fullWidth
              value={draft.titulo}
              onChange={(e) => setDraft((d) => ({ ...d, titulo: e.target.value }))}
              placeholder="Título"
              sx={{
                '& .MuiInputBase-root': { bgcolor: '#fff', fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: pal.border },
              }}
            />
            <TextField
              inputRef={textareaRef}
              multiline
              minRows={4}
              maxRows={10}
              fullWidth
              value={draft.contenido}
              onChange={(e) => setDraft((d) => ({ ...d, contenido: e.target.value }))}
              placeholder="Escribe el contenido..."
              sx={{
                '& .MuiInputBase-root': { bgcolor: '#fff', fontSize: '0.72rem', lineHeight: 1.55, borderRadius: '6px', alignItems: 'flex-start' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: pal.border },
              }}
            />
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <Button size="small" onClick={cancelQuickEdit} disabled={quickSaving}
                sx={{ textTransform: 'none', fontSize: '0.65rem', color: pal.text, minWidth: 0, px: 1 }}>
                Cancelar
              </Button>
              <Button size="small" variant="contained" onClick={saveQuickEdit} disabled={quickSaving || !draft.titulo.trim()}
                startIcon={quickSaving ? null : <SaveIcon sx={{ fontSize: 12 }} />}
                sx={{ textTransform: 'none', fontSize: '0.65rem', fontWeight: 700, bgcolor: pal.border, minWidth: 0, px: 1.2,
                  '&:hover': { bgcolor: pal.text } }}>
                {quickSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </Stack>
            <Typography sx={{ fontSize: '0.58rem', color: pal.text, opacity: 0.45, textAlign: 'right' }}>
              Ctrl+Enter guardar · Esc cancelar
            </Typography>
          </Stack>
        ) : (
          <>
        {nota.tipo === 'video' && yt ? (
          <Box sx={{ borderRadius: '6px', overflow: 'hidden', aspectRatio: '16/9', bgcolor: '#000', mb: 1 }}>
            <iframe title="yt" width="100%" height="100%"
              src={`https://www.youtube.com/embed/${yt}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen style={{ border: 0 }} />
          </Box>
        ) : null}

        {nota.tipo === 'enlace' && nota.url ? (
          <Button size="small" href={nota.url} target="_blank" rel="noopener noreferrer"
            startIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{ mb: 0.8, textTransform: 'none', fontSize: '0.72rem',
              color: pal.text, borderColor: pal.border, py: 0.3 }}
            variant="outlined">
            Abrir enlace
          </Button>
        ) : null}

        {nota.contenido ? (
          <Box sx={{
            fontSize: '0.72rem', color: pal.text, lineHeight: 1.6,
            maxHeight: 120, overflow: 'hidden',
            '& p': { margin: 0 }, '& strong': { fontWeight: 700 },
            '& em': { fontStyle: 'italic' }, '& ul,& ol': { pl: 2 },
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 4, display: 'block', my: 0.5 },
          }}
            dangerouslySetInnerHTML={{ __html: nota.contenido }}
          />
        ) : (
          <Typography className="quick-edit-hint" sx={{ fontSize: '0.68rem', color: pal.text, opacity: 0.35, fontStyle: 'italic' }}>
            Doble clic para escribir...
          </Typography>
        )}

        <Typography className="quick-edit-hint" sx={{ fontSize: '0.58rem', color: pal.text, opacity: 0, mt: 0.5, transition: 'opacity 0.2s' }}>
          Doble clic para editar
        </Typography>

        <Typography sx={{ fontSize: '0.62rem', color: pal.text, opacity: 0.45, mt: 1 }}>
          {nota.autor ? `${nota.autor} · ` : ''}{fmtFecha(nota.updated_at || nota.created_at)}
        </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

// ── Dialog editor (TinyMCE) — Responsive ─────────────────────────────────────
function NotaEditor({ open, onClose, editId, form, setForm, onSave, saving }) {
  const editorRef = useRef(null);
  const pal = getPalette(form.colorId);
  const tinymceOk = Boolean(TINYMCE_API_KEY);

  const flushContenido = useCallback(() => {
    if (tinymceOk && editorRef.current) {
      try {
        editorRef.current.save();
        return editorRef.current.getContent();
      } catch {
        return form.contenido;
      }
    }
    return form.contenido;
  }, [form.contenido, tinymceOk]);

  const handleSave = useCallback(() => {
    if (saving || !form.titulo.trim()) return;
    onSave(flushContenido());
  }, [flushContenido, form.titulo, onSave, saving]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleSave]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      disableEnforceFocus disableAutoFocus
      PaperProps={{ sx: {
        borderRadius: '16px',
        border: `2px solid ${pal.border}`,
        bgcolor: pal.bg,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        m: { xs: 1, sm: 2 },
      }}}>

      {/* ── HEADER COMPACTO: título + tipo + color + fijar ── */}
      <Box sx={{
        bgcolor: pal.header, flexShrink: 0,
        borderBottom: `1px solid ${pal.border}`,
        borderRadius: '14px 14px 0 0',
      }}>
        {/* Fila 1: ícono + título nota + cerrar */}
        <Box sx={{ px: 2, pt: 1.5, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotesIcon sx={{ fontSize: 17, color: pal.text, flexShrink: 0 }} />
          <TextField
            size="small" fullWidth required
            placeholder="Título de la nota *"
            value={form.titulo}
            onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            sx={{
              '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.7)', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: 700 },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: pal.border },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: pal.text },
            }} />
          <IconButton size="small" onClick={onClose} sx={{ color: pal.text, flexShrink: 0 }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Fila 2: Tipo | Color | Fijar */}
        <Box sx={{ px: 2, pb: 1.2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Tipo */}
          <Stack direction="row" spacing={0.5}>
            {TIPOS.map(({ value, label, Icon }) => (
              <Button key={value} size="small" variant={form.tipo === value ? 'contained' : 'outlined'}
                startIcon={<Icon sx={{ fontSize: 13 }} />}
                onClick={() => setForm(f => ({ ...f, tipo: value }))}
                sx={{ textTransform: 'none', fontSize: '0.72rem', borderRadius: '7px', py: 0.3, px: 1,
                  minWidth: 0,
                  ...(form.tipo === value
                    ? { bgcolor: pal.border, color: '#fff', '&:hover': { bgcolor: pal.text } }
                    : { borderColor: `${pal.border}80`, color: pal.text, bgcolor: 'rgba(255,255,255,0.5)' }) }}>
                {label}
              </Button>
            ))}
          </Stack>

          {/* Separador */}
          <Box sx={{ height: 20, width: 1, bgcolor: `${pal.border}60`, flexShrink: 0 }} />

          {/* Paleta colores */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            {PALETTE.map(p => (
              <Tooltip key={p.id} title={p.label} placement="top">
                <Box onClick={() => setForm(f => ({ ...f, colorId: p.id }))}
                  sx={{
                    width: 20, height: 20, borderRadius: '50%', bgcolor: p.header,
                    border: form.colorId === p.id ? `2.5px solid ${p.border}` : `1.5px solid ${p.border}55`,
                    cursor: 'pointer',
                    boxShadow: form.colorId === p.id ? `0 0 0 1.5px #fff, 0 0 0 3px ${p.border}` : 'none',
                    transition: 'all 0.12s',
                    '&:hover': { transform: 'scale(1.25)' },
                  }} />
              </Tooltip>
            ))}
          </Stack>

          {/* Separador */}
          <Box sx={{ height: 20, width: 1, bgcolor: `${pal.border}60`, flexShrink: 0 }} />

          {/* Fijar */}
          <Tooltip title={form.fijado ? 'Desfijar' : 'Fijar nota arriba'} placement="top">
            <Box onClick={() => setForm(f => ({ ...f, fijado: !f.fijado }))}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
                px: 1, py: 0.3, borderRadius: '7px',
                bgcolor: form.fijado ? '#fef08a' : 'rgba(255,255,255,0.5)',
                border: `1.5px solid ${form.fijado ? '#fbbf24' : `${pal.border}60`}`,
                transition: 'all 0.15s',
              }}>
              <PushPinIcon sx={{ fontSize: 14, color: form.fijado ? '#f59e0b' : pal.text }} />
              <Typography sx={{ fontSize: '0.68rem', color: form.fijado ? '#92400e' : pal.text,
                fontWeight: form.fijado ? 700 : 400, whiteSpace: 'nowrap' }}>
                {form.fijado ? 'Fijada' : 'Fijar'}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* ── BODY SCROLLABLE ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5, minHeight: 0 }}>

        {/* URL (solo si Enlace o Video) */}
        {(form.tipo === 'enlace' || form.tipo === 'video') && (
          <TextField fullWidth size="small"
            label={form.tipo === 'video' ? 'URL de YouTube' : 'URL del enlace'}
            placeholder="https://..." value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            sx={{ mb: 1.5,
              '& .MuiInputBase-root': { bgcolor: '#fff', borderRadius: '8px' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: pal.border },
            }} />
        )}

        {/* Editor */}
        <Box sx={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${pal.border}`, bgcolor: '#fff',
          '& .tox-tinymce': { border: 'none !important' } }}>
          {tinymceOk ? (
            <Editor
              key={`nota-editor-${editId ?? 'new'}-${open}`}
              apiKey={TINYMCE_API_KEY}
              onInit={(_evt, editor) => { editorRef.current = editor; }}
              value={form.contenido}
              onEditorChange={(content) => setForm(f => ({ ...f, contenido: content }))}
              init={{
                ...getTinyMceInitNotes(260),
                content_style: `body { font-family: Inter, Arial, sans-serif; font-size: 14px;
                  line-height: 1.45; color: ${pal.text}; background: #fff; margin: 10px; }
                  ${TINYMCE_NOTE_PARAGRAPH_STYLE}
                  img { max-width: 100%; height: auto; border-radius: 6px; }`,
                link_default_target: '_blank',
              }}
            />
          ) : (
            <TextField
              fullWidth multiline minRows={8} maxRows={16}
              value={form.contenido}
              onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
              placeholder="Escribe aquí el contenido de la nota..."
              sx={{
                '& .MuiInputBase-root': { bgcolor: '#fff', fontSize: '0.9rem', lineHeight: 1.6, alignItems: 'flex-start' },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
            />
          )}
        </Box>
        <Typography sx={{ fontSize: '0.63rem', color: pal.text, mt: 0.6, opacity: 0.55 }}>
          {tinymceOk
            ? 'Pega imágenes con Ctrl+V o arrástralas al editor. Máximo 2 MB por imagen.'
            : 'Editor enriquecido no disponible (falta VITE_TINYMCE_API_KEY).'}
        </Typography>
      </Box>

      {/* ── FOOTER FIJO: Cancelar + Guardar ── */}
      <Box sx={{
        flexShrink: 0, px: 2, py: 1.2,
        borderTop: `1px solid ${pal.border}`,
        bgcolor: pal.header,
        borderRadius: '0 0 14px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
      }}>
        <Typography sx={{ fontSize: '0.65rem', color: pal.text, opacity: 0.6 }}>
          Ctrl+Enter para guardar rápido
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} size="small"
            sx={{ textTransform: 'none', color: pal.text, borderRadius: '8px',
              fontSize: '0.8rem', border: `1px solid ${pal.border}60`,
              '&:hover': { bgcolor: `${pal.border}20` } }}>
            Cancelar
          </Button>
          <Button variant="contained" size="small"
            startIcon={saving ? null : <SaveIcon sx={{ fontSize: 15 }} />}
            onClick={handleSave} disabled={saving || !form.titulo.trim()}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px',
              fontSize: '0.82rem', px: 2,
              bgcolor: pal.border,
              boxShadow: `0 2px 8px ${pal.border}60`,
              '&:hover': { bgcolor: pal.text, boxShadow: `0 4px 12px ${pal.border}80` },
              '&.Mui-disabled': { bgcolor: `${pal.border}50`, color: '#fff' } }}>
            {saving ? 'Guardando...' : editId ? 'Actualizar nota' : 'Crear nota'}
          </Button>
        </Stack>
      </Box>

    </Dialog>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ClienteNotasDialog({ open, onClose, cliente }) {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [quickSavingId, setQuickSavingId] = useState(null);
  const [positions, setPositions] = useState({});

  // Drag state
  const dragging = useRef(null); // { id, startX, startY, origX, origY }
  const canvasRef = useRef(null);

  const tituloCliente = cliente?.nombre_completo || cliente?.nombre || cliente?.empresa || 'Cliente';
  const clienteId = cliente?.id_cliente;

  const load = useCallback(async () => {
    if (!clienteId) return;
    setLoading(true);
    try {
      const rows = await clienteNotasListar({ id_cliente: clienteId });
      setNotas(rows || []);
    } catch (e) {
      handleErrorMessages('No se pudieron cargar las notas', e);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    if (open && clienteId) {
      setBusqueda('');
      load();
      setPositions(loadPositions(clienteId));
    }
  }, [open, clienteId, load]);

  // Calcular posición efectiva de cada nota
  const getPosFor = (nota, index) => {
    const stored = positions[nota.id_nota];
    return stored || autoPos(index);
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e, id) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect() || { left: 0, top: 0 };
    const pos = positions[id] || autoPos(notas.findIndex(n => n.id_nota === id));
    dragging.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      rect,
    };
  }, [positions, notas]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const { id, startX, startY, origX, origY } = dragging.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newX = Math.max(0, origX + dx);
      const newY = Math.max(0, origY + dy);
      setPositions(prev => {
        const next = { ...prev, [id]: { x: newX, y: newY } };
        return next;
      });
    };

    const onUp = () => {
      if (!dragging.current) return;
      // Persist to localStorage
      setPositions(prev => {
        savePositions(clienteId, prev);
        return prev;
      });
      dragging.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [clienteId]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const openNueva = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setEditOpen(true);
  };

  const openEditar = (n) => {
    setEditId(n.id_nota);
    setForm({
      titulo:   n.titulo    || '',
      tipo:     n.tipo      || 'nota',
      contenido: n.contenido || '',
      url:      n.url       || '',
      colorId:  n.colorId   || (PALETTE.find(p => p.border === n.color)?.id) || 'yellow',
      fijado:   !!n.fijado,
    });
    setEditOpen(true);
  };

  const guardarRapido = async (n, { titulo, contenido }) => {
    if (!titulo.trim()) return false;
    setQuickSavingId(n.id_nota);
    try {
      const colorId = n.colorId || PALETTE.find((p) => p.border === n.color)?.id || 'yellow';
      const pal = getPalette(colorId);
      await clienteNotasActualizar({
        id_nota: n.id_nota,
        id_cliente: clienteId,
        titulo: titulo.trim(),
        tipo: n.tipo || 'nota',
        contenido: plainToHtml(contenido),
        url: n.url || null,
        color: n.color || pal.border,
        fijado: !!n.fijado,
      });
      toastSuccess('Nota actualizada');
      load();
      return true;
    } catch (e) {
      handleErrorMessages('Error al guardar la nota', e);
      return false;
    } finally {
      setQuickSavingId(null);
    }
  };

  const guardar = async (contenidoOverride) => {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      const pal = getPalette(form.colorId);
      const contenido = contenidoOverride ?? form.contenido;
      const payload = {
        id_cliente: clienteId,
        titulo:     form.titulo.trim(),
        tipo:       form.tipo,
        contenido,
        url:        form.url || null,
        color:      pal.border,
        colorId:    form.colorId,
        fijado:     form.fijado,
      };
      if (editId) {
        await clienteNotasActualizar({ id_nota: editId, ...payload });
        toastSuccess('Nota actualizada');
      } else {
        await clienteNotasCrear(payload);
        toastSuccess('Nota creada');
      }
      setEditOpen(false);
      load();
    } catch (e) {
      handleErrorMessages('Error al guardar la nota', e);
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (n) => {
    if (!window.confirm(`¿Eliminar la nota "${n.titulo}"?`)) return;
    try {
      await clienteNotasEliminar({ id_nota: n.id_nota });
      toastSuccess('Nota eliminada');
      setPositions(prev => {
        const next = { ...prev };
        delete next[n.id_nota];
        savePositions(clienteId, next);
        return next;
      });
      load();
    } catch (e) {
      handleErrorMessages('No se pudo eliminar', e);
    }
  };

  const togglePin = async (n) => {
    try {
      await clienteNotasActualizar({ id_nota: n.id_nota, id_cliente: clienteId, fijado: !n.fijado });
      load();
    } catch {}
  };

  // Re-ordenar en grid
  const reordenar = () => {
    const sorted = [...notas].sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0));
    const next = {};
    sorted.forEach((n, i) => { next[n.id_nota] = autoPos(i); });
    setPositions(next);
    savePositions(clienteId, next);
  };

  // Filtradas (solo para búsqueda visual — todas se muestran en el canvas)
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return notas;
    return notas.filter(n =>
      [n.titulo, n.contenido, n.url, n.tipo].some(v => String(v || '').toLowerCase().includes(q))
    );
  }, [notas, busqueda]);

  // Canvas height: enough to contain all notes
  const canvasH = useMemo(() => {
    if (filtradas.length === 0) return 400;
    const maxY = Math.max(...filtradas.map((n, i) => getPosFor(n, i).y + 250));
    return Math.max(450, maxY + 40);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtradas, positions]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth={false} fullScreen
        PaperProps={{ sx: { bgcolor: '#f1f5f9', borderRadius: 0 } }}>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <Box sx={{
          bgcolor: '#0f172a', px: 3, py: 1.2,
          display: 'flex', alignItems: 'center', gap: 1.5,
          borderBottom: '1px solid #1e293b', flexShrink: 0,
        }}>
          <NotesIcon sx={{ color: '#60a5fa', fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
              Notas del cliente
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
              {tituloCliente} · {notas.length} nota{notas.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Búsqueda */}
          <TextField size="small" placeholder="Buscar notas..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#64748b' }} /></InputAdornment>,
            }}
            sx={{
              width: 240,
              '& .MuiInputBase-root': { bgcolor: '#1e293b', color: '#f1f5f9', borderRadius: '10px', fontSize: '0.8rem' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
              '& input::placeholder': { color: '#64748b', opacity: 1 },
            }}
          />

          <Tooltip title="Reorganizar en cuadrícula">
            <IconButton onClick={reordenar} sx={{ color: '#94a3b8', '&:hover': { color: '#60a5fa' } }}>
              <GridViewIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Button variant="contained" startIcon={<AddIcon />} onClick={openNueva}
            sx={{ bgcolor: '#4d9ef6', borderRadius: '10px', textTransform: 'none',
              fontWeight: 700, fontSize: '0.8rem', px: 2,
              boxShadow: '0 4px 14px rgba(77,158,246,0.4)',
              '&:hover': { bgcolor: '#3b82f6' } }}>
            Nueva nota
          </Button>

          <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ── Canvas ───────────────────────────────────────────────────────── */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>Cargando notas...</Typography>
            </Box>
          ) : filtradas.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: 400, gap: 1.5 }}>
              <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0',
                textAlign: 'center', maxWidth: 320 }}>
                <NotesIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {busqueda ? 'Sin resultados para la búsqueda.' : 'Aún no hay notas.'}
                </Typography>
                {!busqueda && (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={openNueva} size="small"
                    sx={{ mt: 1.5, borderRadius: '10px', textTransform: 'none',
                      bgcolor: '#4d9ef6', '&:hover': { bgcolor: '#3b82f6' } }}>
                    Crear primera nota
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            /* Canvas libre */
            <Box
              ref={canvasRef}
              sx={{
                position: 'relative',
                width: '100%',
                minWidth: 800,
                height: canvasH,
                backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
                backgroundSize: '28px 28px',
              }}
            >
              {filtradas.map((nota, i) => (
                <Fade key={nota.id_nota} in timeout={300 + i * 50}>
                  <Box>
                    <NotaCard
                      nota={nota}
                      pos={getPosFor(nota, i)}
                      onDragStart={handleDragStart}
                      onEdit={openEditar}
                      onDelete={eliminar}
                      onPin={togglePin}
                      onQuickSave={guardarRapido}
                      quickSaving={quickSavingId === nota.id_nota}
                      busqueda={busqueda}
                    />
                  </Box>
                </Fade>
              ))}
            </Box>
          )}
        </Box>

        {/* ── Status bar ───────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: '#0f172a', px: 3, py: 0.8, display: 'flex', alignItems: 'center', gap: 2,
          borderTop: '1px solid #1e293b', flexShrink: 0 }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#475569' }}>
            {filtradas.length} de {notas.length} notas · Arrastra para mover · Doble clic en la nota para editar
          </Typography>
          <Box sx={{ flex: 1 }} />
          {PALETTE.map(p => (
            <Box key={p.id} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: p.header,
              border: `1px solid ${p.border}` }} />
          ))}
        </Box>
      </Dialog>

      {/* ── Editor TinyMCE ─────────────────────────────────────────────────── */}
      <NotaEditor
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editId={editId}
        form={form}
        setForm={setForm}
        onSave={guardar}
        saving={saving}
      />
    </>
  );
}
