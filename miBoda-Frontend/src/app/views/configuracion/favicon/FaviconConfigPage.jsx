import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { injectIntl } from 'react-intl';
import { WithLoandingPanel } from 'app/utils/withLoandingPanel';
import { obtenerFavicon, actualizarFavicon } from 'app/api/favicon.api';
import { applyAppFavicon } from 'app/utils/appFavicon';
import { handleErrorMessages, toastSuccess } from 'app/components/notify-messages';

function FaviconConfigPageInner({ setLoading }) {
  const [info, setInfo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerFavicon();
      setInfo(data);
      if (data?.svg) setPreview(data.svg);
      applyAppFavicon(data);
    } catch (err) {
      handleErrorMessages('Favicon', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const result = await actualizarFavicon(file);
      toastSuccess('Favicon guardado. Pulse Ctrl+F5 en el navegador si no cambia la pestaña.');
      setInfo(result);
      if (result?.svg) setPreview(result.svg);
      else if (result?.png) setPreview(result.png);
      applyAppFavicon(result);
    } catch (err) {
      handleErrorMessages('Favicon', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Favicon del panel
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        El icono de la pestaña del navegador se guarda en los archivos públicos del proyecto.
        Si solo cambió un archivo a mano, el navegador puede seguir mostrando el icono antiguo por caché.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Recomendado: subir un archivo <strong>SVG</strong> o <strong>PNG</strong> cuadrado.
        Después de guardar, use <strong>Ctrl+F5</strong> o abra en ventana de incógnito.
      </Alert>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2} alignItems="flex-start">
            {preview && (
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  bgcolor: '#f8fafc',
                }}
              >
                <Box
                  component="img"
                  src={preview}
                  alt="Favicon actual"
                  sx={{ width: 48, height: 48, objectFit: 'contain' }}
                />
              </Box>
            )}

            {info?.updated_at && (
              <Typography variant="caption" color="text.secondary">
                Última actualización: {new Date(info.updated_at).toLocaleString()}
              </Typography>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
              >
                {uploading ? 'Guardando…' : 'Subir favicon'}
                <input type="file" hidden accept=".svg,.png,.jpg,.jpeg,.webp,.ico" onChange={onFile} />
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargar} disabled={uploading}>
                Recargar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default injectIntl(WithLoandingPanel(FaviconConfigPageInner));
