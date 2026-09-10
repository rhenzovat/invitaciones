import React, { useState, useEffect } from 'react';
import { Box, Modal, Typography, IconButton, CircularProgress, Button, Chip } from '@mui/material';

import axios from 'axios';
import { getStoredAccessToken } from 'app/utils/authStorage';

const FileViewer = ({ fileUrl, fileName }) => {
  const [open, setOpen] = useState(false);
  const [fileBlob, setFileBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const isImage = /\.(jpe?g|png|gif|bmp|webp)$/i.test(fileName);
  const isPDF = /\.pdf$/i.test(fileName);

  const fetchFile = async () => {
    if (!fileUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getStoredAccessToken();
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream'
        }
      });
      
      setFileBlob(URL.createObjectURL(response.data));
    } catch (err) {
      console.error('Error fetching file:', err);
      setError('No se pudo cargar el archivo');
      if (err.response?.status === 401 && retryCount < 2) {
        setRetryCount(retryCount + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !fileBlob) {
      fetchFile();
    }
  }, [open, retryCount]);

  useEffect(() => {
    return () => {
      if (fileBlob) {
        URL.revokeObjectURL(fileBlob);
      }
    };
  }, [fileBlob]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileBlob;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para extraer la extensión del archivo
  const getFileExtension = () => {
    return fileName?.split('.').pop().toUpperCase();
  };

  return (
    <Box>
      {/* Mostrar solo referencia (sin vista previa de imagen) */}
      {loading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Box display="flex" alignItems="center" color="error.main">
          null
          <Typography variant="body2" ml={1}>{error}</Typography>
          {retryCount < 2 && (
            <Button size="small" onClick={() => setRetryCount(retryCount + 1)}>
              Reintentar
            </Button>
          )}
        </Box>
      ) : (
        getFileExtension()?
        <Chip
          icon={isPDF ? null: null}
          label={`Ver ${isPDF ? 'PDF' : 'Imagen'} (${getFileExtension()})`}
          onClick={handleOpen}
          variant="outlined"
          clickable
          sx={{
            cursor: 'pointer',
            '& .MuiChip-icon': {
              color: isPDF ? 'error.main' : 'primary.main'
            }
          }}
        />:"Ninguno"
      )}

      {/* Modal para visualización completa */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          outline: 'none',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
          >
            null
          </IconButton>
          
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box display="flex" flexDirection="column" alignItems="center" p={4}>
             null
              <Typography variant="h6" mt={2}>{error}</Typography>
              <Button 
                variant="contained" 
                onClick={() => setRetryCount(retryCount + 1)}
                sx={{ mt: 2 }}
              >
                Reintentar
              </Button>
            </Box>
          ) : isImage && fileBlob ? (
            <>
              <img 
                src={fileBlob} 
                alt="Comprobante" 
                style={{ maxWidth: '100%', maxHeight: '80vh' }}
              />
              <Box textAlign="center" mt={2}>
                <Button
                  variant="contained"
                  startIcon={null}
                  onClick={handleDownload}
                >
                  Descargar imagen
                </Button>
              </Box>
            </>
          ) : isPDF && fileBlob ? (
            <iframe 
              src={fileBlob} 
              title={fileName}
              width="800" 
              height="600"
              style={{ border: 'none' }}
            />
          ) : fileBlob ? (
            <Box textAlign="center" p={4}>
              <Typography variant="h6">Vista previa no disponible</Typography>
              <Button
                variant="contained"
                startIcon={null}
                onClick={handleDownload}
                sx={{ mt: 2 }}
              >
                Descargar archivo
              </Button>
            </Box>
          ) : null}
        </Box>
      </Modal>
    </Box>
  );
};

export default FileViewer;