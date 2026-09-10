import React, { useEffect, useState } from "react";
import { styled, } from "@mui/material/styles";
import { useIntl, injectIntl } from "react-intl";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  SearchPanel,
  // Editing, Summary, TotalItem
} from 'devextreme-react/data-grid';
import Button from "@mui/material/Button";
import DoneIcon from '@mui/icons-material/Done';
import { isNotEmpty } from "../../../utils/utils";
import { handleInfoMessages, toastSuccess } from "../../../components/notify-messages";
// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const EmpleadosListPage = props => {
  const intl = useIntl();
  const [selectedRow, setSelectedRow] = useState([]);

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) setSelectedRow([{ ...evt.row.data }]);
    // if (isNotEmpty(evt.row.data)) {
    //   props.seleccionarRegistro(evt.row.data);
    // }
  }

  function aceptar() {
    if (selectedRow.length > 0) {
      props.selectData(selectedRow);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }
  }

  return (
    <>
      <ContentBox className="mt-1">

        <div className="clsProgramacionAlinearBotonCrear" >
          <h2 className="clsProgramacionAlinearBotonCrear-relative"></h2>
          <Button
            className="clsBotonAceptar"
            variant="outlined"
            color="success"
            startIcon={<DoneIcon />}
            onClick={aceptar}
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
          onFocusedRowChanged={seleccionarRegistro}
          onRowDblClick={seleccionarRegistroDblClick}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />
          <FilterRow visible={false} />
          <SearchPanel
            visible={true}
            highlightCaseSensitive={false}
          />
          <Column
            dataField={'id_empleado'}
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
            dataField={'dni'}
            caption={'DNI'}
            width={"25%"}
          />
        </DataGrid>
      </ContentBox>
    </>
  );
}
export default EmpleadosListPage;