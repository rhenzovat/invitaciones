import React, { useEffect, useState, } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar,
} from "../../api/promocion.api";

import PromocionListPage from "./PromocionListPage";
import PromocionEditPage from "./PromocionEditPage";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
import { isNotEmpty, } from "../../utils/utils";
//1. Permisos
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";

const PromocionIndexPage = props => {
  //1. Permisos.
const { accessButton } = UseAccesosObjetos();

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Listar promociones");
  const [listarUsuario, setListarUsuario] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});

  const nuevoRegistro = () => {
    let dataState = { Activo: "S" };
    setDataRowEditNew({ ...dataState, esNuevoRegistro: true });
    setTitulo("Nuevo");
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {
    setModoEdicion(true);
    setTitulo("Editar");
    obtenerRegistro(dataRow);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Listar");
    setDataRowEditNew({});
  };

  async function agregarUsuario(dataRow) {
    setLoading(true);
    const { nombre, descripcion, start_date, end_date, id_membresia, Activo } = dataRow;
    let params = {
      nombre: isNotEmpty(nombre) ? nombre : ""
      , descripcion: isNotEmpty(descripcion) ? descripcion : ""
      , start_date: start_date
      , end_date: end_date
      , id_membresia: id_membresia
      , Activo: Activo


    };
    await crear(params).then(response => {
      if (response) toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      setModoEdicion(false);
      listarRegistros();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarUsuario(dataRow) {
    setLoading(true);
    const { id_promociones, nombre, descripcion, start_date, end_date, id_membresia, Activo } = dataRow;
    let params = {
      id_promociones: id_promociones
      , nombre: isNotEmpty(nombre) ? nombre : ""
      , descripcion: isNotEmpty(descripcion) ? descripcion : ""
      , start_date: start_date
      , end_date: end_date
      , id_membresia: id_membresia
      , Activo: Activo
    };

    await actualizar(params).then(response => {
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      setModoEdicion(false);
      listarRegistros();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function listarRegistros() {
    setLoading(true);
    setTitulo("Listar promociones");
    await listar().then(response => {
      setListarUsuario(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  }

  async function obtenerRegistro(filtro) {
    const { id_promociones } = filtro;
    if (id_promociones) {
      let result = await obtener({ id_promociones: id_promociones });
      setDataRowEditNew({ ...result[0], esNuevoRegistro: false });
    }
  }

  async function eliminarRegistro(usuario, confirm) {
    setSelected(usuario);
    setIsVisible(!confirm);
    if (confirm) {
      setLoading(true);
      const { id_promociones } = usuario;
      await eliminar({ id: id_promociones }).then(() => {
        toastSuccess(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.MESSAGES.REMOVE.SUCESS" }));
        listarRegistros();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      }).finally(() => { setLoading(false); });
      listarRegistros();
    }
  }

  async function eliminarListRowTab(selected, confirm) {
    eliminarRegistro(selected, confirm);
  }

  useEffect(() => {
    listarRegistros();
  }, []);

  return (
    <>
      {modoEdicion && (
        <>
          <PromocionEditPage
            cancelarEdicion={cancelarEdicion}
            dataRowEditNew={dataRowEditNew}
            actualizarUsuario={actualizarUsuario}
            agregarUsuario={agregarUsuario}
            titulo={titulo}
            accessButton={accessButton}
          />
        </>
      )}
      {!modoEdicion && (
        <>
          <PromocionListPage
            listarUsuario={listarUsuario}
            editarRegistro={editarRegistro}
            titulo={titulo}
            eliminarRegistro={eliminarRegistro}
            nuevoRegistro={nuevoRegistro}
            accessButton={accessButton}
          />
        </>
      )}
      <Confirm
        message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        // setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
}

export default injectIntl(WithLoandingPanel(PromocionIndexPage));