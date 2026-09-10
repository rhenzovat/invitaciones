import React, { useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Button as ColumnButton,
  SearchPanel,
} from 'devextreme-react/data-grid';
import { Button as ButtonDev, SelectBox } from 'devextreme-react';
import Grid from '@mui/material/Grid';
import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente',   label: 'Pendiente' },
  { value: 'en_proceso',  label: 'En Proceso' },
  { value: 'resuelto',    label: 'Resuelto' },
  { value: 'rechazado',   label: 'Rechazado' },
];

const TIPOS = [
  { value: '',          label: 'Todos' },
  { value: 'complaint', label: 'Queja' },
  { value: 'claim',     label: 'Reclamo' },
];

const badgeEstado = (estado) => {
  const map = {
    pendiente:  { bg: '#fd7e14', color: '#fff', text: 'Pendiente' },
    en_proceso: { bg: '#0d6efd', color: '#fff', text: 'En Proceso' },
    resuelto:   { bg: '#198754', color: '#fff', text: 'Resuelto' },
    rechazado:  { bg: '#dc3545', color: '#fff', text: 'Rechazado' },
  };
  const cfg = map[estado] || { bg: '#6c757d', color: '#fff', text: estado };
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {cfg.text}
    </span>
  );
};

const badgeTipo = (tipo) => {
  const map = {
    complaint: { bg: '#ffc107', color: '#212529', text: 'Queja' },
    claim:     { bg: '#6610f2', color: '#fff',    text: 'Reclamo' },
  };
  const cfg = map[tipo] || { bg: '#6c757d', color: '#fff', text: tipo };
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
    }}>
      {cfg.text}
    </span>
  );
};

const LibroReclamoListPage = props => {
  const { accessButton, filtroEstado, filtroTipo, onFiltroEstadoChange, onFiltroTipoChange } = props;

  const verRegistro = evt => {
    props.verRegistro(evt.row.data);
  };

  const cellEstadoRender = e => badgeEstado(e.data.estado);
  const cellTipoRender   = e => badgeTipo(e.data.tipo_solicitud);

  const cellNumeroReclamo = e => (
    <strong style={{ color: '#0d6efd' }}>REC-{e.data.id_web_reclamos}</strong>
  );
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
      <ContentBox className="analytics">

        <div className="clsProgramacionAlinearBotonCrear">
          <h3 className="clsProgramacionAlinearBotonCrear-relative">
            {props.titulo}
          </h3>
        </div>

        {/* Filtros */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <SelectBox
              label="Filtrar por Estado"
              labelMode="floating"
              stylingMode="outlined"
              items={ESTADOS}
              displayExpr="label"
              valueExpr="value"
              value={filtroEstado}
              onValueChanged={e => onFiltroEstadoChange(e.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectBox
              label="Filtrar por Tipo"
              labelMode="floating"
              stylingMode="outlined"
              items={TIPOS}
              displayExpr="label"
              valueExpr="value"
              value={filtroTipo}
              onValueChanged={e => onFiltroTipoChange(e.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <ButtonDev
              text="Limpiar filtros"
              icon="clearformat"
              type="normal"
              stylingMode="outlined"
              onClick={() => { onFiltroEstadoChange(''); onFiltroTipoChange(''); }}
            />
          </Grid>
        </Grid>

        <DataGrid
          ref={gridRef}
          onContentReady={onGridContentReady}
          scrolling={{ mode: 'standard', showScrollbar: 'never', useNative: false }}
          keyExpr="id_web_reclamos"
          className={'dx-card wide-card'}
          dataSource={props.listarReclamos}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
        >
          <Paging defaultPageSize={15} />
          <Pager showPageSizeSelector={true} showInfo={true} allowedPageSizes={[10, 15, 25, 50]} />
          <FilterRow visible={false} />
          <SearchPanel visible={true} highlightCaseSensitive={false} placeholder="Buscar..." />

          <Column
            dataField="id_web_reclamos"
            caption="N° Reclamo"
            width={130}
            alignment="center"
            cellRender={cellNumeroReclamo}
          />

          <Column
            dataField="tipo_solicitud"
            caption="Tipo"
            width={110}
            alignment="center"
            cellRender={cellTipoRender}
          />

          <Column
            dataField="nombre_completo"
            caption="Nombre completo"
            minWidth={180}
          />

          <Column
            dataField="email"
            caption="Email"
            minWidth={180}
          />

          <Column
            dataField="telefono"
            caption="Teléfono"
            width={120}
            alignment="center"
          />

          <Column
            dataField="departamento"
            caption="Departamento"
            width={130}
          />

          <Column
            dataField="estado"
            caption="Estado"
            width={130}
            alignment="center"
            cellRender={cellEstadoRender}
          />

          <Column
            dataField="fecha_registro"
            caption="Fecha Registro"
            dataType="datetime"
            format="dd/MM/yyyy HH:mm"
            width={160}
            alignment="center"
          />

          <Column
            dataField="fecha_atencion"
            caption="Fecha Atención"
            dataType="datetime"
            format="dd/MM/yyyy HH:mm"
            width={160}
            alignment="center"
          />

          <Column
            type="buttons"
            visible={true}
            fixed={true}
            fixedPosition="right"
            caption="Acciones"
            width={90}
          >
            <ColumnButton
              icon="eyeopen"
              hint="Ver detalle / Gestionar"
              onClick={verRegistro}
              visible={accessButton.editar ? true : false}
            />
            <ColumnButton
              icon="trash"
              hint="Eliminar"
              onClick={e => props.eliminarRegistro(e.row.data)}
              visible={accessButton.eliminar ? true : false}
            />
          </Column>

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
};

export default LibroReclamoListPage;
