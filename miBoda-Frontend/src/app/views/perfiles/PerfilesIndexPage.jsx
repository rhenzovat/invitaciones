import React, { useEffect, useState, } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar,
} from "../../api/perfiles.api";

import PerfilesListPage from "./PerfilesListPage";
import PerfilesEditPage from "./PerfilesEditPage";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
import RolesIndexPage from "../../components/Modales/modal_roles/RolesIndexPage";
import { isNotEmpty, } from "../../utils/utils";

//1. Permisos
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";

const PerfilesIndexPage = props => {
  //1. Permisos.
  const { accessButton } = UseAccesosObjetos();

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Perfiles");
  const [listarUsuario, setListarUsuario] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});

  const [visibleModalRoles, setVisibleModalRoles] = useState(false);
  const [idPerfil, setIdPerfil] = useState(0);

  const nuevoRegistro = () => {
    let dataState = { Activo: "S" };
    setDataRowEditNew({ ...dataState, esNuevoRegistro: true });
    setTitulo("Nuevo");
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {
    const { id_perfil: id_usuario } = dataRow;
    let filtro = { id: id_usuario };
    setModoEdicion(true);
    setTitulo("Editar");
    obtenerRegistro(filtro);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Lista de Perfiles");
    setDataRowEditNew({});
  };

  async function agregarUsuario(usuarios) {
    setLoading(true);
    const { id_perfil, nombre, Activo, } = usuarios;
    let params = {
      id_perfil: id_perfil
      , nombre: isNotEmpty(nombre) ? nombre : ""
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
    const { id_perfil, nombre, Activo, } = usuarios;
    let params = {
      id: id_perfil
      , nombre: isNotEmpty(nombre) ? nombre : ""
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
    setTitulo("Lista de Perfiles");
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
      const { id_perfil } = usuario;
      await eliminar({ id: id_perfil }).then(() => {
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

  const seleccionarRoles = (selected) => {
    const { id_perfil } = selected;
    setIdPerfil(id_perfil)
    setVisibleModalRoles(true);//Abre el modal
  };

  const obtenerEmpleados = async (dataPopup) => {
    // const { id_empleado, nombre } = dataPopup[0];
    // props.dataRowEditNew.id_empleado = id_empleado
    // props.dataRowEditNew.nombre_operador = nombre

  };

  useEffect(() => {
    listarRegistros();
  }, []);

  return (
    <>
      {modoEdicion && (
        <>
          <PerfilesEditPage
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
          <PerfilesListPage
            listarUsuario={listarUsuario}
            editarRegistro={editarRegistro}
            eliminarRegistro={eliminarRegistro}
            nuevoRegistro={nuevoRegistro}
            seleccionarRoles={seleccionarRoles}
            titulo={titulo}
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

      {/*** PopUp -> lista de roles ****/}
      {visibleModalRoles && (
        <RolesIndexPage
          idPerfil={idPerfil}
          isPerfilModulo={false}
          selectData={obtenerEmpleados}
          showPopup={{ isVisiblePopUp: visibleModalRoles, setisVisiblePopUp: setVisibleModalRoles }}
          cancelarEdicion={() => setVisibleModalRoles(false)}
          selectionMode={"row"}
        />
      )}

    </>
  );
}

export default injectIntl(WithLoandingPanel(PerfilesIndexPage));