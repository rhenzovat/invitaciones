import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import { useIntl, injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Divider from '@mui/material/Divider';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const imageModels = [
  {
    name: "Inicio: En Oferta del Día",
    url: `../../assets/images/prototipos/ofertas.zip`,
    format: "ZIP"
  },
  {
    name: "Inicio: Modelo de Imagen del Portal - Slider",
    url: `../../assets/images/prototipos/slider_01.jpg`,
    format: "JPG"
  },
  {
    name: "Inicio: Explorar y categorias",
    url: `../../assets/images/prototipos/explorar.zip`,
    format: "ZIP"
  },
  // {
  //   name: "Subir Imagen breadcrumb",
  //   url: `../../assets/images/prototipos/page-header-bg.jpg`,
  //   format: "jpg"
  // },
    {
    name: "Envios x Peso - Excel plantilla",
    url: `../../assets/images/prototipos/Plantilla.xlsx`,
    format: "xlsx"
  },
      {
    name: "Productos - Excel plantilla",
    url: `../../assets/images/prototipos/PlantillaProducto.xlsx`,
    format: "xlsx"
  },
];

const ModalPrototiposIndexPage = (props) => {
  const intl = useIntl();
  const { setLoading } = props;
  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
  };

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (props.setLoading) {
      setLoading(false);
    }
  }, []);
  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={props.showPopup.isVisiblePopUp}
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "900px",
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" className="d-flex justify-content-between">
        <Typography variant="h5" className="mf-3">
          Modelos disponibles para descargar
        </Typography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers>
        <List>
          {imageModels.map((model, index) => (
            <React.Fragment key={index}>
              <ListItem
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  py: { xs: 2.5, sm: 2 },
                  px: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexGrow: 1 }}>
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <InsertDriveFileIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={model.name}
                    secondary={model.format}
                    primaryTypographyProps={{ 
                      variant: 'body1', 
                      sx: { fontWeight: 500, lineHeight: 1.4 } 
                    }}
                    secondaryTypographyProps={{
                      sx: { mt: 0.5, color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' }
                    }}
                  />
                </Box>
                <Box sx={{ 
                  width: { xs: '100%', sm: 'auto' }, 
                  mt: { xs: 1.5, sm: 0 }, 
                  ml: { xs: 0, sm: 2 },
                  display: 'flex',
                  justifyContent: { xs: 'flex-end', sm: 'initial' }
                }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleDownload(model.url)}
                    sx={{
                      borderColor: '#3400c2',
                      color: '#3400c2',
                      textTransform: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      px: 2,
                      py: 0.5,
                      minWidth: '110px',
                      '&:hover': {
                        borderColor: '#26008f',
                        backgroundColor: 'rgba(52, 0, 194, 0.05)',
                      }
                    }}
                  >
                    Descargar
                  </Button>
                </Box>
              </ListItem>
              {index < imageModels.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          Cerrar
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

ModalPrototiposIndexPage.propTypes = {
  showPopup: PropTypes.object.isRequired,
  imagenProducto: PropTypes.string.isRequired,
  setLoading: PropTypes.func,
};

export default injectIntl(WithLoandingPanel(ModalPrototiposIndexPage));