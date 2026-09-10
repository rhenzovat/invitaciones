import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import OfertaDelDiaListPage from "./OfertaDelDiaListPage";
import OfertaDelDiaEditPage from "./OfertaDelDiaEditPage";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";
import { formatDateTimeForMySQL } from "../../utils/utils";
import Confirm from "../../components/Confirm";

import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar,
} from "../../api/ofertas.api";

import { listar_membresias, } from "../../api/promocion.api";

const OfertaDelDiaIndexPage = ({ setLoading, ...props }) => {
const { accessButton } = UseAccesosObjetos();
  const intl = useIntl();

  const [titulo, setTitulo] = useState("Listar ofertas del día");
  const [ofertas, setOfertas] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});
  const [listaMembresias, setListaMembresias] = useState([]);

  const nuevoRegistro = () => {
    setDataRowEditNew({
      Activo: "S",
      esNuevoRegistro: true,
      start_time: new Date(),
      end_time: new Date(Date.now() + 24 * 60 * 60 * 1000) // Mañana por defecto
    });
    setTitulo("Nueva oferta del día");
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {
    obtenerRegistro(dataRow.id_oferta_dia);
    setTitulo("Editar oferta del día");
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Listar ofertas del día");
    setDataRowEditNew({});
  };

  const listarOfertas = async () => {
    setLoading(true);
    try {
      const response = await listar();
      setOfertas(response.data || []);
    } catch (error) {
      handleErrorMessages("Error al cargar ofertas", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerRegistro = async (id) => {
    setLoading(true);
    try {
      const response = await obtener({ id_oferta_dia: id });
      setDataRowEditNew({ ...response.data[0], esNuevoRegistro: false });
    } catch (error) {
      handleErrorMessages("Error al obtener oferta", error);
    } finally {
      setLoading(false);
    }
  };

  const agregarOferta = async (oferta) => {
    setLoading(true);
    try {
      const { nombre_oferta, id_producto, precio_original, precio_oferta,
        start_time, end_time, cantidad_disponible, Activo, id_membresia,

        segundo_id_producto,
        segundo_nombre_oferta,
        segundo_precio_oferta,
      } = oferta;

      const params = {
        nombre_oferta,
        id_producto,
        precio_original,
        precio_oferta,
        start_time: formatDateTimeForMySQL(start_time),
        end_time: formatDateTimeForMySQL(end_time),
        cantidad_disponible,
        Activo,
        id_membresia,

        segundo_id_producto,
        segundo_nombre_oferta,
        segundo_precio_oferta,
      };

      await crear(params).then(response => {
        toastSuccess(response.message);
      });
      listarOfertas();
      cancelarEdicion();
    } catch (error) {
      handleErrorMessages("Error al crear oferta", error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarOferta = async (oferta) => {
    setLoading(true);
    try {
      const { id_oferta_dia, nombre_oferta, id_producto, precio_original,
        precio_oferta, start_time, end_time, cantidad_disponible, Activo, id_membresia,

        segundo_id_producto,
        segundo_nombre_oferta,
        segundo_precio_oferta,
      } = oferta;

      const params = {
        id_oferta_dia,
        nombre_oferta,
        id_producto,
        precio_original,
        precio_oferta,
        start_time,
        end_time,
        cantidad_disponible,
        Activo,
        id_membresia,

        segundo_id_producto,
        segundo_nombre_oferta,
        segundo_precio_oferta,
      };

      await actualizar(params);
      toastSuccess("Oferta actualizada exitosamente");
      listarOfertas();
      cancelarEdicion();
    } catch (error) {
      handleErrorMessages("Error al actualizar oferta", error);
    } finally {
      setLoading(false);
    }
  };
  async function eliminarListRowTab(selected, confirm) {
    eliminarOferta(selected, confirm);
  }

  const eliminarOferta = async (id, confirm) => {
    if (!confirm) {
      setSelected(id);
      setIsVisible(true);
      return;
    }

    setLoading(true);
    try {
      await eliminar({ id_oferta_dia: id });
      toastSuccess("Oferta eliminada exitosamente");
      listarOfertas();
    } catch (error) {
      handleErrorMessages("Error al eliminar oferta", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCombos = async () => {
    try {
      const membresias = await listar_membresias();
      setListaMembresias(membresias);
    } catch (error) {
      console.error("Error al cargar combos:", error);
    }
  };

  useEffect(() => {
    listarOfertas();
    cargarCombos();
  }, []);

  return (
    <>
      {modoEdicion ? (
        <OfertaDelDiaEditPage
          {...props}
          accessButton={accessButton}
          titulo={titulo}
          dataRowEditNew={dataRowEditNew}
          cancelarEdicion={cancelarEdicion}
          agregarOferta={agregarOferta}
          actualizarOferta={actualizarOferta}
          listaMembresias={listaMembresias}
        />
      ) : (
        <OfertaDelDiaListPage
          {...props}
          accessButton={accessButton}
          titulo={titulo}
          ofertas={ofertas}
          nuevoRegistro={nuevoRegistro}
          editarRegistro={editarRegistro}
          eliminarOferta={eliminarOferta}
        />
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
};

export default injectIntl(WithLoandingPanel(OfertaDelDiaIndexPage));