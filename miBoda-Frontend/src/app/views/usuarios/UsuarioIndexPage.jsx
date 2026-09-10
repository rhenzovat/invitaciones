import React, { useEffect, useState, } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar,
} from "../../api/usuario.api";

import UsuarioListPage from "./UsuarioListPage";
import UsuarioEditPage from "./UsuarioEditPage";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
import TransferPrincipalDialog from "./TransferPrincipalDialog";
import { isNotEmpty, } from "../../utils/utils";
//1. Permisos
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";

import PerfilIndexPage from "../../components/Modales/modal_perfil/PerfilIndexPage";
import RolesIndexPage from "../../components/Modales/modal_roles/RolesIndexPage";
import PermisosIndexPage from "../../components/Modales/modal_treview/PermisosIndexPage";

const UsuarioIndexPage = props => {
  //1. Permisos.
  const { accessButton } = UseAccesosObjetos();

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de usuarios");
  const [listarUsuario, setListarUsuario] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});
  const [visibleModalPerfiles, setVisibleModalPerfiles] = useState(false);
  const [idUsuario, setIdUsuario] = useState(0);
  const [visibleModalRoles, setVisibleModalRoles] = useState(false);
  const [idPerfil, setIdPerfil] = useState(0);
  const [visibleModalTreview, setVisibleModalTreview] = useState(false);
  const [idRoles, setIdRoles] = useState({});
  const [transferOpen, setTransferOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const nuevoRegistro = () => {
    let dataState = { Activo: "S" };
    setDataRowEditNew({ ...dataState, esNuevoRegistro: true });
    setTitulo("Nuevo");
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {
    const { id: id_usuario } = dataRow;
    let filtro = { id: id_usuario };
    setModoEdicion(true);
    setTitulo("Editar");
    obtenerRegistro(filtro);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Lista de usuarios");
    setDataRowEditNew({});
  };

  async function agregarUsuario(Usuarios) {
    setLoading(true);
    const { id, username, email, password, Activo } = Usuarios;
    let params = {
      id: id
      , name: isNotEmpty(username) ? username : ""
      , email: isNotEmpty(email) ? email : ""
      , password: password
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
    const { id, username, email, password, Clave, Activo } = usuarios;
    let params = {
      id: id
      , name: isNotEmpty(username) ? username : ""
      , email: isNotEmpty(email) ? email : ""
      , password: password
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
    setTitulo("Lista de usuarios");
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
    if (!confirm) {
      setSelected(usuario);
      if (usuario?.es_administrador_principal) {
        setPendingDelete(usuario);
        setTransferOpen(true);
        return;
      }
      setIsVisible(true);
      return;
    }

    setLoading(true);
    const { id } = usuario;
    try {
      const res = await eliminar({ id });
      if (res?.success === false) {
        if (res.requires_transfer) {
          setPendingDelete(usuario);
          setTransferOpen(true);
          return;
        }
        throw new Error(res.message);
      }
      toastSuccess(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.MESSAGES.REMOVE.SUCESS" }));
      listarRegistros();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.requires_transfer) {
        setPendingDelete(usuario);
        setTransferOpen(true);
      } else {
        handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      }
    } finally {
      setLoading(false);
      setIsVisible(false);
    }
  }

  const onPrincipalTransferred = () => {
    if (pendingDelete) {
      setTransferOpen(false);
      setIsVisible(true);
      setSelected(pendingDelete);
    } else {
      listarRegistros();
    }
  };

  async function eliminarListRowTab(selected, confirm) {
    eliminarRegistro(selected, confirm);
  }
  //0
  const seleccionarPerfil = (selected) => {
    const { id: id_usuario } = selected;
    setIdUsuario(id_usuario)
    setVisibleModalPerfiles(true);//Abre el modal
  };

  //1 Obtiene perfil
  const obtenerPerfiles = async (dataPopup) => {
    const { id_perfil } = dataPopup;
    setIdPerfil(id_perfil)
    setVisibleModalRoles(true);//Abre el modal de Roles
  };

  const obtenerRoles = async (dataPopup) => {
    const { id_roles, nombre } = dataPopup;
    setIdRoles({ id_roles: id_roles, nombre: nombre })
    setVisibleModalTreview(true);//Abre el modal de Roles
  };

  const obtenerTreview = async (dataPopup) => {
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
          <UsuarioEditPage
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
          <UsuarioListPage
            listarUsuario={listarUsuario}
            editarRegistro={editarRegistro}
            eliminarRegistro={eliminarRegistro}
            nuevoRegistro={nuevoRegistro}
            seleccionarPerfil={seleccionarPerfil}
            titulo={titulo}
            accessButton={accessButton}
          />
        </>
      )}

      <TransferPrincipalDialog
        open={transferOpen}
        onClose={() => { setTransferOpen(false); setPendingDelete(null); }}
        usuarioActual={pendingDelete || selected}
        candidatos={listarUsuario}
        onTransferred={onPrincipalTransferred}
      />

      <Confirm
        message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CANCEL.TEXT" })}
      />


      {/*** PopUp -> 0 lista de perfiles ****/}
      {visibleModalPerfiles && (
        <PerfilIndexPage
          idUsuario={idUsuario}
          // 1. obtiene el dato del "perfil" para abrir el rol modal del rol
          selectData={obtenerPerfiles}
          showPopup={{ isVisiblePopUp: visibleModalPerfiles, setisVisiblePopUp: setVisibleModalPerfiles }}
          cancelarEdicion={() => setVisibleModalPerfiles(false)}
          selectionMode={"row"}
        />
      )}

      {/*** PopUp -> 1 lista de roles ****/}
      {visibleModalRoles && (
        <RolesIndexPage
          idPerfil={idPerfil}
          isPerfilModulo={true}
          // 2. obtiene el dato del "rol" para abrir el rol modal del treview
          selectData={obtenerRoles}
          showPopup={{ isVisiblePopUp: visibleModalRoles, setisVisiblePopUp: setVisibleModalRoles }}
          cancelarEdicion={() => setVisibleModalRoles(false)}
          selectionMode={"row"}
        />
      )}

      {/*** PopUp -> 2 lista permisos treview ****/}
      {visibleModalTreview && (
        <PermisosIndexPage
          detalleRol={idRoles}
          selectData={obtenerTreview}
          showPopup={{ isVisiblePopUp: visibleModalTreview, setisVisiblePopUp: setVisibleModalTreview }}
          cancelarEdicion={() => setVisibleModalTreview(false)}
          selectionMode={"row"}
        />
      )}

    </>
  );
}

export default injectIntl(WithLoandingPanel(UsuarioIndexPage));