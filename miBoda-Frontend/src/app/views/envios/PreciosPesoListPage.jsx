import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Button as ColumnButton,
  SearchPanel,
} from 'devextreme-react/data-grid';
import { Button as ButtonDev } from 'devextreme-react';

const PreciosPesoListPage = (props) => {

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
    <div className="container mt-3">
      <div className="clsProgramacionAlinearBotonCrear">
        <h3 className="clsProgramacionAlinearBotonCrear-relative">
          {props.titulo}
        </h3>
        <div>
          <ButtonDev
            icon="mdi mdi-file-excel-outline"
            className="clsMr-1"
            type="default"
            onClick={() => props.descargaReporte()}
            text="Descargar"
          />

          <ButtonDev
            icon="mdi mdi-upload"
            type="default"
            onClick={props.triggerFileInput}
            visible={props.accessButton.crear} // o puedes crear un permiso específico para importar
            text="Importar Excel"
          />
        </div>
        <input
          type="file"
          ref={props.fileInputRef}
          onChange={props.handleImportExcel}
          accept=".xlsx, .xls, .csv"
          style={{ display: 'none' }}
        />

      </div>

      <DataGrid
        keyExpr="id_producto"
        className="dx-card wide-card"
        dataSource={props.listarPrecios}
        showBorders={false}
        focusedRowEnabled={true}
        defaultFocusedRowIndex={0}
        columnAutoWidth={true}
        rowAlternationEnabled={true}
      >
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />  {/* Filtro por columna */}
        <SearchPanel
          visible={true}
          highlightCaseSensitive={false}
          placeholder="Buscar en todas las columnas..."
        />
        <Column dataField="id_producto" caption="ID" width={"10%"} alignment="center" />
        <Column
          dataField="codigo_producto"
          caption="codigo_producto"
        />
        <Column
          dataField="nombre"
          caption="nombre"
          width={"15%"}
        />

        <Column
          dataField="precio"
          caption="precio"
        />
        <Column
          dataField="peso_kilogramo"
          caption="peso_kilogramo"

        />

        <Column
          dataField="paquete_medidas"
          caption="paquete_medidas"

        />

        {/* <Column
          dataField="paquete_dimencion"
          caption="paquete_dimencion"
          width={"10%"}
          cellRender={({ data }) => {
            const dimension = data.paquete_dimencion;
            switch (dimension) {
              case '1': return "Pequeño";
              case '2': return "Mediano";
              case '3': return "Grande";
              default: return "Desconocido";
            }
          }}
        /> */}

        <Column
          dataField="Activo"
          caption="Activo"
          width={"8%"}
          alignment="center"
          cellRender={cellEstadoRender}
        />
        <Column type="buttons" fixedPosition="right" width={"10%"}  caption={'Acciones'}>
          <ColumnButton
            icon="eyeopen"
            hint="Ver Detalle"
            onClick={(e) => props.editarRegistro(e.row.data)}
          />

        </Column>
      </DataGrid>


    </div>
  );
};

export default PreciosPesoListPage;
