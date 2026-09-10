import React, { useRef, useState } from "react";
import { Box, IconButton } from '@mui/material';
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Button as ColumnButton,
  SearchPanel,
  // Editing, Summary, TotalItem
} from 'devextreme-react/data-grid';
import { Button as ButtonDev } from 'devextreme-react';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const EmpleadosListPage = props => {
  const { accessButton } = props;

  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = evt => {
    props.eliminarRegistro(evt.row.data, false);
  };

  const asignarUsuario = evt => {
    props.openModalAsignarUsuario(evt.row.data);
  };

  const contextMenuHandler = (e) => {
    if (e.row.rowType === "data") {
      e.items = [{
        icon: "edit",
        text: "Editar",
        onItemClick: function () {
          // e.component.editRow(e.row.rowIndex);
          props.editarRegistro();
        }
      },
      {
        icon: "trash",
        text: "Eliminar",
        onItemClick: function () {
          e.component.addRow();
        }
      },
      ];
    }
  }

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
      <div className="content-box analytics">

        <div className="clsProgramacionAlinearBotonCrear" >
          <h3 className="clsProgramacionAlinearBotonCrear-relative">
            {props?.titulo}
          </h3>
          <ButtonDev
            icon="mdi mdi-plus" className="idRef65654 clsButtomOperation"
            type="default"
            onClick={props.nuevoRegistro}
            visible={accessButton.crear ? true : false}
          />
        </div>

        <DataGrid
          ref={gridRef}
          onContentReady={onGridContentReady}
          keyExpr="id_empleado"
          className={'dx-card wide-card'}
          dataSource={props.listarUsuario}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          // columnHidingEnabled={true}
          rowAlternationEnabled={true}
          onContextMenuPreparing={contextMenuHandler}
          scrolling={{ mode: 'standard', showScrollbar: 'never', useNative: false }}
        // onEditingStart={editarRegistro}

        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />
          <FilterRow visible={false} />
          <SearchPanel
            visible={true}
            highlightCaseSensitive={true}
            placeholder="Buscar..."
          />

          <Column
            dataField={'id_empleado'}
            caption={'Código'}
            width={100}
            alignment={"center"}
          />

          <Column
            dataField={'nombre'}
            caption={'Nombre'}
          />
          <Column
            dataField={'apellido'}
            caption={'Apellido'}
          />
          <Column
            dataField={'telefono'}
            caption={'Teléfono'}
          />
          <Column
            dataField={'email'}
            caption={'Email'}
          />
          <Column
            dataField={'id_usuario'}
            caption={'IdUsuario'}
            alignment={"center"}

          />
          <Column
            dataField={'nombre_usuario'}
            caption={'Usuario'}
          />
          <Column
            dataField={'direccion'}
            caption={'Direccion'}
          />
          <Column
            dataField={'dni'}
            caption={'DNI'}
          />
          <Column
            dataField={'created_at'}
            caption={'Fecha Creación'}
            dataType="date" format="dd/MM/yyyy" alignment={"center"}
          />

          <Column
            dataField={'Activo'}
            caption={'Activo'}
            width={80}
            // calculateCellValue={obtenerCampoActivo}
            cellRender={cellEstadoRender}
          />
          <Column
            type="buttons"
            visible={true}
            fixed={true}
            // fixedPosition="right"
            width={100}
            alignment={"center"}
             caption={'Acciones'}
          >
            {/* <ColumnButton
              icon="user"
              hint={"Asignar usuario"}
              onClick={asignarUsuario}
            // visible={accessButton.editar ? true : false}
            /> */}
            <ColumnButton
              icon="edit"
              hint={"Editar"}
              onClick={editarRegistro}
              visible={accessButton.editar ? true : false}
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
export default EmpleadosListPage;