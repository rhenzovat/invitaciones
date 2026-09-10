import React, { useEffect, useState } from "react";
import { useSidebarModuleReset } from "../../../hooks/useSidebarModuleReset";
import { useIntl, injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import {
  obtener,
  listar_filtro,
  eliminar,
  actualizar_estado_pedido,
  actualizar_estado_devolucion,
  actualizar_comprobante_conforme,
  asignar_pedido_usuario,
} from "../../../api/pedidos.api";

import PedidosListPage from "./PedidosListPage";
import PedidosDetailsPage from "./PedidosDetailsPage";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import Confirm from "../../../components/Confirm";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../../utils/useAccesosObjetos";

// Styled container for consistent background
const PageWrapper = styled(Box)({
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
});

const PedidosIndexPage = (props) => {
const { accessButton } = UseAccesosObjetos();

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Pedidos");
  const [listarPedidos, setListarPedidos] = useState([]);
  const [toolContadores, setToolContadores] = useState({
    total_pendientes: 0,
    total_deliverys: 0,
    total_entregados: 0,
    total_cancelados: 0,
  });

  const [modoList, setModoList] = useState(false);
  const [modoEdit, setModoEdit] = useState(false);
  const [modoAddImagen, setModoAddImagen] = useState(false);

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});
  const [isEstado, setIsEstado] = useState(1);
  const [puedeAsignarPedidos, setPuedeAsignarPedidos] = useState(false);

  const editarRegistro = (dataRow) => {
    const { id_pedido } = dataRow;
    const filtro = { id_pedido };

    openComponet(false, true, false);
    setTitulo("Detalle del Pedido");
    obtenerRegistro(filtro);
  };

  const cancelarEdicion = () => {
    openComponet(true, false, false);
    setTitulo("Lista de Pedidos");
    setDataRowEditNew({});
  };

  async function listarRegistros(values1, values2, values3, isEstado) {
    openComponet(values1, values2, values3);
    setLoading(true);
    setTitulo("Lista de Pedidos");
    try {
      const response = await listar_filtro({ estado: isEstado });
      setListarPedidos(response.pedidos || []);
      setPuedeAsignarPedidos(response.puede_asignar === true);
      setToolContadores(response.contadores || {
        total_pendientes: 0,
        total_deliverys: 0,
        total_entregados: 0,
        total_cancelados: 0,
      });
    } catch (err) {
      handleErrorMessages(
        intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }),
        err
      );
    } finally {
      setLoading(false);
    }
  }

  async function obtenerRegistro(filtro) {
    const dataRows = await obtener(filtro);
    setDataRowEditNew({ listarDetalle: dataRows, esNuevoRegistro: false });
  }

  async function eliminarRegistro(usuario, confirm) {
    setSelected(usuario);
    setIsVisible(!confirm);
    if (confirm) {
      setLoading(true);
      const { id_pedido } = usuario;
      try {
        await eliminar({ id: id_pedido });
        toastSuccess(
          intl.formatMessage({
            id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.MESSAGES.REMOVE.SUCESS",
          })
        );
        listarRegistros(true, false, false, isEstado);
      } catch (err) {
        handleErrorMessages(
          intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
          err
        );
      } finally {
        setLoading(false);
      }
    }
  }

  async function eliminarListRowTab(selected, confirm) {
    eliminarRegistro(selected, confirm);
  }

  async function asignarPedidoAUsuario(payload) {
    setLoading(true);
    try {
      await asignar_pedido_usuario(payload);
      toastSuccess(
        intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" })
      );
      await listarRegistros(true, false, false, isEstado);
    } catch (err) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const openComponet = async (list, edit, addImagen) => {
    if (list && !edit && !addImagen) {
      setModoList(true);
      setModoEdit(false);
      setModoAddImagen(false);
    } else if (!list && edit && !addImagen) {
      setModoList(false);
      setModoEdit(true);
      setModoAddImagen(false);
    } else if (!list && !edit && addImagen) {
      setModoList(false);
      setModoEdit(false);
      setModoAddImagen(true);
    }
  };

  async function actualizarEstaPedido(dataRows) {
    setLoading(true);
    try {
      // NO llamar a actualizar_estado_pedido aquí porque ya se llamó en handleGuardarEstado
      // Solo recargar los datos
      toastSuccess(
        intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" })
      );
      
      listarRegistros(false, false, false, isEstado);
      
      // Recargar el detalle del pedido actual si está en modo edición
      if (modoEdit && dataRows.id_pedido) {
        await obtenerRegistro({ id_pedido: dataRows.id_pedido });
      }
    } catch (err) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
    } finally {
      setLoading(false);
    }
  }

  async function actualizarEstadoDevuelto(dataRows) {
    setLoading(true);
    try {
      await actualizar_estado_devolucion(dataRows);
      toastSuccess(
        intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" })
      );
    } catch (err) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
    } finally {
      setLoading(false);
    }
  }

  async function actualizarComprobanteConforme(dataRows) {
    setLoading(true);
    try {
      await actualizar_comprobante_conforme(dataRows);
      toastSuccess(
        intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" })
      );
    } catch (err) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    listarRegistros(true, false, false, isEstado);
  }, [isEstado]);

  useSidebarModuleReset(() => {
    listarRegistros(true, false, false, isEstado);
  });

  return (
    <PageWrapper>
      {modoEdit && (
        <PedidosDetailsPage
          cancelarEdicion={cancelarEdicion}
          dataRowEditNew={dataRowEditNew}
          titulo={titulo}
          accessButton={accessButton}
          actualizarEstaPedido={actualizarEstaPedido}
          actualizarEstadoDevuelto={actualizarEstadoDevuelto}
          actualizarComprobanteConforme={actualizarComprobanteConforme}
        />
      )}

      {modoList && (
        <PedidosListPage
          listarPedidos={listarPedidos}
          editarRegistro={editarRegistro}
          titulo={titulo}
          eliminarRegistro={eliminarRegistro}
          accessButton={accessButton}
          toolContadores={toolContadores}
          setIsEstado={setIsEstado}
          puedeAsignarPedidos={puedeAsignarPedidos}
          onAsignarPedido={asignarPedidoAUsuario}
        />
      )}

      <Confirm
        message={intl.formatMessage({
          id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ALERT.REMOVE",
        })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({
          id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.TITLE",
        })}
        confirmText={intl.formatMessage({
          id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CONFIRM.TEXT",
        })}
        cancelText={intl.formatMessage({
          id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CANCEL.TEXT",
        })}
      />
    </PageWrapper>
  );
};

export default injectIntl(WithLoandingPanel(PedidosIndexPage));
