import React, { Fragment, useState, useEffect, useRef, Children } from 'react';
// import { PaginationSetting } from '../../../../_metronic/utils/utils';
import { DataGrid, Column, Button as ColumnButton, Selection, TotalItem, Summary } from "devextreme-react/data-grid";
// // import Pagination from "react-bootstrap-4-pagination";
// import Pagination from "@tcoldmf/react-bootstrap-pagination";
import './DataGridDynamic.css';
import { intlFormat } from 'date-fns';
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
  // console.log("DataGridDynamic", { staticColumns });
  const childrenCols = Children.toArray(children);
  // const [totalPages, setTotalPages] = useState(0);
  // const [currentPage, setCurrentPage] = useState(1);
  // // const [showMax, setShowMax] = useState(PaginationSetting.SHOW_MAX);
  // const [viewPagination, setViewPagination] = useState(false);
  // const [summaryCountText, setSummaryCountText] = useState('0 de 0');
  // const pageSize = PaginationSetting.TOTAL_RECORDS;


  const onChangePage = async (page) => {
    // let newShowMax = showMax;

    // setCurrentPage(page);

    // let skip = ((page - 1) * pageSize);
    // let take = pageSize;

    // refreshDataSource(skip, take);
    // if (page === totalPages) { //Estoy en la ultima pagina:
    //   newShowMax = 2;
    // } else {
    //   //Retorno de ultima pagina:
    //   if (totalPages - page >= Math.floor(PaginationSetting.SHOW_MAX / 2)) {
    //     newShowMax = PaginationSetting.SHOW_MAX;
    //   } else {
    //     newShowMax = totalPages - page + 1
    //     //console.log(".................> ", newShowMax);
    //   }
    // }
    // if (showMax !== newShowMax) setShowMax(newShowMax);

  }

  // const cargarSummaryItems = (totalItems) => {
  //   return <Summary calculateCustomSummary={calculateCustomSummary}>{
  //     totalItems.map(x => {
  //       if (x.summaryType === "custom") {
  //         return (<TotalItem
  //           summaryType={x.summaryType}
  //           displayFormat={x.displayFormat}
  //           name={"Summary" + x.column}
  //           showInColumn={x.column}
  //         />)
  //       } else {
  //         return (<TotalItem
  //           column={x.column}
  //           summaryType={x.summaryType}
  //         />)
  //       }
  //     })
  //   }
  //   </Summary>
  // }
  const cargarColumnasDinamicas = (columnas) => {
    // console.log("cargarColumnasDinamicas", { columnas });
    return columnas.map(
      x => {
        x.items = x.items || [];
        // console.log(x);

        if (!x.hasOwnProperty('alignment')) {
          x.alignment = "left";
        }

        if (x.items.length > 0) {
          return (
            <Column
              key={x.dataField}
              caption={x.caption}
              alignment="center"
              {...x.events}
            >
              {
                x.items.map(y => (
                  (!!y && y.name && y.name !== "") ? (
                    <Column
                      key={`D1_${y.dataField}`}
                      caption={y.name}
                      alignment={y.hasOwnProperty('alignment') ? y.alignment : 'left'}
                    >
                      < Column
                        key={`D2_${y.dataField}`}
                        dataField={y.dataField}
                        caption={y.caption}
                        width={y.width}
                        alignment={y.hasOwnProperty('alignment') ? y.alignment : 'left'}
                        {...y.events}
                      ></Column>
                    </Column>
                  ) : (!!y ? (
                    < Column
                      key={`D1_${y.dataField}`}
                      dataField={y.dataField}
                      caption={y.caption}
                      width={y.width}
                      alignment={y.hasOwnProperty('alignment') ? y.alignment : 'left'}
                      {...y.events}
                    />) : null
                  )
                ))
              }
            </Column>
          );
        } else {
          return <Column
            key={x.dataField}
            dataField={x.dataField}
            // format={x.format}
            caption={x.caption}
            width={x.width}
            alignment={x.alignment}
            {...x.events}
          />
        }
      }
    )

  }

  const cargarColumnasButtons = (columnas) => {
    if (columnas.length > 0) {
      //console.log("columnas", columnas);
      if (columnas[0].items) {
        return (<Column type="buttons" width={70}  >
          <ColumnButton icon="event" hint={"Ver Marcaciones"}  {...columnas[0].items[0].events} />
        </Column>)
      }
    }

  }


  // function calcularPaginacion(resultados) {
  //   console.log("calcularPaginacion", { resultados });
  //   if (resultados.length > 0) {
  //     let totalRegistros = resultados[0].TotalCount;

  //     if (totalRegistros > pageSize) {
  //       let totalRegistroResultado = resultados.length;

  //       // setTotalPages(Math.round(totalRegistros / pageSize));
  //       setSummaryCountText(`${totalRegistroResultado} de ${totalRegistros} registros`);
  //       setViewPagination(true);
  //     } else {
  //       setViewPagination(false);
  //     }
  //   } else {
  //     setViewPagination(false);
  //   }
  // }

  // useEffect(() => {
  //   if (isLoadedResults) {
  //     // calcularPaginacion(dataSource);
  //     setIsLoadedResults(false);
  //   }
  // }, [isLoadedResults]);


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
        // selectionMod
        //className={className}
        id={id}
        {...events}
        ref={dataGridRef}
        scrolling={{ showScrollbar: 'always' }} // add scroll style blue
        className="tablaScrollHorizontal" // add scroll style blue
        // onSelectionChanged={(e => onSelectionChanged(e))} 
        // getSelectedRow={selectedRow}  
        rowAlternationEnabled={true}
      >
        <Selection mode={selectionMode} />
        {/* {!!childrenCols && childrenCols.map(x => (x))} */}
        {cargarColumnasDinamicas(staticColumns)}
        {cargarColumnasDinamicas(dynamicColumns)}
        {/* 
        {cargarColumnasButtons(staticColumnsButtons)} */}
        {/* {cargarSummaryItems(summaryItems)} */}

      </DataGrid>
      {/* *********************************************************** */}
      {/* {viewPagination ? (
        // <div className="vcg-wrapper-pagination">
        <div className="cls_paginado">
          <span className="dx-datagrid-summary-item dx-datagrid-text-content summaryPagination classColorPaginador_" >{summaryCountText}</span>
          <Pagination
            threeDots
            prevNext
            shadow={false}
            size={'md'}
            totalPages={totalPages}
            showMax={showMax}
            color="#cc292e"
            activeBgColor="#cc292e"
            activeBorderColor="#164873"
            currentPage={currentPage}
            onClick={onChangePage}
          />
        </div>) : null} */}
      {/* *********************************************************** */}


    </Fragment>
  );
};

export default DataGridDynamic;
