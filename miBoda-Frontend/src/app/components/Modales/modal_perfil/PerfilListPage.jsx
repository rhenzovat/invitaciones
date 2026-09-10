import React, { useEffect, useState } from "react";
import { styled, } from "@mui/material/styles";
import { useIntl, } from "react-intl";
import DataGrid, {
  Column,
  Selection,
  Pager,
  Paging,
  FilterRow,
  SearchPanel,
  Button as ColumnButton,
  // Editing, Summary, TotalItem
} from 'devextreme-react/data-grid';
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { isNotEmpty } from "../../../utils/utils";
import { handleInfoMessages, toastSuccess } from "../../../components/notify-messages";
// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const PerfilListPage = props => {
  const intl = useIntl();
  const [selectedRow, setSelectedRow] = useState([]);


  const eliminarMultiple = () => {
    let dataResult = selectedRow.map(x => x.id_perfil_users).join('|');
    props.eliminarPerfilMultiple(dataResult);
  }

  const seleccionarRegistro = (evt) => {
    if (evt.selectedRowsData !== undefined) {
      if (isNotEmpty(evt.selectedRowsData)) {
        setSelectedRow(evt.selectedRowsData);

      }
    }
  }

  function nuevoPerfil() {
    props.setModoEdicion(true);//Se redirecciona al nuevo modal de asignación de perfiles
  }


  const eliminarRegistro = evt => {
    props.eliminarRegistro(evt.row.data, false);
  };

  const obtenerPerfiles = evt => {
    props.selectData(evt.row.data)
  };

  return (
    <>
      <ContentBox className="mt-1">

        <div className="clsPerfilModalBotones" >

          <Button
            className={`clsBotonAceptar  ${selectedRow.length > 0 ? '' : 'clsOpacidad'} `}
            variant="outlined"
            color="success"
            startIcon={<DeleteOutlineIcon />}
            onClick={eliminarMultiple}
            disabled={selectedRow.length > 0 ? false : true}
          />
          <Button
            className="clsBotonAceptar cls-ml-1"
            variant="outlined"
            color="success"
            startIcon={<AddIcon />}
            onClick={nuevoPerfil}
          />

        </div>

        <DataGrid
          keyExpr="RowIndex"
          className={'dx-card wide-card'}
          dataSource={props.listarDatos}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
          onSelectionChanged={seleccionarRegistro}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />
          <Selection mode={"multiple"} />

          <Column dataField={'id_perfil_users'} visible={false} />
          <Column
            dataField={'id_perfil'}
            caption={'Código'}
            width={"20%"}
            alignment={"center"}
          />
          <Column
            dataField={'nombre'}
            caption={'Nombre'}
            width={"25%"}
          />
          <Column
            type="buttons"
            visible={true}
          >
            <ColumnButton
              icon="trash"
              hint={"Eliminar"}
              onClick={eliminarRegistro}
            />

          </Column>

          <Column
            type="buttons"
            visible={true}
            caption={'Asig. Roles'}>
            <ColumnButton
              icon="card"
              hint={"Seleccione Rol"}
              onClick={obtenerPerfiles}
            />

          </Column>
        </DataGrid>
      </ContentBox>
    </>
  );
}
export default PerfilListPage;