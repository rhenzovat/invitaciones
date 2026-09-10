import React from "react";
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

const PromocionListPage = props => {
  const { accessButton } = props;
  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
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

  return (
    <>
      <div className="container mt-3">

        <div className="clsProgramacionAlinearBotonCrear" >
          <h3 className="clsProgramacionAlinearBotonCrear-relative">
            {props.titulo}
          </h3>
          <ButtonDev
            icon="mdi mdi-plus" className="idRef65654 clsButtomOperation"
            type="default"
            onClick={props.nuevoRegistro}
            visible={accessButton.crear ? true : false}
          />
        </div>

        <DataGrid
          keyExpr="id_promociones"
          className={'dx-card wide-card'}
          dataSource={props.listarUsuario}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
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
            dataField={'id_promociones'}
            caption={'Código'}
            width={100}
            alignment={"center"}
          />

          <Column
            dataField={'nombre'}
            caption={'Nombre'}
          />
          <Column
            dataField={'descripcion'}
            caption={'Descripcion'}
          />

          <Column
            dataField={'start_date'}
            caption={'Fecha Inicio'}
            dataType="date" format="dd/MM/yyyy" alignment={"center"}
          />
          <Column
            dataField={'end_date'}
            caption={'Fecha Final'}
            dataType="date" format="dd/MM/yyyy" alignment={"center"}
          />
          <Column
            dataField={'created_at'}
            caption={'Fecha Creación'}
            dataType="date" format="dd/MM/yyyy" alignment={"center"}
          />
          <Column
            dataField={'Activo'}
            caption={'Activo'}
            width={"10%"}
            cellRender={cellEstadoRender}
          />
          <Column
            type="buttons"
            visible={true}
            fixed={true}
            fixedPosition="right"
             caption={'Acciones'}
          >
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
    </>
  );
}
export default PromocionListPage;