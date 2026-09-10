import React, { useEffect, useState, } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
  crear,
  agregar_permisos,
  copiar_permisos,
  actualizar,
  eliminar,
} from "../../api/roles.api";

import RolesListPage from "./RolesListPage";
import RolesEditPage from "./RolesEditPage";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
import RolesPermisosIndexPage from "./RolesPermisosIndexPage";
import CopiarPermisosRolDialog from "./CopiarPermisosRolDialog";
import { isNotEmpty, } from "../../utils/utils";
//1. Permisos
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";
import useAuth from "../../hooks/useAuth";
import { refreshAppSidebarMenu } from "../../utils/refreshAppSidebarMenu";

const RolesIndexPage = props => {
  //1. Permisos.
  const { accessButton } = UseAccesosObjetos();
  const { perfil, validar_perfil } = useAuth();

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Roles");
  const [listarUsuario, setListarUsuario] = useState([]);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});
  const [detalleRol, setDetalleRol] = useState([]);

  const [modoNavEdit, setModoNavEdit] = useState(false);
  const [modoNavList, setModoNavList] = useState(false);
  const [modoNavPermiso, setModoNavPermiso] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyDialogOrigen, setCopyDialogOrigen] = useState(null);
  const [copyGuardarAntes, setCopyGuardarAntes] = useState(false);
  const [copyObtenerPayload, setCopyObtenerPayload] = useState(null);
  const [copyLoading, setCopyLoading] = useState(false);

  const nuevoRegistro = () => {

    setModoNavEdit(true);
    setModoNavList(false);
    setModoNavPermiso(false);

    let dataState = { Activo: "S" };
    setDataRowEditNew({ ...dataState, esNuevoRegistro: true });
    setTitulo("Nuevo");

  };

  const editarRegistro = dataRow => {
    setModoNavEdit(true);
    setModoNavList(false);
    setModoNavPermiso(false);

    const { id_roles: id_usuario } = dataRow;
    let filtro = { id: id_usuario };

    setTitulo("Editar");
    obtenerRegistro(filtro);
  };

  const cancelarEdicion = () => {

    setModoNavEdit(false);
    setModoNavList(true);
    setModoNavPermiso(false);

    setTitulo("Lista de Roles");
    setDataRowEditNew({});
  };

  const asignarPemisos = dataRow => {
    setModoNavEdit(false);
    setModoNavList(false);
    setModoNavPermiso(true);//treview

    const { id_roles, nombre } = dataRow;
    let filtro = { id_roles: id_roles, nombre: nombre };
    setTitulo("Editar");
    //jorge
    setDetalleRol(filtro);
  };

  const abrirCopiarPermisos = (opts = {}) => {
    const origen = opts?.rolOrigen ?? (opts?.id_roles ? opts : detalleRol);
    if (!origen?.id_roles) return;
    setCopyDialogOrigen({ id_roles: origen.id_roles, nombre: origen.nombre });
    setCopyGuardarAntes(Boolean(opts.guardarAntes));
    setCopyObtenerPayload(typeof opts.obtenerPayload === "function" ? opts.obtenerPayload : null);
    setCopyDialogOpen(true);
  };

  const cerrarCopiarPermisos = () => {
    if (copyLoading) return;
    setCopyDialogOpen(false);
    setCopyDialogOrigen(null);
    setCopyObtenerPayload(null);
  };

  async function guardarPermisosSilencioso(listIdMenus) {
    const params = { id_menu: listIdMenus ?? "", id_roles: detalleRol.id_roles };
    const response = await agregar_permisos(params);
    if (response?.success === false) {
      throw new Error(response?.message || "No se pudieron guardar los permisos.");
    }
    const rolGuardado = Number(detalleRol.id_roles);
    const rolActivo = Number(perfil?.id_roles);
    if (
      validar_perfil &&
      perfil?.id_perfil != null &&
      rolGuardado > 0 &&
      rolActivo === rolGuardado
    ) {
      await validar_perfil(perfil.id_perfil, rolGuardado);
    }
    if (rolGuardado > 0 && rolActivo === rolGuardado) {
      await refreshAppSidebarMenu();
    }
    return response;
  }

  async function ejecutarCopiarPermisos({
    id_roles_origen,
    id_roles_destino,
    incluir_sidebar_orden,
    guardar_cambios_actuales,
  }) {
    setCopyLoading(true);
    setLoading(true);
    try {
      if (guardar_cambios_actuales && copyObtenerPayload) {
        const payload = copyObtenerPayload();
        if (!payload) {
          throw new Error("Seleccione al menos un permiso en el árbol antes de copiar.");
        }
        await guardarPermisosSilencioso(payload);
      }

      const response = await copiar_permisos({
        id_roles_origen,
        id_roles_destino,
        incluir_sidebar_orden,
      });

      if (response?.success === false) {
        throw new Error(response?.message || "No se pudieron copiar los permisos.");
      }

      const rolActivo = Number(perfil?.id_roles);
      if (rolActivo === Number(id_roles_destino) || rolActivo === Number(id_roles_origen)) {
        await refreshAppSidebarMenu();
      }
      toastSuccess(response?.message || "Permisos copiados correctamente");
      cerrarCopiarPermisos();
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? err;
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), msg);
    } finally {
      setCopyLoading(false);
      setLoading(false);
    }
  }


  async function agregarPermisos(listIdMenus) {
    setLoading(true);
    const params = { id_menu: listIdMenus ?? "", id_roles: detalleRol.id_roles };
    try {
      const response = await agregar_permisos(params);
      if (response?.success === false) {
        throw new Error(response?.message || "No se pudieron guardar los permisos.");
      }
      const rolGuardado = Number(detalleRol.id_roles);
      const rolActivo = Number(perfil?.id_roles);
      if (
        validar_perfil &&
        perfil?.id_perfil != null &&
        rolGuardado > 0 &&
        rolActivo === rolGuardado
      ) {
        await validar_perfil(perfil.id_perfil, rolGuardado);
      }
      if (rolGuardado > 0 && rolActivo === rolGuardado) {
        await refreshAppSidebarMenu();
      }
      toastSuccess(
        response?.message || intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" })
      );
      setModoNavEdit(false);
      setModoNavList(true);
      setModoNavPermiso(false);
      listarRegistros();
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? err;
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), msg);
    } finally {
      setLoading(false);
    }
  }

  async function agregarRegistro(usuarios) {
    setLoading(true);
    const { id_roles, nombre, Activo, } = usuarios;
    let params = {
      id_roles: id_roles
      , nombre: isNotEmpty(nombre) ? nombre : ""
      , Activo: Activo

    };
    await crear(params).then(response => {
      if (response) toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));

      setModoNavEdit(false);
      setModoNavList(true);
      setModoNavPermiso(false);

      listarRegistros();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarUsuario(usuarios) {
    setLoading(true);
    const { id_roles, nombre, Activo, } = usuarios;
    let params = {
      id: id_roles
      , nombre: isNotEmpty(nombre) ? nombre : ""
      , Activo: Activo
    };

    await actualizar(params).then(response => {
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));

      setModoNavEdit(false);
      setModoNavList(true);
      setModoNavPermiso(false)

      listarRegistros();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function listarRegistros() {

    setModoNavEdit(false);
    setModoNavList(true);
    setModoNavPermiso(false)

    setLoading(true);
    setTitulo("Lista de Roles");
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
    setLoading(true);
    if (id_usuario) {
      let usuarios = await obtener({ id: id_usuario }).finally(() => {
        setLoading(false);
      });
      setDataRowEditNew({ ...usuarios[0], esNuevoRegistro: false });
    }
  }

  async function eliminarRegistro(usuario, confirm) {
    setSelected(usuario);
    setIsVisible(!confirm);
    if (confirm) {
      setLoading(true);
      const { id_roles } = usuario;
      await eliminar({ id: id_roles }).then(() => {
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

      {modoNavPermiso && (
        <>
          <RolesPermisosIndexPage
            cancelarEdicion={cancelarEdicion}
            agregarPermisos={agregarPermisos}
            abrirCopiarPermisos={abrirCopiarPermisos}
            detalleRol={detalleRol}
            accessButton={accessButton}
          />
        </>
      )}

      {modoNavEdit && (
        <>
          <RolesEditPage
            cancelarEdicion={cancelarEdicion}
            dataRowEditNew={dataRowEditNew}
            actualizarUsuario={actualizarUsuario}
            agregarRegistro={agregarRegistro}
            titulo={titulo}
            accessButton={accessButton}
          />
        </>
      )}

      {modoNavList && (
        <>
          <RolesListPage
            listarUsuario={listarUsuario}
            asignarPemisos={asignarPemisos}
            abrirCopiarPermisos={(row) => abrirCopiarPermisos({ rolOrigen: row, guardarAntes: false })}
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

      <CopiarPermisosRolDialog
        open={copyDialogOpen}
        onClose={cerrarCopiarPermisos}
        rolOrigen={copyDialogOrigen}
        rolesLista={listarUsuario}
        guardarAntes={copyGuardarAntes}
        loading={copyLoading}
        onConfirm={ejecutarCopiarPermisos}
      />


    </>
  );
}

export default injectIntl(WithLoandingPanel(RolesIndexPage));