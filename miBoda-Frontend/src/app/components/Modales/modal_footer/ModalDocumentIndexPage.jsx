import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Typography from '@mui/material/Typography';
import { useIntl, injectIntl } from "react-intl";
import TextBox, { Button as TextBoxButton } from 'devextreme-react/text-box';
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import {
  obtener_document,
  actualizar_document,
} from "../../../api/web_footer.api";

import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import { Button as ButtonDev } from "devextreme-react";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import HtmlEditorOnlyComponent from "../../../components/HtmlEditorOnlyComponent";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const PANEL_W = 300; // debe coincidir con el ancho del FooterCmsPanel

const ModalDocumentIndexPage = (props) => {
  const { cmsPanelOpen = false } = props;
  const intl = useIntl();
  const { setLoading } = props;

  const textRef_titulo = useRef(null);
  const editorMethodsRef = useRef(null);

  const [sliderTitulo, setSliderTitulo] = useState(null);
  const [datosState, setDatosState] = useState({ titulo: '', descripcion: '' });
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [editorValue, setEditorValue] = useState('');
  const editorValueRef = useRef('');



  const handleContentChange = useCallback((value) => {
    console.log('%c [test]-45', 'font-size:13px; background:pink; color:#bf2c9f;', value)
    // Solo actualizamos la referencia, no el estado
    editorValueRef.current = value;
  }, []);
  const registerEditorMethods = (methods) => {
    editorMethodsRef.current = methods;
  };



  const handleClose = () => {
    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
  };

  async function obtenerRegistro() {
    setLoading(true);
    await obtener_document({ id_footer_terminos: props.idFooterTerminos })
      .then(response => {
        const registro = Array.isArray(response) ? response[0] : response;
        setDataRowEditNew({ ...registro, esNuevoRegistro: false });
        setDatosState(registro);
        setEditorValue(registro.descripcion || '');
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }


  async function grabar() {
    setLoading(true);
    let params = {
      id_footer_document: props.idFooterTerminos,
      titulo: textRef_titulo.current.instance.option('value'),
      descripcion: editorMethodsRef.current?.getEditorContent() || '',
      Activo: 'S'
    };

    await actualizar_document(params)
      .then(response => {
        if (response) {
          toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }


  useEffect(() => {
    obtenerRegistro();
  }, []);

  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={props.showPopup.isVisiblePopUp}
        sx={{
          // Sube el z-index por encima del panel CMS (1500) cuando está activo
          zIndex: cmsPanelOpen ? 1600 : 1300,
          // Backdrop: solo cubre el área de contenido (a la derecha del panel)
          "& .MuiBackdrop-root": {
            left: cmsPanelOpen ? `${PANEL_W}px` : 0,
            transition: "left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          },
          // Contenedor del diálogo: se centra en el área de contenido, no en toda la pantalla
          "& .MuiDialog-container": {
            paddingLeft: cmsPanelOpen ? `${PANEL_W}px` : 0,
            transition: "padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            "& .MuiPaper-root": {
              width: "100%",
              maxWidth: "900px",
            },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title" className="d-flex justify-content-between">
          <Typography variant="h5" className="mf-3">
            <TextBox
              id="txt_titulo"
              label={intl.formatMessage({ id: "WEB.FOOTER.SUBIR_DOCUMENT.INFO.TITLE" })}
              ref={textRef_titulo}
              value={sliderTitulo ? sliderTitulo : datosState.titulo}
              placeholder="Type..."
              stylingMode={'filled'}
              labelMode={'floating'}
              showClearButton={true}
              onValueChanged={(e) => {
                e.value ? setSliderTitulo(e.value) : setSliderTitulo(null);
                setDatosState({ titulo: '' });
              }}
            />
          </Typography>
          <ButtonDev
            className="clsMr-3"
            icon="save"
            type="default"
            hint={"Grabar"}
            onClick={grabar}
            useSubmitBehavior={true}
            validationGroup="FormEdicion"
          />
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
        <DialogContent dividers sx={{ position: 'relative', minHeight: 200 }}>
          {props.loadingState && (
            <Box sx={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.85)',
            }}>
              <CircularProgress />
              <Typography sx={{ mt: 1.5 }}>Cargando...</Typography>
            </Box>
          )}
          <HtmlEditorOnlyComponent
            registerEditorMethods={registerEditorMethods}
            dataRowEditNew={dataRowEditNew}
          />
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

export default injectIntl(WithLoandingPanel(ModalDocumentIndexPage, { hideBackdrop: true }));