import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Paper, Button, Tooltip, Chip, CircularProgress, Stack,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import '@excalidraw/excalidraw/index.css';
import { excalidrawCargar, excalidrawGuardar } from '../../../../api/excalidraw/excalidraw.api';
import { toastSuccess, handleErrorMessages } from '../../../../components/notify-messages';

const ExcalidrawLazy = lazy(async () => {
  const mod = await import('@excalidraw/excalidraw');
  return { default: mod.Excalidraw };
});

const exportScenePng = async (payload) => {
  const { exportToBlob } = await import('@excalidraw/excalidraw');
  return exportToBlob(payload);
};

const parseJson = (raw, fallback) => {
  if (raw == null || raw === '') return fallback;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return fallback;
  }
};

const ExcalidrawEditor = ({ idProyecto, isAdmin }) => {
  const draftRef = useRef({ elements: [], appState: {}, files: null });
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setInitialData(null);

    excalidrawCargar({ id_proyecto: idProyecto })
      .then((data) => {
        if (cancelled) return;
        const elements = parseJson(data?.elements_json, []);
        const appState = parseJson(data?.app_state_json, {});
        const files = parseJson(data?.files_json, null);

        const scene = {
          elements,
          appState: {
            ...appState,
            viewModeEnabled: !isAdmin,
          },
          files: files || undefined,
        };

        draftRef.current = {
          elements,
          appState: scene.appState,
          files: files || null,
        };
        setInitialData(scene);
      })
      .catch(() => {
        if (cancelled) return;
        const empty = {
          elements: [],
          appState: { viewModeEnabled: !isAdmin },
          files: undefined,
        };
        draftRef.current = { elements: [], appState: empty.appState, files: null };
        setInitialData(empty);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [idProyecto, isAdmin]);

  const onChange = useCallback((elements, appState, files) => {
    draftRef.current = { elements, appState, files };
  }, []);

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      const { elements, appState, files } = draftRef.current;
      const { collaborators, ...cleanAppState } = appState || {};

      await excalidrawGuardar({
        id_proyecto: idProyecto,
        elements_json: JSON.stringify(elements ?? []),
        app_state_json: JSON.stringify(cleanAppState ?? {}),
        files_json: files ? JSON.stringify(files) : null,
        version: '1.0',
      });
      toastSuccess('Pizarra guardada');
    } catch (e) {
      handleErrorMessages('Error al guardar pizarra', e);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const { elements, appState, files } = draftRef.current;
      const blob = await exportScenePng({
        elements: elements ?? [],
        appState: { ...appState, exportBackground: true },
        files: files ?? null,
        mimeType: 'image/png',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `excalidraw_proyecto_${idProyecto}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      handleErrorMessages('Error al exportar imagen', e);
    }
  };

  if (loading || !initialData) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: { xs: 1, md: 1.5 }, pt: 1, gap: 1 }}>
      <Paper
        sx={{
          borderRadius: 0,
          border: '1px solid #e3eaf3',
          boxShadow: 'none',
          px: 1.5,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TypographyLabel />
          {!isAdmin && (
            <Chip
              label="Solo lectura"
              size="small"
              icon={<LockIcon sx={{ fontSize: 14 }} />}
              sx={{ fontSize: 11, height: 24 }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Exportar PNG">
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              Exportar
            </Button>
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Guardar en servidor">
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </Button>
            </Tooltip>
          )}
        </Stack>
      </Paper>

      <Paper
        sx={{
          flex: 1,
          borderRadius: 0,
          overflow: 'hidden',
          border: '1px solid #e3eaf3',
          boxShadow: '0 2px 12px rgba(0,0,0,.06)',
          position: 'relative',
          minHeight: 420,
        }}
      >
        <Box sx={{ width: '100%', height: '100%', minHeight: 420 }}>
          <Suspense fallback={<CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />}>
            <ExcalidrawLazy
              key={`excalidraw-${idProyecto}`}
              initialData={initialData}
              onChange={onChange}
              viewModeEnabled={!isAdmin}
              UIOptions={{
                canvasActions: {
                  changeViewBackground: isAdmin,
                  clearCanvas: isAdmin,
                  export: false,
                  loadScene: false,
                  saveToActiveFile: false,
                  saveAsImage: false,
                  toggleTheme: true,
                },
              }}
            />
          </Suspense>
        </Box>
      </Paper>
    </Box>
  );
};

function TypographyLabel() {
  return (
    <Box component="span" sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
      Excalidraw — diagramas y trazos del proyecto
    </Box>
  );
}

export default ExcalidrawEditor;
