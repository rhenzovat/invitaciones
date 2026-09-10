import React, { useState, useEffect, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CategoryIcon from "@mui/icons-material/Category";
import DataGrid, {
  Column,
  MasterDetail,
  Pager,
  Paging,
  Editing,
  Popup,
  Form,
} from "devextreme-react/data-grid";
import { Item } from "devextreme-react/form";
import CategoriaSubListPage from "./CategoriaSubListPage";
import { listarEstadoSimple } from "../../utils/utils";

const PageContainer = styled("div")(({ theme }) => ({
  padding: "1.5rem 2rem",
  [theme.breakpoints.down("sm")]: { padding: "1rem" },
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "1.5rem",
  paddingBottom: "1rem",
  borderBottom: `2px solid ${theme.palette.primary.main}`,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
  "& .dx-datagrid": {
    border: "none",
  },
}));

const CategoriaListPage = (props) => {
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [tituloModal, setTituloModal] = useState("");

  useEffect(() => {
    setEstadoSimple(listarEstadoSimple());
  }, []);

  const onInsert = useCallback(async (e) => {
    e.cancel = true;
    await props.agregarCategoria(e.data);
    e.component.cancelEditData();
  }, [props.agregarCategoria]);

  const onUpdate = useCallback(async (e) => {
    e.cancel = true;
    const resolvedId =
      e?.oldData?.id_producto_categoria ??
      e?.oldData?.id ??
      e?.oldData?.Codigo ??
      (typeof e?.key === "number" ? e.key : undefined);

    // En algunos flujos de "nuevo", DevExtreme dispara update con key temporal.
    // Si no hay id real pero sí nombre, lo tratamos como inserción.
    if (!resolvedId && e?.newData?.nombre) {
      const payloadCrear = {
        ...e.oldData,
        ...e.newData,
      };
      await props.agregarCategoria(payloadCrear);
      e.component.cancelEditData();
      return;
    }

    if (!resolvedId) {
      return;
    }

    await props.actualizarCategoria({
      ...e.oldData,
      ...e.newData,
      id_producto_categoria: resolvedId,
    });
    e.component.cancelEditData();
  }, [props.actualizarCategoria, props.agregarCategoria]);

  const onDelete = useCallback((e) => {
    e.cancel = true;
    props.eliminarRegistro(e.data, false);
  }, [props.eliminarRegistro]);

  const cellEstadoRender = useCallback((e) => {
    const estado = e.data.Activo;
    if (estado === "S") {
      return <i className="mdi mdi-check-circle-outline clsFontSizeCheck" />;
    }
    if (estado === "N") {
      return <i className="mdi mdi-close-circle-outline clsFontSizeCheckRed" />;
    }
    return null;
  }, []);

  const renderMasterDetail = useCallback((opt) => {
    return (
      <CategoriaSubListPage
        datosSubCategorias={opt.data.data}
        registrarSubCategoria={props.registrarSubCategoria}
        actualizarSubCategoria={props.actualizarSubCategoria}
        eliminarSubCategoria={props.eliminarSubCategoria}
      />
    );
  }, [props.registrarSubCategoria, props.actualizarSubCategoria, props.eliminarSubCategoria]);

  return (
    <PageContainer>
      <PageHeader>
        <CategoryIcon color="primary" sx={{ fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600} color="text.primary">
          Categorias
        </Typography>
      </PageHeader>

      <StyledCard elevation={1}>
        <DataGrid
          keyExpr="id_producto_categoria"
          dataSource={props.listarCategorias}
          showBorders={false}
          focusedRowEnabled={true}
          defaultFocusedRowIndex={0}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
          onRowInserting={onInsert}
          onRowUpdating={onUpdate}
          onRowRemoving={onDelete}
          onInitNewRow={() => setTituloModal("Crear Categoria")}
          onEditingStart={() => setTituloModal("Editar Categoria")}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} 
          infoText="Página {0} de {1} ({2} registros)"
          />

          <Editing
            mode="popup"
            allowAdding={true}
            allowUpdating={true}
            allowDeleting={true}
            confirmDelete={false}
            useIcons={true}
            texts={{
            addRow: "Agregar",
            editRow: "Editar",
            deleteRow: "Eliminar",
            saveRowChanges: "Guardar",
            cancelRowChanges: "Cancelar",
            undeleteRow: "Deshacer",
            }}
          >
            <Popup title={tituloModal} showTitle={true} width={400} height={360} />
            <Form colCount={1}>
              <Item dataField="nombre" caption="Nombre Categoria" />
              <Item
                dataField="Activo"
                label={{ text: "Estado" }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />
            </Form>
          </Editing>

          <Column
            dataField="id_producto_categoria"
            caption="Codigo"
            width={100}
            alignment="center"
          />
          <Column dataField="nombre" caption="Nombre Categoria" />
          <Column
            dataField="Activo"
            caption="Estado"
            width={100}
            alignment="center"
            cellRender={cellEstadoRender}
          />

          <MasterDetail enabled={true} component={renderMasterDetail} />
        </DataGrid>
      </StyledCard>
    </PageContainer>
  );
};

export default CategoriaListPage;
