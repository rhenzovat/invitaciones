import React, { useEffect, useState, } from "react";
import { useSidebarModuleReset } from "../../../hooks/useSidebarModuleReset";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar_factura,
} from "../../../api/pedidos.api";
import FacturasListPage from "./FacturasListPage";

import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import Confirm from "../../../components/Confirm";
//1. Permisos
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../../utils/useAccesosObjetos";

const FacturasIndexPage = props => {
  //1. Permisos.
const { accessButton } = UseAccesosObjetos();

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Facturas");
  const [listarProductos, setListarProductos] = useState([]);
  const [modoList, setModoList] = useState(false);
  const [modoEdit, setModoEdit] = useState(false);
  const [modoAddImagen, setModoAddImagen] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});


  //============= 1. OPERACIONES CON PRODUCTOS ============
  const nuevoRegistro = () => {
    let dataState = { Activo: "S" };
    setDataRowEditNew({ ...dataState, esNuevoRegistro: true });
    setTitulo("Nuevo");
    openComponet(false, true, false);
  };

  const editarRegistro = dataRow => {
    const { id_producto } = dataRow;
    let filtro = { id: id_producto };

    openComponet(false, true, false);
    setTitulo("Editar");
    obtenerRegistro(filtro);
  };

  const cancelarEdicion = () => {
    openComponet(true, false, false);
    setTitulo("Listar");
    setDataRowEditNew({});
  };

  async function listarRegistros() {
    openComponet(true, false, false);
    setLoading(true);
    setTitulo("Lista de Facturas");
    await listar_factura().then(response => {
      setListarProductos(response);
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

  async function eliminarListRowTab(selected, confirm) {
    eliminarRegistro(selected, confirm);
  }

  const openComponet = async (list, edit, addImagen) => {
    if (list == true && edit == false && addImagen == false) {
      setModoList(true)
      setModoEdit(false)
      setModoAddImagen(false)
    } else if (list == false && edit == true && addImagen == false) {
      setModoList(false)
      setModoEdit(true)
      setModoAddImagen(false)
    } else if (list == false && edit == false && addImagen == true) {
      setModoList(false)
      setModoEdit(false)
      setModoAddImagen(true)
    }
  };

  useEffect(() => {
    listarRegistros();
  }, []);

  useSidebarModuleReset(() => {
    listarRegistros();
  });

  return (
    <>
      {modoEdit && (
        <>
        null
        </>
      )}

      {modoList && (
        <>
          <FacturasListPage
            listarProductos={listarProductos}
            editarRegistro={editarRegistro}
            titulo={titulo}
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

export default injectIntl(WithLoandingPanel(FacturasIndexPage));