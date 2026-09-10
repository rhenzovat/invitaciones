import React, { useEffect, useState, } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar,
  asignar_usuario,
} from "../../api/empleados.api";

import EmpleadosListPage from "./EmpleadosListPage";
import EmpleadosEditPage from "./EmpleadosEditPage";
import { handleErrorMessages, toastSuccess, toastInfo, } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
import { isNotEmpty, } from "../../utils/utils";
import UsuarioIndexPage from "../../components/Modales/modal_usuario/UsuarioIndexPage";

//1. Permisos
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";

const EmpleadosIndexPage = props => {
  //1. Permisos.
  const { accessButton } = UseAccesosObjetos();

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de empleados");
  const [listarUsuario, setListarUsuario] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [visibleModalClientes, setVisibleModalClientes] = useState(false);

  const [selected, setSelected] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const [selectedAsigUser, setSelectedAsigUser] = useState({});
  const [isVisibleAsigUser, setIsVisibleAsigUser] = useState(false);

  const [idEmpleado, setIdEmpleado] = useState(null);
  const [idUsuario, setIdUsuario] = useState(null);


  const nuevoRegistro = () => {
    let dataState = { Activo: "S", email_acceso: "EXAMPLE@GMAL.COM" };
    setDataRowEditNew({ ...dataState, esNuevoRegistro: true });
    setTitulo("Nuevo");
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {
    const { id_empleado: id_usuario } = dataRow;
    let filtro = { id: id_usuario };
    setModoEdicion(true);
    setTitulo("Editar");
    obtenerRegistro(filtro);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Listar");
    setDataRowEditNew({});
  };

  async function agregarEmpleado(dataRow) {
    setLoading(true);
    const { id_empleado, nombre, apellido, telefono, email, direccion, dni, Activo, email_acceso, password, } = dataRow;
    let params = {
      id_empleado: id_empleado
      , nombre: isNotEmpty(nombre) ? nombre : ""
      , apellido: isNotEmpty(apellido) ? apellido : ""
      , telefono: telefono

      , email: isNotEmpty(email) ? email : ""
      , direccion: isNotEmpty(direccion) ? direccion : ""
      , dni: dni
      , Activo: Activo

      , email_acceso: isNotEmpty(email_acceso) ? email_acceso : ""
      , password: password

    };
    await crear(params).then(response => {
      if (response.success) {
        toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
        setModoEdicion(false);
        listarRegistros();
      } else {
        toastInfo(response.message);
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarEmpleado(dataRow) {
    setLoading(true);
    const { id_empleado, nombre, apellido, telefono, email, direccion, dni, Activo, email_acceso, password, } = dataRow;
    let params = {
      id: id_empleado
      , nombre: isNotEmpty(nombre) ? nombre : ""
      , apellido: isNotEmpty(apellido) ? apellido : ""
      , telefono: telefono

      , email: isNotEmpty(email) ? email : ""
      , direccion: isNotEmpty(direccion) ? direccion : ""
      , dni: dni
      , Activo: Activo

      , email_acceso: isNotEmpty(email_acceso) ? email_acceso : ""
      , password: password
    };

    await actualizar(params).then(response => {
      if (response.success) {
        toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
        setModoEdicion(false);
        listarRegistros();
      } else {
        toastInfo(response.message);
      }

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function listarRegistros() {
    setLoading(true);
    setTitulo("Lista de empleados");
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
  // A: ====================== ELIMINAR CONFIRM =======================
  async function eliminarRegistro(usuario, confirm) {
    setSelected(usuario);
    setIsVisible(!confirm);
    if (confirm) {
      setLoading(true);
      const { id_empleado } = usuario;
      await eliminar({ id: id_empleado }).then(() => {
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

  // B: ====================== CONFIRM ASIGNAR=======================
  //1. Abre el modal para asignar un usuario
  const asignarUsuarioOnly = async (usuario, confirm) => {
    //Confirmamos la actualizacion de id_usuario para el empleado
    setSelectedAsigUser(usuario);
    setIsVisibleAsigUser(!confirm);

    if (confirm) {
      setLoading(true);
      const { id: id_usuario } = usuario[0];
      await asignar_usuario({ id_usuario: id_usuario, id_empleado: idEmpleado }).then(() => {
        toastSuccess(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.MESSAGES.REMOVE.SUCESS" }));
        listarRegistros();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      }).finally(() => { setLoading(false); });
      listarRegistros();
    }

  };

  async function asignarUsuarioConfirm(selected, confirm) {
    asignarUsuarioOnly(selected, confirm);
  }

  // =======================================================================

  const openModalAsignarUsuario = dataRow => {
    // console.log('%c [test]-198', 'font-size:13px; background:pink; color:#bf2c9f;', dataRow)
    //C. Abrimos el modal para seleccionar el empleado
    const { id_empleado, id_usuario, nombre_usuario, } = dataRow;
    setIdEmpleado(id_empleado)
    setIdUsuario({ id_usuario: id_usuario, nombre_usuario: nombre_usuario })
    setVisibleModalClientes(true);
  };

  const removeUsuario = async (usuario) => {
    await asignar_usuario({ id_usuario: null, id_empleado: idEmpleado }).then(() => {
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      listarRegistros();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
    listarRegistros();
    setVisibleModalClientes(false);
  }

  useEffect(() => {
    listarRegistros();
  }, []);

  return (
    <>
      {modoEdicion && (
        <>
          <EmpleadosEditPage
            cancelarEdicion={cancelarEdicion}
            dataRowEditNew={dataRowEditNew}
            actualizarEmpleado={actualizarEmpleado}
            agregarEmpleado={agregarEmpleado}
            titulo={titulo}
            accessButton={accessButton}
          />
        </>
      )}


      {!modoEdicion && (
        <>
          <EmpleadosListPage
            listarUsuario={listarUsuario}
            eliminarRegistro={eliminarRegistro}
            editarRegistro={editarRegistro}
            openModalAsignarUsuario={openModalAsignarUsuario}

            titulo={titulo}
            nuevoRegistro={nuevoRegistro}
            accessButton={accessButton}
          />
        </>
      )}


      {/*** PopUp -> lista usuario ****/}
      {visibleModalClientes && (
        <UsuarioIndexPage
          idUsuario={idUsuario}
          idEmpleado={idEmpleado}

          selectData={asignarUsuarioOnly}
          removeUsuario={removeUsuario}
          showPopup={{ isVisiblePopUp: visibleModalClientes, setisVisiblePopUp: setVisibleModalClientes }}
          cancelarEdicion={() => setVisibleModalClientes(false)}
          selectionMode={"row"}
        />
      )}

      <Confirm
        message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CANCEL.TEXT" })}
      />


      <Confirm
        message={intl.formatMessage({ id: "ADMINISTRACION.EMPLEADOS.INFO.ASIGNAR.USUARIO" })}
        isVisible={isVisibleAsigUser}
        setIsVisible={setIsVisibleAsigUser}
        onConfirm={() => asignarUsuarioConfirm(selectedAsigUser, true)}
        title={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
}

export default injectIntl(WithLoandingPanel(EmpleadosIndexPage));