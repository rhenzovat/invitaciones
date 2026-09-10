import React, { useState } from "react";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Button as ColumnButton,
  SearchPanel
} from 'devextreme-react/data-grid';
import { Button as ButtonDev } from 'devextreme-react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { authJWTConfig } from "app/authJWTConfig";

export const DomainBackend = authJWTConfig.domain + "/";

const BannerPopularListPage = ({
  accessButton,
  titulo,
  listarUsuario: banners,
  nuevoRegistro,
  editarRegistro,
  eliminarRegistro,
  ...props
}) => {
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });

  const eliminarRegistro_ = evt => {
    const { id_banner_popular } = evt.row.data;
    eliminarRegistro(id_banner_popular, false);
  };

  const handleOpenImageModal = (imageUrl, title) => {
    setSelectedImage({ url: imageUrl, title: title });
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setSelectedImage({ url: '', title: '' });
  };

  const cellRenderImagen = e => {
    if (!e.data.url_imagen) return null;

    const imagenURL = DomainBackend + e.data.url_imagen;

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          className="devsite-landing-row-item-icon"
          height="64"
          loading="lazy"
          width="64"
          src={imagenURL}
          alt={e.data.titulo_principal}
          style={{
            objectFit: "contain",
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'transform 0.2s'
          }}
          onClick={() => handleOpenImageModal(imagenURL, e.data.titulo_principal)}
          onMouseOver={(evt) => {
            evt.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(evt) => {
            evt.currentTarget.style.transform = 'scale(1)';
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
            cursor: 'pointer',
            borderRadius: '8px',
            pointerEvents: 'none'
          }}
          className="zoom-overlay"
        >
          <ZoomInIcon style={{ color: 'white', fontSize: 32 }} />
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-3">
      <div className="clsProgramacionAlinearBotonCrear mt-3">
        <h3 className="">{titulo}</h3>
        <ButtonDev
          icon="mdi mdi-plus"
          className="idRef65654 clsButtomOperation"
          type="default"
          onClick={nuevoRegistro}
          visible={accessButton.crear}
        />
      </div>

      <div className="row">
        <DataGrid
          keyExpr="id_banner_popular"
          className="dx-card wide-card"
          dataSource={banners}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />
          <FilterRow visible={false} />
          <SearchPanel visible={true} highlightCaseSensitive={true} />

          <Column dataField="id_banner_popular" caption="ID" width={100} alignment="center" />
          <Column dataField="titulo_principal" caption="Título Principal" />
          <Column dataField="titulo_secundario" caption="Título Secundario" />
          <Column dataField="texto_descuento" caption="Texto Descuento" />
          <Column
            dataField="precio_desde"
            caption="Precio Desde"
            dataType="number"
            format="S/ #,##0.##"
            width="10%"
            alignment="center"
          />
          <Column
            dataField="url_direccion"
            caption="URL"
            width="20%"
            cellRender={(e) => {
              if (!e.value) return null;
              return (
                <a href={e.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1976d2', textDecoration: 'underline' }}
                >
                  {e.value}
                </a>
              );
            }}
          />
          <Column
            dataField="url_imagen"
            caption="Imagen"
            cellRender={cellRenderImagen}
            width="12%"
            alignment="center"
          />
          <Column dataField="orden" caption="Orden" width="10%" alignment="center" />
          <Column
            dataField="Activo"
            caption="Estado"
            width="10%"
            alignment="center"
            cellRender={(e) => (
              e.data.Activo === "S" ?
                <i className="mdi mdi-check-circle-outline clsFontSizeCheck" /> :
                <i className="mdi mdi-close-circle-outline clsFontSizeCheckRed" />
            )}
          />
          <Column type="buttons" fixedPosition="right"  caption={'Acciones'}>
            <ColumnButton
              icon="edit"
              hint="Editar"
              onClick={(e) => editarRegistro(e.row.data)}
            />
            <ColumnButton
              icon="trash"
              hint="Eliminar"
              onClick={eliminarRegistro_}
            />
          </Column>
        </DataGrid>
      </div>

      {/* Modal para visualizar imagen */}
      <Dialog
        open={openImageModal}
        onClose={handleCloseImageModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle style={{ margin: 0, padding: '16px', backgroundColor: '#f5f5f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#333' }}>
              {selectedImage.title}
            </span>
            <IconButton
              aria-label="cerrar"
              onClick={handleCloseImageModal}
              style={{ color: '#666' }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fafafa',
          minHeight: '400px'
        }}>
          <img
            src={selectedImage.url}
            alt={selectedImage.title}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '4px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          />
        </DialogContent>
      </Dialog>

      <style>{`
        .zoom-overlay {
          transition: opacity 0.2s;
        }
        div:hover > .zoom-overlay {
          opacity: 1 !important;
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
};

export default BannerPopularListPage;