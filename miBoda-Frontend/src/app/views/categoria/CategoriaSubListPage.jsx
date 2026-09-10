import React, { useEffect, useState, useCallback } from "react";
import DataGrid, {
  Column,
  Editing,
  Popup,
  Form,
} from "devextreme-react/data-grid";
import { Item } from "devextreme-react/form";
import { listar_obtener } from "../../api/producto_categoria_sub.api";

const CategoriaSubListPage = ({ datosSubCategorias, registrarSubCategoria, actualizarSubCategoria, eliminarSubCategoria }) => {
  const { id_producto_categoria } = datosSubCategorias;
  const [dataSource, setDataSource] = useState([]);
  const [tituloModal, setTituloModal] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const response = await listar_obtener({ id_producto_categoria });
      setDataSource(response);
    } catch (_) { /* handled by parent */ }
  }, [id_producto_categoria]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onInsert = useCallback(async (e) => {
    e.cancel = true;
    await registrarSubCategoria({ id_producto_categoria, ...e.data });
    e.component.cancelEditData();
    fetchData();
  }, [id_producto_categoria, registrarSubCategoria, fetchData]);

  const onUpdate = useCallback(async (e) => {
    e.cancel = true;
    const resolvedId =
      e?.oldData?.id_producto_categoria_sub ??
      e?.oldData?.id ??
      e?.oldData?.Codigo ??
      (typeof e?.key === "number" ? e.key : undefined);

    // Algunos "nuevos" llegan como update con key temporal.
    if (!resolvedId && e?.newData?.nombre) {
      await registrarSubCategoria({
        id_producto_categoria,
        ...e.oldData,
        ...e.newData,
      });
      e.component.cancelEditData();
      fetchData();
      return;
    }

    if (!resolvedId) return;

    await actualizarSubCategoria({
      ...e.oldData,
      ...e.newData,
      id_producto_categoria_sub: resolvedId,
    });
    e.component.cancelEditData();
    fetchData();
  }, [actualizarSubCategoria, registrarSubCategoria, fetchData, id_producto_categoria]);

  const onDelete = useCallback(async (e) => {
    e.cancel = true;
    await eliminarSubCategoria(e.data);
    await fetchData();
  }, [eliminarSubCategoria, fetchData]);

  return (
    <DataGrid
      dataSource={dataSource}
      keyExpr="id_producto_categoria_sub"
      showBorders={false}
      focusedRowEnabled={true}
      defaultFocusedRowIndex={0}
      columnAutoWidth={true}
      rowAlternationEnabled={true}
      onRowInserting={onInsert}
      onRowUpdating={onUpdate}
      onRowRemoving={onDelete}
      onInitNewRow={() => setTituloModal("Crear Sub-Categoria")}
      onEditingStart={() => setTituloModal("Editar Sub-Categoria")}
    >
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
          confirmDeleteMessage: "¿Está seguro de que desea eliminar este registro?",
          confirmDeleteTitle: "Confirmar eliminación",
          saveRowChanges: "Guardar",
          cancelRowChanges: "Cancelar",
          undeleteRow: "Deshacer",
        }}
      >
        <Popup title={tituloModal} showTitle={true} width={400} height={280} />
        <Form colCount={1}>
          <Item dataField="nombre" caption="Nombre Sub-Categoria" />
        </Form>
      </Editing>
      <Column
        dataField="id_producto_categoria_sub"
        caption="Codigo"
        width="30%"
        alignment="center"
      />
      <Column dataField="nombre" caption="Nombre Sub-Categoria" width="50%" />
    </DataGrid>
  );
};

export default CategoriaSubListPage;
