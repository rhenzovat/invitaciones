import React from "react";
import { styled, } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
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

// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const VendedorListPage = props => {
  const { accessButton } = props;
  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = evt => {
    props.eliminarRegistro(evt.row.data, false);
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

  return (
    <>
    {
       
      console.log('%c [test]-71', 'font-size:13px; background:pink; color:#bf2c9f;', accessButton)
    }
      <ContentBox className="analytics">

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
          keyExpr="id_vendedor"
          className={'dx-card wide-card'}
          dataSource={props.listarUsuario}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          // columnHidingEnabled={true}
          rowAlternationEnabled={true}
          onContextMenuPreparing={contextMenuHandler}
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
            dataField={'id_vendedor'}
            caption={'Código'}
            width={100}
            alignment={"center"}
          />

          <Column
            dataField={'nombre'}
            caption={'Nombre / Apellidos'}
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
            // calculateCellValue={obtenerCampoActivo}
            cellRender={cellEstadoRender}
          />
          <Column
            type="buttons"
            visible={true}
          // fixed={true}
          // fixedPosition="right"
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
      </ContentBox>
    </>
  );
}
export default VendedorListPage;