import React, { useEffect, useState, useCallback } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  listar,
  crear,
  actualizar,
  eliminar,
} from "../../api/producto_categoria.api";
import {
  crear as crear_sub,
  actualizar as actualizar_sub,
  eliminar as eliminar_sub,
} from "../../api/producto_categoria_sub.api";
import CategoriaListPage from "./CategoriaListPage";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";
import Confirm from "../../components/Confirm";

const CategoriaIndexPage = (props) => {
  const { accessButton } = UseAccesosObjetos();
  const { setLoading } = props;
  const intl = useIntl();
  const [listarCategorias, setListarCategorias] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});

  const normalizeCategoria = useCallback((item, index = 0) => ({
    ...item,
    id_producto_categoria:
      item?.id_producto_categoria ??
      item?.id ??
      item?.Codigo ??
      item?.codigo ??
      item?.ID ??
      `CAT_${index}`,
    nombre:
      item?.nombre ??
      item?.Nombre ??
      item?.nombre_categoria ??
      "",
    Activo: item?.Activo ?? item?.activo ?? "S",
  }), []);

  const listarRegistros = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await listar();
      const normalizado = (response || []).map((item, index) => normalizeCategoria(item, index));
      setListarCategorias(normalizado);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [normalizeCategoria]);

  // ── CATEGORIAS CRUD ──
  const agregarCategoria = useCallback(async (dataRow) => {
    setLoading(true);
    try {
      const nombre = (dataRow?.nombre || "").trim();
      if (!nombre) {
        throw new Error("Debe ingresar el nombre de la categoría.");
      }

      const response = await crear({
        nombre,
        Activo: dataRow?.Activo ?? "S",
      });
      
      if (!response?.id_producto_categoria) {
        throw new Error("No se pudo confirmar la creación de la categoría.");
      }

      setListarCategorias((prev) => [normalizeCategoria(response), ...prev]);
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      listarRegistros(false);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }, [normalizeCategoria, listarRegistros]);

  const actualizarCategoria = useCallback(async (dataRow) => {
    setLoading(true);
    try {
      const resolvedId =
        dataRow?.id_producto_categoria ??
        dataRow?.id ??
        dataRow?.Codigo;

      const nombre = (dataRow?.nombre || "").trim();
      if (!nombre) {
        throw new Error("Debe ingresar el nombre de la categoría.");
      }
      if (!resolvedId) {
        throw new Error("No se pudo identificar la categoría a actualizar (id indefinido).");
      }

      await actualizar({
        id: resolvedId,
        nombre,
        Activo: dataRow?.Activo || "S",
      });
      setListarCategorias((prev) =>
        prev.map((item) =>
          item.id_producto_categoria === resolvedId
            ? { ...item, ...dataRow, nombre, Activo: dataRow?.Activo || "S" }
            : item
        )
      );
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      listarRegistros(false);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }, [listarRegistros]);

  const eliminarRegistro = useCallback(async (dataRow, confirm) => {
    setSelected(dataRow);
    setIsVisible(!confirm);
    if (!confirm) return;

    const id = dataRow.id_producto_categoria;
    const previousData = listarCategorias;
    setListarCategorias((prev) => prev.filter((item) => item.id_producto_categoria !== id));
    setLoading(true);
    try {
      await eliminar({ id });
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.DELETE" }));
      listarRegistros(false);
    } catch (err) {
      setListarCategorias(previousData);
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }, [listarCategorias, listarRegistros]);

  // ── SUB-CATEGORIAS CRUD ──
  const registrarSubCategoria = useCallback(async (dataRow) => {
    setLoading(true);
    try {
      await crear_sub({
        id_producto_categoria: dataRow.id_producto_categoria,
        nombre: dataRow.nombre,
        Activo: "S",
      });
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarSubCategoria = useCallback(async (dataRow) => {
    setLoading(true);
    try {
      await actualizar_sub({
        id: dataRow.id_producto_categoria_sub,
        nombre: dataRow.nombre,
        Activo: "S",
      });
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarSubCategoria = useCallback(async (dataRow) => {
    setLoading(true);
    try {
      await eliminar_sub({ id: dataRow.id_producto_categoria_sub });
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.DELETE" }));
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listarRegistros();
  }, []);

  return (
    <>
      <CategoriaListPage
        accessButton={accessButton}
        listarCategorias={listarCategorias}
        agregarCategoria={agregarCategoria}
        actualizarCategoria={actualizarCategoria}
        eliminarRegistro={eliminarRegistro}
        registrarSubCategoria={registrarSubCategoria}
        actualizarSubCategoria={actualizarSubCategoria}
        eliminarSubCategoria={eliminarSubCategoria}
      />

      <Confirm
        message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onConfirm={() => eliminarRegistro(selected, true)}
        title={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(CategoriaIndexPage));
