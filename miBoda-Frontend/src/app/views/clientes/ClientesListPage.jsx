import React from "react";
import { styled, Tooltip, IconButton } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
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

const ClientesListPage = props => {
  const { accessButton } = props;
  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = evt => {
    props.eliminarRegistro(evt.row.data, false);
  };

  const abrirOnboarding = evt => {
    if (props.abrirOnboarding) props.abrirOnboarding(evt.row.data);
  };

  const cellOnboardingRender = (e) => (
    <Tooltip title="Gestionar enlace de onboarding">
      <IconButton size="small" color="primary" onClick={() => props.abrirOnboarding && props.abrirOnboarding(e.data)}>
        <LinkIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

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
          keyExpr="id_cliente"
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
          <Pager showPageSizeSelector={true} showInfo={true} infoText="Página {0} de {1} ({2} registros)" />
          <FilterRow visible={false} />
          <SearchPanel
            visible={true}
            highlightCaseSensitive={true}
            placeholder="Buscar..."
          />

          <Column
            dataField={'id_cliente'}
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
            caption={'apellido'}
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
            dataField={'direccion'}
            caption={'Direccion'}
          />
          <Column
            dataField={'ruc'}
            caption={'RUC'}
          />
          <Column
            dataField={'razon_social'}
            caption={'razon_social'}
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
            caption="Onboarding"
            width={100}
            alignment="center"
            cellRender={cellOnboardingRender}
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
      </ContentBox>
    </>
  );
}
export default ClientesListPage;