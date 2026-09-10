import React, { useEffect, useState, } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar,
} from "../../api/vendedor.api";

import VendedorListPage from "./VendedorListPage";
import VendedorEditPage from "./VendedorEditPage";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
//1. Permisos
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";
const VendedorIndexPage = props => {
  //1. Permisos.
const { accessButton } = UseAccesosObjetos();

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Vendedores");
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
    const { id_vendedor: id_usuario } = dataRow;
    let filtro = { id: id_usuario };
    setModoEdicion(true);
    setTitulo("Editar");
    obtenerRegistro(filtro);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Lista de Vendedores");
    setDataRowEditNew({});
  };

  async function agregarUsuario(usuarios) {
    setLoading(true);
    const { id_vendedor, nombre, Activo, } = usuarios;
    let params = {
      id_vendedor: id_vendedor
      , nombre: nombre
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

  async function actualizarUsuario(usuarios) {
    setLoading(true);
    const { id_vendedor, nombre, Activo, } = usuarios;
    let params = {
      id: id_vendedor
      , nombre: nombre
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
    setTitulo("Lista de Vendedores");
    await listar().then(response => {
      setListarUsuario(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  }

  async function obtenerRegistro(filtro) {
    const { id: id_usuario } = filtro;
    if (id_usuario) {
      let usuarios = await obtener({ id: id_usuario });
      setDataRowEditNew({ ...usuarios[0], esNuevoRegistro: false });
    }
  }

  async function eliminarRegistro(usuario, confirm) {
    setSelected(usuario);
    setIsVisible(!confirm);
    if (confirm) {
      setLoading(true);
      const { id_vendedor } = usuario;
      await eliminar({ id: id_vendedor }).then(() => {
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
          <VendedorEditPage
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
          <VendedorListPage
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

export default injectIntl(WithLoandingPanel(VendedorIndexPage));