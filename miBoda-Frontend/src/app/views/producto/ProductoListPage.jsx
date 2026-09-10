import React, { useEffect, useState, useCallback, useRef } from "react";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Button as ColumnButton,
  SearchPanel,
  //================ START: FILTROS PERSONALIZADOS ==============
  ColumnChooser,
  ColumnChooserSearch,
  ColumnChooserSelection,
  Position,
  StateStoring,
  //================ END: FILTROS PERSONALIZADOS ==============

  // Editing, Summary, TotalItem
} from 'devextreme-react/data-grid';

import { Button as ButtonDev } from 'devextreme-react';
import { authJWTConfig } from "app/authJWTConfig";
export const DomainBackend = authJWTConfig.domain + "/";
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const FILTRO_KEY = "chip_filter_selected";
//================ START: FILTROS PERSONALIZADOS ==============
const columnChooserModes = [
  {
    key: 'dragAndDrop',
    name: 'Drag and drop',
  },
  {
    key: 'select',
    name: 'Select',
  },
];
const searchEditorOptions = { placeholder: 'Search column' };
//================ END: FILTROS PERSONALIZADOS ==============
const ProductoListPage = props => {
  const { accessButton } = props;


  // Intenta leer el filtro seleccionado de localStorage (solo una vez, después del borrado)
  const [filtarProEnable, setFiltarProEnable] = useState(() => {
    const saved = localStorage.getItem(FILTRO_KEY);
    return saved !== null ? Number(saved) : 0;
  });

  // ── Scroll estilo Excel ──────────────────────────────────────────
  const gridRef      = useRef(null)
  const scrollbarRef = useRef(null)
  const isSyncing    = useRef(false)
  const [scrollWidth, setScrollWidth] = useState(3000)

  const onCustomScroll = (e) => {
    if (isSyncing.current) return
    const scrollable = gridRef.current?.instance.getScrollable()
    if (scrollable) {
      isSyncing.current = true
      const el = e.target
      const customMax = el.scrollWidth - el.clientWidth
      const ratio = customMax > 0 ? el.scrollLeft / customMax : 0
      const content   = scrollable.content()
      const container = scrollable.container()
      if (content && container) {
        const gridMax = content.scrollWidth - container.clientWidth
        scrollable.scrollTo({ left: ratio * gridMax })
      }
      setTimeout(() => { isSyncing.current = false }, 50)
    }
  }

 // Agrega este estado
// Elimina el estado scrollTrackWidth, no lo necesitas

const onGridContentReady = (e) => {
  const scrollable = e.component.getScrollable()
  if (scrollable) {
    scrollable.off('scroll')

    const c  = scrollable.content()
    const ct = scrollable.container()
    if (c && ct) {
      const overflow = c.scrollWidth - ct.clientWidth
      // Si overflow es pequeño, multiplicamos para que el thumb sea manejable
      // overflow=61 → scrollWidth = 1292 + (61 * 8) = ~1780, thumb razonable
      const multiplier = overflow > 0 && overflow < 200 ? 8 : 1
      setScrollWidth(ct.clientWidth + (overflow * multiplier))
    }

    scrollable.on('scroll', (args) => {
      if (isSyncing.current || !scrollbarRef.current) return
      const content   = scrollable.content()
      const container = scrollable.container()
      if (content && container) {
        isSyncing.current = true
        const gridMax   = content.scrollWidth - container.clientWidth
        const customMax = scrollbarRef.current.scrollWidth - scrollbarRef.current.clientWidth
        const ratio     = gridMax > 0 ? args.scrollOffset.left / gridMax : 0
        scrollbarRef.current.scrollLeft = ratio * customMax
        setTimeout(() => { isSyncing.current = false }, 50)
      }
    })
  }
}
  const scrollLeft  = () => { if (scrollbarRef.current) scrollbarRef.current.scrollLeft -= 150 }
  const scrollRight = () => { if (scrollbarRef.current) scrollbarRef.current.scrollLeft += 150 }
  // ────────────────────────────────────────────────────────────────


  //================ START: FILTROS PERSONALIZADOS ==============
  const [mode, setMode] = useState(columnChooserModes[1].key);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [allowSelectAll, setAllowSelectAll] = useState(true);
  const [selectByClick, setSelectByClick] = useState(true);
  const [recursive, setRecursive] = useState(true);

  //================ END: FILTROS PERSONALIZADOS ==============
  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };

  const editarRegistroImgList = evt => {
    props.editarRegistroImgList(evt.row.data);
  };

  const eliminarRegistro = evt => {
    props.eliminarRegistro(evt.row.data, false);
  };

  const cellEstadoRender = e => {
    let estado = e.data.Activo;
    let css = "";
    switch (estado) {
      case "S":
        css = <i className={`mdi mdi-check-circle-outline clsFontSizeCheck`} ></i>;
        break;
      case "N":
        css = <i className={`mdi mdi-close-circle-outline clsFontSizeCheckRed`} ></i>;
        break;
      default: break;
    }
    return css;
  };


  const cellRenderNombre = e => {
    let nombre = e.data.nombre || "";
    if (nombre.length > 15) {
      return <span title={nombre}>{nombre.substring(0, 15) + "..."}</span>;
    }
    return nombre;
  };

  const cellRenderImagen = e => {
    let imagen_ = e.data.url_imagen;
    const imgenURL = DomainBackend + imagen_; // URL de la  Imagen

    let css = <>
      <Link href="#" onClick={() => props.funOpenModalProductoImagen({ url_imagen: imgenURL, id_producto: e.data.id_producto })} >
        <img className="devsite-landing-row-item-icon" height="64" loading="lazy" width="64" src={imgenURL} style={{ objectFit: "contain" }} ></img>
      </Link>
    </>;
    return css;
  };

  // Cambia filtro y guarda en localStorage
  const filtrarProductos = (isEtiqueta) => {
    setFiltarProEnable(isEtiqueta);
    localStorage.setItem(FILTRO_KEY, isEtiqueta);
    props.setListarProductoFiltro(isEtiqueta);
  };

  // Al refrescar la página, borra el filtro de localStorage (solo la primera vez)
  useEffect(() => {
    filtrarProductos(0); // Resetea el filtro a "Todos" al cargar la página
  }, []);


  return (
    <>
      <div className="container mt-4">

        <div className="clsProgramacionAlinearBotonCrear" >
          <h3 className="clsProgramacionAlinearBotonCrear-relative">
            {props.titulo}
          </h3>
          <div>
            <Chip
              label="Más Vendidos"
              variant={filtarProEnable === 1 ? "filled" : "outlined"}
              component="a"
              hint={"Más Vendidos"}
              href="#basic-chip"
              className="me-2"
              icon={<FilterListIcon />}
              onClick={() => filtrarProductos(1)} // 1 = Mas Vendidos
              clickable

            />
            <Chip
              label="Nuestro Productos"
              variant={filtarProEnable === 2 ? "filled" : "outlined"}
              component="a"
              href="#basic-chip"
              className="me-2"
              icon={<FilterListIcon />}
              onClick={() => filtrarProductos(2)} // 2 = Nuestros Productos
              clickable

            />
            <Chip

              label="Todos"
              variant={filtarProEnable === 0 ? "filled" : "outlined"}
              className="me-2"
              icon={<FilterListIcon />}
              onClick={() => filtrarProductos(0)} // 0 = Todos Productos
              clickable
            />
            {/* Botón config delivery */}
            <Tooltip title="Configurar Delivery">
              <IconButton
                onClick={props.abrirDeliveryConfig}
                size="small"
                sx={{
                  mr: 1,
                  background: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
                  color: '#fff',
                  borderRadius: 2,
                  px: 1.5, py: 0.7,
                  '&:hover': { background: '#1d4ed8' },
                }}
              >
                <LocalShippingIcon fontSize="small" sx={{ mr: 0.5 }} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Config Delivery</span>
              </IconButton>
            </Tooltip>
            <ButtonDev
              icon="mdi mdi-plus" className="idRef65654 clsButtomOperation"
              type="default"
              onClick={props.nuevoRegistro}
              visible={accessButton.crear ? true : false}
            />
          </div>

        </div>

        <DataGrid
          ref={gridRef}
          scrolling={{ mode: 'standard', showScrollbar: 'never', useNative: false }}
          onContentReady={onGridContentReady}
          keyExpr="id_producto"
          className={'dx-card wide-card'}
          dataSource={props.listarProductos}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
        >

          {/* ======== FILTROS PERSONALIZADOS ========== */}
          <SearchPanel
            visible={true}
            highlightCaseSensitive={true}
          />

          <StateStoring enabled={true} type="localStorage" storageKey="storage" />
          <ColumnChooser
            height="340px"
            enabled={true}
            mode={mode}
          >
            <Position
              my="right top"
              at="right bottom"
              of=".dx-datagrid-column-chooser-button"
            />

            <ColumnChooserSearch
              enabled={searchEnabled}
              editorOptions={searchEditorOptions}
            />

            <ColumnChooserSelection
              allowSelectAll={allowSelectAll}
              selectByClick={selectByClick}
              recursive={recursive}
            />
          </ColumnChooser>
          {/* ============================================ */}


          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true}
            infoText="Página {0} de {1} ({2} registros)"
          />
          <FilterRow visible={false} />
          <SearchPanel
            visible={true}
            highlightCaseSensitive={true}
            placeholder="Buscar..."
          />

          <Column
            dataField={'id_producto'}
            caption={'ID'}
            width={100}
            alignment={"center"}
          />
          <Column
            dataField={'url_imagen'}
            caption={'Imagen'}
            cellRender={cellRenderImagen}
          />

          <Column
            dataField={'Activo'}
            caption={'Activo'}
            width={80}
            // calculateCellValue={obtenerCampoActivo}
            cellRender={cellEstadoRender}
          />
          <Column
            dataField={'nombre'}
            caption={'Nombre'}
            width={200}
            cellRender={cellRenderNombre}
          />

          {/* codigo de producto 02 */}
          <Column
            dataField={'codigo_producto_new'}
            caption={'Cód. Producto'}
          />
          {/* codigo de producto 01 */}
          {/* <Column
            dataField={'codigo_producto'}
            caption={'Código'}
          /> */}

          <Column
            dataField={'codigo_barra'}
            caption={'Cód Barra'}
          />
          <Column
            dataField={'nombre_categoria'}
            caption={'Categoría'}
          />

          <Column
            dataField={'descripcion'}
            caption={'Descripcion'}
            width={150}

          />
          <Column
            dataField={'precio'}
            caption={'precio'}
          />
          <Column
            dataField={'stock'}
            caption={'stock'}
          />


          <Column
            dataField={'created_at'}
            caption={'Fecha Creación'}
            dataType="date" format="dd/MM/yyyy" alignment={"center"}
          />

          <Column
            type="buttons"
            visible={true}
            fixed={true}
            fixedPosition="right"
            caption={'Acciones'}
          >
            <ColumnButton
              icon="taskcomplete"
              hint={"Ficha Tecnica"}
              onClick={(evt) => props.openModalFichaTecnica(evt.row.data)}
            />
            <ColumnButton
              icon="edit"
              hint={"Editar y Agregar fotos"}
              onClick={editarRegistro}
              visible={accessButton.editar ? true : false}
            />
            {/* Botón configurar delivery por producto */}
            <ColumnButton
              icon="car"
              hint={"Configurar Delivery"}
              onClick={() => props.abrirDeliveryConfig()}
            />
            <ColumnButton
              icon="trash"
              hint={"Eliminar"}
              onClick={eliminarRegistro}
              visible={accessButton.eliminar ? true : false}
            />
          </Column>

        </DataGrid>
      </div>
      {/* ── Scrollbar flotante estilo Excel ── */}
      <Box sx={{
        position: 'fixed', bottom: 0, right: 20, zIndex: 99999,
        display: 'flex', alignItems: 'center',
        bgcolor: '#f8f9fa', borderRadius: '4px 4px 0 0',
        border: '1px solid #e0e0e0', borderBottom: 'none',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
        height: 32, px: 0.5, gap: 0,
      }}>
        <IconButton size="small" onClick={scrollLeft}
          sx={{ color: '#666', p: 0, width: 32, height: 32, borderRadius: 0, '& svg': { fontSize: 20 } }}>
          <ChevronLeftIcon />
        </IconButton>
        <Box ref={scrollbarRef} onScroll={onCustomScroll} sx={{
          width: 500, overflowX: 'auto', overflowY: 'hidden', height: 14,
          '&::-webkit-scrollbar': { height: '14px !important', display: 'block !important' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent', borderRadius: 10 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#888', borderRadius: 10,
            border: '2px solid transparent', backgroundClip: 'padding-box',
            '&:hover': { bgcolor: '#666' },
          },
        }}>
          <Box sx={{ width: scrollWidth, height: 1, margin: 10 }} />
        </Box>
        <IconButton size="small" onClick={scrollRight}
          sx={{ color: '#666', p: 0, width: 32, height: 32, borderRadius: 0, '& svg': { fontSize: 20 } }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </>
  );
}
export default ProductoListPage;