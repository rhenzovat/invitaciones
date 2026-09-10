import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Tooltip,
  Typography, List, ListItemButton, ListItemText, Divider, Menu, MenuItem, TextField,
  ToggleButton, ToggleButtonGroup, CircularProgress, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import FolderIcon from '@mui/icons-material/Folder';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import {
  clienteCodigoListar, clienteCodigoCrear, clienteCodigoActualizar, clienteCodigoEliminar,
} from '../../api/campus.api';
import { toastSuccess, handleErrorMessages } from '../../components/notify-messages';

const CM_VER = '5.65.18';
const CM_BASE = `https://cdn.jsdelivr.net/npm/codemirror@${CM_VER}`;

const PLANTILLAS = [
  { nombre: 'index.html', contenido: '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8" />\n  <title>Preview</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n  <h1>Hola cliente</h1>\n  <script src="script.js"></script>\n</body>\n</html>\n' },
  { nombre: 'style.css', contenido: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n  background: #f5f5f5;\n}\nh1 { color: #1976d2; }\n' },
  { nombre: 'script.js', contenido: "console.log('Campus editor');\n" },
];

const EXT_OPTS = [
  { ext: '.html', label: 'HTML' },
  { ext: '.css', label: 'CSS' },
  { ext: '.js', label: 'JavaScript' },
  { ext: '.json', label: 'JSON' },
  { ext: '.md', label: 'Markdown' },
  { ext: '.php', label: 'PHP' },
  { ext: '.ts', label: 'TypeScript' },
  { ext: '.txt', label: 'Texto' },
];

let cmLoaderPromise = null;

function loadStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

function loadScript(src) {
  if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadCodeMirror() {
  if (window.CodeMirror) return Promise.resolve(window.CodeMirror);
  if (cmLoaderPromise) return cmLoaderPromise;

  cmLoaderPromise = (async () => {
    await loadStylesheet(`${CM_BASE}/lib/codemirror.css`);
    await loadStylesheet(`${CM_BASE}/theme/material-darker.css`);
    await loadScript(`${CM_BASE}/lib/codemirror.js`);
    await loadScript(`${CM_BASE}/mode/xml/xml.js`);
    await loadScript(`${CM_BASE}/mode/css/css.js`);
    await loadScript(`${CM_BASE}/mode/javascript/javascript.js`);
    await loadScript(`${CM_BASE}/mode/htmlmixed/htmlmixed.js`);
    await loadScript(`${CM_BASE}/mode/markdown/markdown.js`);
    await loadScript(`${CM_BASE}/mode/php/php.js`);
    return window.CodeMirror;
  })();

  return cmLoaderPromise;
}

const modeForFile = (nombre, lenguaje) => {
  const ext = (nombre || '').split('.').pop()?.toLowerCase();
  const lang = (lenguaje || '').toLowerCase();
  if (lang === 'css' || ext === 'css' || ext === 'scss') return 'css';
  if (lang === 'javascript' || ext === 'js' || ext === 'mjs') return 'javascript';
  if (ext === 'json' || lang === 'json') return { name: 'javascript', json: true };
  if (ext === 'md' || lang === 'markdown') return 'markdown';
  if (ext === 'php' || lang === 'php') return 'php';
  if (ext === 'html' || ext === 'htm' || lang === 'html') return 'htmlmixed';
  return 'htmlmixed';
};

const buildPreviewDoc = (archivos) => {
  const byName = {};
  (archivos || []).forEach((a) => { byName[a.nombre.toLowerCase()] = a.contenido || ''; });

  const html = byName['index.html'] || byName['preview.html'] || byName['archivo.html'] || '<p>Sin HTML</p>';
  const css = byName['style.css'] || '';
  const js = byName['script.js'] || byName['main.js'] || '';

  const styleTag = css ? `<style>${css}</style>` : '';
  const hasScriptTag = /<script[\s>]/i.test(html);
  const scriptTag = js && !hasScriptTag ? `<script>${js}<\/script>` : '';

  if (/<html[\s>]/i.test(html)) {
    let doc = html;
    if (css && !/<style/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `${styleTag}</head>`);
    }
    if (js && !/<script/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `${scriptTag}</body>`);
    }
    return doc;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>${styleTag}</head><body>${html}${scriptTag}</body></html>`;
};

/** Espera a que el contenedor del editor tenga dimensiones reales (post-render / animación del Dialog). */
function waitForEditorContainer(getEl, maxAttempts = 40) {
  return new Promise((resolve) => {
    let attempts = 0;
    const tick = () => {
      const el = getEl();
      if (el && el.clientHeight > 0 && el.clientWidth > 0) {
        resolve(el);
        return;
      }
      attempts += 1;
      if (attempts >= maxAttempts) {
        resolve(el || null);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function scheduleEditorRefresh(refreshFn) {
  requestAnimationFrame(refreshFn);
  requestAnimationFrame(() => requestAnimationFrame(refreshFn));
  [0, 50, 150, 350].forEach((ms) => setTimeout(refreshFn, ms));
}

export default function ClienteCodeEditorDialog({ open, onClose, cliente }) {
  const containerRef = useRef(null);
  const cmRef = useRef(null);
  const skipChangeRef = useRef(false);
  const guardarRef = useRef(() => {});
  const activoIdRef = useRef(null);

  const [archivos, setArchivos] = useState([]);
  const [activoId, setActivoId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editorBootstrapping, setEditorBootstrapping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorOk, setEditorOk] = useState(false);
  const [editorError, setEditorError] = useState('');
  const [vista, setVista] = useState('editor');
  const [previewHtml, setPreviewHtml] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('archivo.html');
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const [ctxMenu, setCtxMenu] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameNombre, setRenameNombre] = useState('');
  const [renaming, setRenaming] = useState(false);

  const tituloCliente = cliente?.nombre_completo || cliente?.nombre || cliente?.empresa || 'Cliente';
  const activo = archivos.find((a) => Number(a.id_archivo) === Number(activoId));

  useEffect(() => {
    activoIdRef.current = activoId;
  }, [activoId]);

  const patchContenidoActivo = useCallback((val) => {
    const id = activoIdRef.current;
    if (id == null) return;
    setArchivos((prev) => prev.map((a) => (
      Number(a.id_archivo) === Number(id) ? { ...a, contenido: val } : a
    )));
  }, []);

  const destroyCm = () => {
    if (!cmRef.current) return;
    try {
      cmRef.current.getWrapperElement()?.remove();
    } catch {
      /* ignore */
    }
    cmRef.current = null;
    if (containerRef.current) containerRef.current.innerHTML = '';
  };

  const refreshCmSize = useCallback(() => {
    const cm = cmRef.current;
    if (!cm || !containerRef.current) return;
    const h = containerRef.current.clientHeight;
    const w = containerRef.current.clientWidth;
    if (h > 0 && w > 0) cm.setSize(w, h);
    cm.refresh();
  }, []);

  const setCmValue = useCallback((value, nombre, lenguaje) => {
    const cm = cmRef.current;
    if (!cm) {
      setFallbackText(value || '');
      return;
    }
    skipChangeRef.current = true;
    cm.setValue(value || '');
    cm.setOption('mode', modeForFile(nombre, lenguaje));
    skipChangeRef.current = false;
    setDirty(false);
    scheduleEditorRefresh(refreshCmSize);
  }, [refreshCmSize]);

  const initEditor = useCallback(async (archivo) => {
    if (!containerRef.current || !archivo) return;
    setEditorBootstrapping(true);
    setEditorError('');

    try {
      const CodeMirror = await loadCodeMirror();
      if (!containerRef.current) return;

      destroyCm();

      const cm = CodeMirror(containerRef.current, {
        value: archivo.contenido || '',
        mode: modeForFile(archivo.nombre, archivo.lenguaje),
        theme: 'material-darker',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        indentWithTabs: false,
        autofocus: true,
        extraKeys: {
          'Ctrl-S': () => { guardarRef.current(); },
          'Cmd-S': () => { guardarRef.current(); },
          Tab: (c) => {
            if (c.somethingSelected()) {
              c.indentSelection('add');
            } else {
              c.replaceSelection('  ', 'end');
            }
          },
        },
      });

      const host = containerRef.current;
      if (host) {
        const h = host.clientHeight;
        const w = host.clientWidth;
        if (h > 0 && w > 0) cm.setSize(w, h);
      }

      cm.on('change', () => {
        if (skipChangeRef.current) return;
        setDirty(true);
        patchContenidoActivo(cm.getValue());
      });

      cmRef.current = cm;
      setEditorOk(true);
      setFallbackText('');

      scheduleEditorRefresh(refreshCmSize);
      cm.focus();
    } catch (e) {
      console.error(e);
      setEditorError('No se pudo cargar el editor. Usa el área de texto inferior.');
      setFallbackText(archivo.contenido || '');
      setEditorOk(false);
    } finally {
      setEditorBootstrapping(false);
    }
  }, [refreshCmSize, patchContenidoActivo]);

  const load = useCallback(async () => {
    if (!cliente?.id_cliente) return;
    setLoading(true);
    setEditorError('');
    try {
      let rows = await clienteCodigoListar({ id_cliente: cliente.id_cliente });
      if (!rows?.length) {
        const creados = [];
        for (const p of PLANTILLAS) {
          creados.push(await clienteCodigoCrear({
            id_cliente: cliente.id_cliente,
            nombre: p.nombre,
            contenido: p.contenido,
          }));
        }
        rows = creados;
      }
      setArchivos(rows || []);
      const firstId = rows?.[0]?.id_archivo ?? null;
      setActivoId(firstId);
      setDirty(false);
      return rows?.find((r) => r.id_archivo === firstId) || rows?.[0];
    } catch (e) {
      handleErrorMessages('No se pudo cargar el editor', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cliente?.id_cliente]);

  useEffect(() => {
    if (!editorOk && activo && !editorBootstrapping && !loading) {
      setFallbackText(activo.contenido || '');
    }
  }, [activo?.id_archivo, activo?.contenido, editorOk, editorBootstrapping, loading]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        guardarRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open || !cliente?.id_cliente) return undefined;

    let alive = true;
    setVista('editor');

    (async () => {
      await load();
      if (!alive) return;
    })();

    return () => {
      alive = false;
      destroyCm();
      setEditorOk(false);
    };
  }, [open, cliente?.id_cliente, load]);

  useEffect(() => {
    if (!open || loading || !activo || vista !== 'editor') return undefined;

    let cancelled = false;

    (async () => {
      await waitForEditorContainer(() => containerRef.current);
      if (cancelled || !containerRef.current) return;

      if (cmRef.current) {
        scheduleEditorRefresh(refreshCmSize);
        return;
      }

      await initEditor(activo);
    })();

    return () => { cancelled = true; };
  }, [open, loading, activo?.id_archivo, vista, initEditor, refreshCmSize]);

  useEffect(() => {
    if (!open || vista !== 'editor' || !editorOk) return undefined;
    const t = setTimeout(refreshCmSize, 80);
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => refreshCmSize())
      : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    return () => {
      clearTimeout(t);
      ro?.disconnect();
    };
  }, [open, vista, loading, editorOk, refreshCmSize]);

  const handleDialogEntered = useCallback(() => {
    scheduleEditorRefresh(refreshCmSize);
  }, [refreshCmSize]);

  const getEditorValue = () => {
    if (cmRef.current) return cmRef.current.getValue();
    return fallbackText;
  };

  const seleccionar = async (a) => {
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Cambiar de archivo?')) return;
    setActivoId(a.id_archivo);
    setDirty(false);
    if (cmRef.current) {
      setCmValue(a.contenido || '', a.nombre, a.lenguaje);
    } else {
      setFallbackText(a.contenido || '');
      await initEditor(a);
    }
  };

  const guardar = async () => {
    const archivoActivo = archivos.find((x) => Number(x.id_archivo) === Number(activoId));
    if (!archivoActivo?.id_archivo) {
      handleErrorMessages('Guardar', 'Selecciona un archivo para guardar.', true);
      return;
    }
    setSaving(true);
    try {
      const val = getEditorValue();
      const updated = await clienteCodigoActualizar({
        id_archivo: archivoActivo.id_archivo,
        contenido: val,
        lenguaje: archivoActivo.lenguaje,
        nombre: archivoActivo.nombre,
      });
      const row = updated || { ...archivoActivo, contenido: val };
      setArchivos((prev) => prev.map((x) => (
        Number(x.id_archivo) === Number(row.id_archivo) ? { ...x, ...row, contenido: val } : x
      )));
      if (cmRef.current) {
        skipChangeRef.current = true;
        cmRef.current.setValue(val);
        skipChangeRef.current = false;
      } else {
        setFallbackText(val);
      }
      setDirty(false);
      toastSuccess('Archivo guardado');
    } catch (e) {
      handleErrorMessages('Error al guardar', e);
    } finally {
      setSaving(false);
    }
  };

  guardarRef.current = guardar;

  const crearArchivo = async () => {
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    try {
      const row = await clienteCodigoCrear({
        id_cliente: cliente.id_cliente,
        nombre,
        contenido: '',
      });
      setArchivos((prev) => [...prev, row]);
      setActivoId(row.id_archivo);
      setCmValue('', row.nombre, row.lenguaje);
      if (!cmRef.current) await initEditor(row);
      setNewFileOpen(false);
      toastSuccess('Archivo creado');
    } catch (e) {
      handleErrorMessages('No se pudo crear el archivo', e);
    }
  };

  const cerrarCtxMenu = () => setCtxMenu(null);

  const abrirCtxMenu = (e, archivo) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ mouseX: e.clientX, mouseY: e.clientY, archivo });
  };

  const abrirRenombrar = (archivo) => {
    if (!archivo) return;
    setRenameTarget(archivo);
    setRenameNombre(archivo.nombre);
    setRenameOpen(true);
    cerrarCtxMenu();
  };

  const renombrarArchivo = async () => {
    const nombre = renameNombre.trim();
    if (!renameTarget || !nombre) return;
    if (nombre === renameTarget.nombre) {
      setRenameOpen(false);
      return;
    }
    setRenaming(true);
    try {
      const esActivo = renameTarget.id_archivo === activoId;
      const contenido = esActivo ? getEditorValue() : (renameTarget.contenido || '');
      const updated = await clienteCodigoActualizar({
        id_archivo: renameTarget.id_archivo,
        nombre,
        contenido,
      });
      setArchivos((prev) => prev.map((x) => (x.id_archivo === updated.id_archivo ? updated : x)));
      if (esActivo) {
        if (cmRef.current) {
          cmRef.current.setOption('mode', modeForFile(updated.nombre, updated.lenguaje));
        }
      }
      setRenameOpen(false);
      setRenameTarget(null);
      toastSuccess('Archivo renombrado');
    } catch (e) {
      handleErrorMessages('No se pudo renombrar el archivo', e);
    } finally {
      setRenaming(false);
    }
  };

  const eliminarArchivo = async (archivo) => {
    if (!archivo) return;
    if (!window.confirm(`¿Eliminar "${archivo.nombre}"?`)) return;
    try {
      await clienteCodigoEliminar({ id_archivo: archivo.id_archivo });
      const rest = archivos.filter((a) => a.id_archivo !== archivo.id_archivo);
      setArchivos(rest);
      if (archivo.id_archivo === activoId) {
        if (rest.length) {
          const next = rest[0];
          setActivoId(next.id_archivo);
          setCmValue(next.contenido || '', next.nombre, next.lenguaje);
        } else {
          setActivoId(null);
          setCmValue('', '', 'plaintext');
        }
        setDirty(false);
      }
      toastSuccess('Archivo eliminado');
    } catch (e) {
      handleErrorMessages('No se pudo eliminar', e);
    }
  };

  const eliminarActivo = () => eliminarArchivo(activo);

  const ejecutarPreview = () => {
    const val = getEditorValue();
    const merged = archivos.map((a) => (
      a.id_archivo === activoId ? { ...a, contenido: val } : a
    ));
    setPreviewHtml(buildPreviewDoc(merged));
    setVista('preview');
  };

  const cambiarVista = (_, v) => {
    if (!v) return;
    if (v === 'preview') {
      ejecutarPreview();
      return;
    }
    setVista('editor');
    requestAnimationFrame(refreshCmSize);
  };

  const VS = {
    bg: '#1e1e1e',
    sidebar: '#252526',
    border: '#3c3c3c',
    tab: '#2d2d2d',
    accent: '#007acc',
    text: '#cccccc',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionProps={{ onEntered: handleDialogEntered }}
      PaperProps={{ sx: { bgcolor: VS.bg, color: VS.text, display: 'flex', flexDirection: 'column' } }}
    >
      <DialogTitle sx={{ py: 1, px: 2, bgcolor: '#333333', borderBottom: `1px solid ${VS.border}`, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CodeIcon sx={{ color: VS.accent }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>Editor de código</Typography>
            <Typography variant="caption" sx={{ color: '#9cdcfe' }}>{tituloCliente}</Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            value={vista}
            exclusive
            onChange={cambiarVista}
            sx={{ '& .MuiToggleButton-root': { color: '#ccc', borderColor: VS.border, px: 1.5 } }}
          >
            <ToggleButton value="editor">Editor</ToggleButton>
            <ToggleButton value="preview">Vista previa</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Actualizar vista previa">
            <IconButton onClick={ejecutarPreview} sx={{ color: '#4ec9b0' }}><PlayArrowIcon /></IconButton>
          </Tooltip>
          <Button
            type="button"
            variant="contained"
            size="small"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={() => guardarRef.current()}
            disabled={saving || !activo || editorBootstrapping}
            sx={{ bgcolor: VS.accent, textTransform: 'none', '&:hover': { bgcolor: '#005a9e' } }}
          >
            Guardar
          </Button>
          <IconButton onClick={onClose} sx={{ color: '#ccc' }}><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0, flex: 1, display: 'flex', overflow: 'hidden', bgcolor: VS.bg, minHeight: 0 }}>
        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: VS.accent }} />
          </Box>
        ) : (
          <>
            <Box sx={{ width: 220, flexShrink: 0, bgcolor: VS.sidebar, borderRight: `1px solid ${VS.border}`, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" alignItems="center" sx={{ px: 1.5, py: 1, color: '#bbb', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                <FolderIcon sx={{ fontSize: 16, mr: 0.5 }} /> EXPLORADOR
              </Stack>
              <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                {archivos.map((a) => (
                  <ListItemButton
                    key={a.id_archivo}
                    selected={a.id_archivo === activoId}
                    onClick={() => seleccionar(a)}
                    onContextMenu={(e) => abrirCtxMenu(e, a)}
                    sx={{
                      py: 0.4,
                      '&.Mui-selected': { bgcolor: '#37373d', borderLeft: `2px solid ${VS.accent}` },
                      '&:hover': { bgcolor: '#2a2d2e' },
                    }}
                  >
                    <ListItemText
                      primary={a.nombre}
                      primaryTypographyProps={{ fontSize: 12, color: a.id_archivo === activoId ? '#fff' : '#ccc', noWrap: true }}
                    />
                  </ListItemButton>
                ))}
              </List>
              <Divider sx={{ borderColor: VS.border }} />
              <Stack sx={{ p: 1 }} spacing={0.5}>
                {newFileOpen ? (
                  <>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { bgcolor: '#3c3c3c', color: '#fff', fontSize: 12 },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: VS.border },
                      }}
                    >
                      {EXT_OPTS.map((o) => (
                        <MenuItem key={o.ext} value={`archivo${o.ext}`}>{o.label}</MenuItem>
                      ))}
                    </TextField>
                    <Button size="small" variant="contained" onClick={crearArchivo} sx={{ bgcolor: VS.accent }}>Crear</Button>
                    <Button size="small" onClick={() => setNewFileOpen(false)} sx={{ color: '#aaa' }}>Cancelar</Button>
                  </>
                ) : (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setNewFileOpen(true)} sx={{ color: '#ccc', justifyContent: 'flex-start' }}>
                    Nuevo archivo
                  </Button>
                )}
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={eliminarActivo} disabled={!activo}>
                  Eliminar
                </Button>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, position: 'relative' }}>
              {activo && vista === 'editor' && (
                <Box sx={{ px: 2, py: 0.6, bgcolor: VS.tab, borderBottom: `1px solid ${VS.border}`, fontSize: 12, color: '#fff', flexShrink: 0 }}>
                  {activo.nombre}{dirty ? ' • modificado' : ''}
                </Box>
              )}

              {editorError && vista === 'editor' && (
                <Alert severity="warning" sx={{ m: 1, flexShrink: 0 }}>{editorError}</Alert>
              )}

              <Box sx={{ flex: 1, minHeight: 0, position: 'relative', display: vista === 'editor' ? 'block' : 'none' }}>
                <Box
                  ref={containerRef}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    '& .CodeMirror': {
                      height: '100% !important',
                      fontSize: 14,
                      fontFamily: 'Consolas, "Courier New", monospace',
                    },
                    '& .CodeMirror-scroll': { minHeight: '100%' },
                  }}
                />

                {editorBootstrapping && (
                  <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(30,30,30,0.85)',
                    zIndex: 2,
                  }}>
                    <CircularProgress sx={{ color: VS.accent }} />
                  </Box>
                )}

                {!editorOk && !editorBootstrapping && activo && (
                  <TextField
                    multiline
                    fullWidth
                    value={fallbackText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFallbackText(val);
                      setDirty(true);
                      patchContenidoActivo(val);
                    }}
                    placeholder="Escribe tu código aquí..."
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      m: 0,
                      '& .MuiInputBase-root': {
                        height: '100%',
                        alignItems: 'flex-start',
                        bgcolor: '#1e1e1e',
                        color: '#d4d4d4',
                        fontFamily: 'Consolas, monospace',
                        fontSize: 14,
                        borderRadius: 0,
                      },
                      '& textarea': { height: '100% !important', overflow: 'auto !important' },
                    }}
                  />
                )}
              </Box>

              {vista === 'preview' && (
                <Box sx={{ flex: 1, minHeight: 0, bgcolor: '#fff' }}>
                  <iframe
                    title="preview"
                    srcDoc={previewHtml}
                    sandbox="allow-scripts"
                    style={{ width: '100%', height: '100%', border: 0 }}
                  />
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <Menu
        open={ctxMenu !== null}
        onClose={cerrarCtxMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          ctxMenu ? { top: ctxMenu.mouseY, left: ctxMenu.mouseX } : undefined
        }
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#2d2d2d',
              color: '#ccc',
              border: `1px solid ${VS.border}`,
              minWidth: 160,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => abrirRenombrar(ctxMenu?.archivo)}
          sx={{ fontSize: 13, gap: 1, '&:hover': { bgcolor: '#37373d' } }}
        >
          <DriveFileRenameOutlineIcon sx={{ fontSize: 18 }} />
          Renombrar
        </MenuItem>
        <MenuItem
          onClick={() => {
            eliminarArchivo(ctxMenu?.archivo);
            cerrarCtxMenu();
          }}
          sx={{ fontSize: 13, gap: 1, color: '#f48771', '&:hover': { bgcolor: '#3d2020' } }}
        >
          <DeleteIcon sx={{ fontSize: 18 }} />
          Eliminar
        </MenuItem>
      </Menu>

      <Dialog
        open={renameOpen}
        onClose={() => !renaming && setRenameOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#252526', color: '#ccc', border: `1px solid ${VS.border}` } }}
      >
        <DialogTitle sx={{ fontSize: '0.95rem', color: '#fff', pb: 1 }}>
          Renombrar archivo
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nombre del archivo"
            value={renameNombre}
            onChange={(e) => setRenameNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') renombrarArchivo();
            }}
            placeholder="ej. index.html"
            sx={{
              mt: 0.5,
              '& .MuiInputBase-root': { bgcolor: '#3c3c3c', color: '#fff', fontSize: 13 },
              '& .MuiInputLabel-root': { color: '#999' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: VS.border },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setRenameOpen(false)} disabled={renaming} sx={{ color: '#aaa', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={renombrarArchivo}
            disabled={renaming || !renameNombre.trim()}
            sx={{ bgcolor: VS.accent, textTransform: 'none', '&:hover': { bgcolor: '#005a9e' } }}
          >
            {renaming ? 'Guardando...' : 'Renombrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
