import React, { useEffect, useState, useRef } from "react";
import { styled, } from "@mui/material/styles";
import { Box, IconButton } from '@mui/material';
import { useIntl, injectIntl } from "react-intl";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  SearchPanel,
  // Editing, Summary, TotalItem
} from 'devextreme-react/data-grid';
import Button from "@mui/material/Button";
import DoneIcon from '@mui/icons-material/Done';
import { isNotEmpty } from "../../../utils/utils";
import { handleInfoMessages, toastSuccess } from "../../../components/notify-messages";
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const EmpleadosListPage = props => {
  const intl = useIntl();
  const [selectedRow, setSelectedRow] = useState([]);
  const [dataSource, setDataSource] = useState([]); // Inicializamos como array vacío
  const { setLoading } = props;
  // useEffect para manejar cambios en props.listarDatos y asegurar que sea un array
  useEffect(() => {
    if (props.listarDatos && Array.isArray(props.listarDatos)) {
      setDataSource(props.listarDatos);
    } else if (props.listarDatos && Object.keys(props.listarDatos).length > 0) {
      // Si llega un objeto no vacío (quizá un error en el padre), loguea y usa []
      console.warn('props.listarDatos es un objeto inesperado:', props.listarDatos);
      setDataSource([]);
    } else {
      setDataSource([]); // Por defecto, array vacío si no hay datos
    }
    setLoading(false);
  }, [props.listarDatos]);

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) setSelectedRow([{ ...evt.row.data }]);
    // if (isNotEmpty(evt.row.data)) {
    //   props.seleccionarRegistro(evt.row.data);
    // }
  }

  function aceptar() {
    if (selectedRow.length > 0) {
      props.selectData(selectedRow);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }
  }
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

  const onGridContentReady = (e) => {
    const scrollable = e.component.getScrollable()
    if (scrollable) {
      scrollable.off('scroll')
      setScrollWidth(3000)
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

  return (
    <>
      <ContentBox className="mt-1">



        <DataGrid
          ref={gridRef}
          onContentReady={onGridContentReady}
          scrolling={{ mode: 'standard', showScrollbar: 'never', useNative: false }}
          keyExpr="id_precio_peso"
          className={'dx-card wide-card'}
          dataSource={dataSource}  // Ahora usa el state controlado, siempre array
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
          onFocusedRowChanged={seleccionarRegistro}
          onRowDblClick={seleccionarRegistroDblClick}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />
          <FilterRow visible={true} />  {/* Filtro por columna */}
          <SearchPanel
            visible={true}
            highlightCaseSensitive={false}   
            placeholder="Buscar en todas las columnas..."
          />
          <Column
            dataField={'id_precio_peso'}
            caption={'ID Precio Peso'}
            alignment="center"
            width={100}
          />
            <Column
            dataField={'address_departamento'}
            caption={'Departamento'}
            width={150}
          />
          <Column
            dataField={'address_distrito'}
            caption={'Distrito'}
            width={150}
          />
          <Column
            dataField={'rango_min'}
            caption={'Rango Mínimo'}
            alignment="center"
            width={120}
          />
          <Column
            dataField={'rango_max'}
            caption={'Rango Máximo'}
            alignment="center"
            width={120}
          />
          <Column
            dataField={'precio'}
            caption={'Precio'}
            alignment="center"
            width={100}
 
          />
          <Column
            dataField={'paquete_medidas'}
            caption={'Paqueta Medidas'}
            width={150}
          />
          {/* <Column
            dataField={'paquete_dimencion'}
            caption={'Paquete Dimensión'}
             alignment="center"
            width={150}
          /> */}
          <Column
            dataField={'pago_contra_entrega'}
            caption={'Pago Contra Entrega'}
            alignment="center"
            width={120}
          />
          <Column
            dataField={'hora_regresiva'}
            caption={'Hora Regresiva'}
            alignment="center"
            width={120}
          />
          <Column
            dataField={'hora_regresiva_descripcion'}
            caption={'Descripción Hora Regresiva'}
            width={200}
          />
        
          <Column
            dataField={'Activo'}
            caption={'Activo'}
            alignment="center"
           
          />

        </DataGrid>
      </ContentBox>
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
export default EmpleadosListPage;