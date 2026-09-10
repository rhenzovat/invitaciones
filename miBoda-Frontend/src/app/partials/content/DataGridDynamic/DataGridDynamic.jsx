import React, { Fragment, useState, useEffect, useRef, Children } from 'react';


import DataGrid, {
  Column,
  Export,
  Selection,
  Pager,
  Paging,
  FilterRow,
  Button as ColumnButton,
  SearchPanel,
  ColumnChooser,
  ColumnChooserSearch,
  ColumnChooserSelection,
  Position,
  StateStoring,
  // Editing, Summary, TotalItem
} from 'devextreme-react/data-grid';

import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';

const onExporting = (e) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Carguio');
  exportDataGrid({
    component: e.component,
    worksheet,
    autoFilterEnabled: true,
  }).then(() => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'reporte_carguio.xlsx');
    });
  });
};

const columnChooserModes = [
  {
    key: 'dragAndDrop',
    name: 'Drag and drop',
  },
  {
    key: 'select',
    name: 'Select',
  },
];

const searchEditorOptions = { placeholder: 'Search column' };




const DataGridDynamic = ({
  id = "DataGridDynamic",
  dataSource = [],
  staticColumns = [],
  dynamicColumns = [],
  events = {},
  className = "datagrid_sin_sombra",
  isLoadedResults = false,
  setIsLoadedResults = () => { },
  refreshDataSource = () => { },
  keyExpr = "",
  dataGridRef = null,
  staticColumnsButtons = [],
  selectionMode = "single",
  summaryItems = [],
  calculateCustomSummary = () => { },
  children = null,
  // setSelectedRow= () => { },   
}) => {

  //======== FILTROS PERSONALIZADOS ==========
  const [mode, setMode] = useState(columnChooserModes[1].key);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [allowSelectAll, setAllowSelectAll] = useState(true);
  const [selectByClick, setSelectByClick] = useState(true);
  const [recursive, setRecursive] = useState(true);

  return (
    <Fragment>

      <DataGrid
        dataSource={dataSource}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr={keyExpr}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        id={id}
        {...events}
        ref={dataGridRef}
        scrolling={{ showScrollbar: 'always' }} // add scroll style blue
        className="tablaScrollHorizontal" // add scroll style blue
        rowAlternationEnabled={true}
        onExporting={onExporting}
      >

        <Selection mode="multiple" />
        <Export
          enabled={true}
          allowExportSelectedData={true}
        />
        {/* ======== FILTROS PERSONALIZADOS ========== */}
        <SearchPanel
          visible={true}
          highlightCaseSensitive={true}
        />
        <StateStoring enabled={true} type="localStorage" storageKey="storage" />
        <ColumnChooser
          height="340px"
          enabled={true}
          mode={mode}
        >
          <Position
            my="right top"
            at="right bottom"
            of=".dx-datagrid-column-chooser-button"
          />

          <ColumnChooserSearch
            enabled={searchEnabled}
            editorOptions={searchEditorOptions}
          />

          <ColumnChooserSelection
            allowSelectAll={allowSelectAll}
            selectByClick={selectByClick}
            recursive={recursive}
          />
        </ColumnChooser>

      </DataGrid>
    </Fragment>
  );
};

export default DataGridDynamic;
