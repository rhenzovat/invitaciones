import React from "react";
import { styled, } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";
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

const FacturasListPage = props => {

  const { accessButton } = props;

  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };


  return (
    <>

      <div className="container mt-4">
        <div className="clsProgramacionAlinearBotonCrear" >
          <h3 className="clsProgramacionAlinearBotonCrear-relative">
            {props.titulo}
          </h3>
        </div>
        <DataGrid
          keyExpr="RowIndex"
          className={'dx-card wide-card'}
          dataSource={props.listarProductos}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          // columnHidingEnabled={true}
          rowAlternationEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />
          <FilterRow visible={false} />
          <SearchPanel
            visible={true}
            highlightCaseSensitive={true}
          />
          <Column
            dataField={'id_pedido'}
            caption={'IdPedido'}
            width={100}
            alignment={"center"}
          />
          <Column
            dataField={'created_at'}
            caption={'Fecha'}
            dataType="date" format="dd/MM/yyyy" alignment={"center"}
          />

          <Column
            dataField={'codigo_pedido'}
            caption={'Código'}
            width={100}
            alignment={"center"}
          />


          <Column
            dataField={'cliente_nombre'}
            caption={'Cliente'}
          />
          <Column
            dataField={'direccion_envio_ubicacion'}
            caption={'Dirección'}
            width={150}

          />

          <Column
            dataField={'pro_costo_envio'}
            caption={'Envio S/'}
          />
          <Column
            dataField={'pro_igv'}
            caption={'Sin IGV %'}
          />


          <Column
            dataField={'pro_igv_sin'}
            caption={'Con IGV %'}
          />

          <Column
            dataField={'pro_total'}
            caption={'Total S/'}
          />

          <Column
            type="buttons"
            visible={true}
            fixed={true}
            fixedPosition="right"
               caption={'Acciones'}
          >

            <ColumnButton
              icon="eyeopen"
              hint={"Detalle Factura"}
              onClick={editarRegistro}
              visible={accessButton.editar ? true : false}
            />
            <ColumnButton
              icon="pdffile"
              hint={"Generar PDF"}
              onClick={editarRegistro}
              visible={accessButton.editar ? true : false}
            />

          </Column>

        </DataGrid>
      </div>
    </>
  );
}
export default FacturasListPage;