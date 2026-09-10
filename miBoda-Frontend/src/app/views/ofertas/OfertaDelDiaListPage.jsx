import React, { useState } from "react";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Button as ColumnButton,
  SearchPanel,
} from 'devextreme-react/data-grid';
import { Button as ButtonDev } from 'devextreme-react';

const OfertaDelDiaListPage = ({ ofertas, ...props }) => {

  const [visibleModalImagenProducto, setVisibleModalImagenProducto] = useState(false);

  const editarRegistro = (e) => {
    props.editarRegistro(e.row.data);
  };

  const eliminarRegistro = (e) => {
    props.eliminarOferta(e.row.data.id_oferta_dia, false);
  };

 

  const cellEstadoRender = (e) => {
    return e.data.Activo === "S"
      ? <i className="mdi mdi-check-circle-outline clsFontSizeCheck" />
      : <i className="mdi mdi-close-circle-outline clsFontSizeCheckRed" />;
  };

  const cellProductoRender = (e) => {
    return e.data.producto?.nombre || "N/A";
  };

  return (
    <div className="container mt-3">
      <div className="clsProgramacionAlinearBotonCrear">
        <h3 className="clsProgramacionAlinearBotonCrear-relative">
          {props.titulo}
        </h3>
        <div>
          
          <ButtonDev
            icon="mdi mdi-plus"
            className="idRef65654 clsButtomOperation"
            type="default"
            onClick={props.nuevoRegistro}
            visible={props.accessButton.crear}
          />
        </div>

      </div>

      <DataGrid
        keyExpr="id_oferta_dia"
        className="dx-card wide-card"
        dataSource={ofertas}
        showBorders={false}
        focusedRowEnabled={true}
        defaultFocusedRowIndex={0}
        columnAutoWidth={true}
        rowAlternationEnabled={true}
      >
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={false} />
        <SearchPanel visible={true} highlightCaseSensitive={true} placeholder="Buscar..."/>

        <Column dataField="id_oferta_dia" caption="Código" width={100} alignment="center" />
        <Column dataField="nombre_oferta" caption="Nombre oferta" />
        <Column
          caption="Producto"
          cellRender={cellProductoRender}
          width="20%"
        />
        <Column
          dataField="precio_oferta"
          caption="Precio oferta"
          dataType="number"
          format="S/ #,##0.##"
          width="10%"
          alignment={"center"}
        />
        <Column
          dataField="start_time"
          caption="Fecha inicio"
          dataType="datetime"
          format="dd/MM/yyyy HH:mm"
          width="10%"

        />
        <Column
          dataField="end_time"
          caption="Fecha fin"
          dataType="datetime"
          format="dd/MM/yyyy HH:mm"
          width="10%"

        />
        <Column
          dataField="cantidad_disponible"
          caption="Disponibles"
          dataType="number"
          width="10%"
          alignment={"center"}
        />
        <Column
          dataField="Activo"
          caption="Estado"
          width="10%"
          alignment={"center"}
          cellRender={cellEstadoRender}
        />
        <Column type="buttons"  caption={'Acciones'} fixedPosition="right">
          <ColumnButton
            icon="edit"
            hint="Editar"
            onClick={editarRegistro}
            visible={props.accessButton.editar}
          />
          <ColumnButton
            icon="trash"
            hint="Eliminar"
            onClick={eliminarRegistro}
            visible={props.accessButton.eliminar}
          />
        </Column>
      </DataGrid>
 

    </div>
  );
};

export default OfertaDelDiaListPage;