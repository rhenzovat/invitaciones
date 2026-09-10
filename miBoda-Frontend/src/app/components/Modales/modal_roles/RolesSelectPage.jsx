import React, { useEffect, useState } from "react";
import { styled, } from "@mui/material/styles";
import { useIntl, } from "react-intl";
import DataGrid, {
  Selection,
  Column,
  Pager,
  Paging,
  FilterRow,
  SearchPanel,
  // Editing, Summary, TotalItem
} from 'devextreme-react/data-grid';
import Button from "@mui/material/Button";
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CloseIcon from '@mui/icons-material/Close';

import { isNotEmpty } from "../../../utils/utils";
import { handleInfoMessages, toastSuccess } from "../../../components/notify-messages";
// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const RolesSelectPage = props => {
  const intl = useIntl();
  const [selectedRow, setSelectedRow] = useState([]);

  const grabar = () => {
    let dataResult = selectedRow.map(x => x.id_roles).join('|');
    props.registrarRoles(dataResult);
  }

  const seleccionarRegistro = (evt) => {
    if (evt.selectedRowsData !== undefined) {
      if (isNotEmpty(evt.selectedRowsData)) {
        setSelectedRow(evt.selectedRowsData);

      }
    }
  }

  function cerrar() {
    props.setModoEdicion(false);
  }

  return (
    <>
      <ContentBox className="mt-1">

        <div className="clsPerfilModalBotones" >
          <Button
            className="clsBotonAceptar"
            variant="outlined"
            color="success"
            startIcon={<SaveIcon />}
            onClick={grabar}
          />
          <Button
            className="clsBotonAceptar cls-ml-1"
            variant="outlined"
            color="success"
            startIcon={<CloseIcon />}
            onClick={cerrar}
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
          <Column
            dataField={'id_roles'}
            caption={'Código'}
            width={"20%"}
            alignment={"center"}
          />
          <Column
            dataField={'nombre'}
            caption={'Nombre'}
            width={"25%"}
          />
        </DataGrid>
      </ContentBox>
    </>
  );
}
export default RolesSelectPage;