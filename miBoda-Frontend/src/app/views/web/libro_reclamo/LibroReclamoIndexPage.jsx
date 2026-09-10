import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
  actualizar,
  eliminar,
} from "../../../api/web_reclamos.api";

import LibroReclamoListPage from "./LibroReclamoListPage";
import LibroReclamoEditPage from "./LibroReclamoEditPage";
import { handleErrorMessages, toastSuccess, confirmAction } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../../utils/useAccesosObjetos";

const LibroReclamoIndexPage = props => {
  const { accessButton } = UseAccesosObjetos();
  console.log("accessButton-libro-reclamaciones:", accessButton);
  const { setLoading } = props;
  const intl = useIntl();

  const [titulo, setTitulo]             = useState("Libro de Reclamaciones");
  const [listarReclamos, setListarReclamos] = useState([]);
  const [modoEdicion, setModoEdicion]   = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo]     = useState('');

  // ----------------------------------------------------------------
  // VER DETALLE
  // ----------------------------------------------------------------
  const verRegistro = dataRow => {
    const { id_web_reclamos } = dataRow;
    setModoEdicion(true);
    setTitulo("Gestionar Reclamo");
    obtenerRegistro({ id: id_web_reclamos });
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Libro de Reclamaciones");
    setDataRowEditNew({});
  };

  // ----------------------------------------------------------------
  // ACTUALIZAR GESTIÓN
  // ----------------------------------------------------------------
  async function actualizarReclamo(datos) {
    setLoading(true);
    const { id_web_reclamos, estado, comentario_atencion, usuario_atencion } = datos;
    const params = {
      id_web_reclamos,
      estado,
      comentario_atencion: comentario_atencion || null,
      usuario_atencion:    usuario_atencion    || null,
    };

    await actualizar(params).then(() => {
      toastSuccess("Reclamo actualizado correctamente");
      setModoEdicion(false);
      listarRegistros();
    }).catch(err => {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
    }).finally(() => { setLoading(false); });
  }

  // ----------------------------------------------------------------
  // ELIMINAR REGISTRO
  // ----------------------------------------------------------------
  const eliminarRegistro = async (dataRow) => {
    const { id_web_reclamos } = dataRow;
    const result = await confirmAction("¿Desea eliminar este reclamo permanentemente?");
    if (result.isConfirmed) {
      setLoading(true);
      await eliminar({ id: id_web_reclamos }).then(() => {
        toastSuccess("Reclamo eliminado correctamente");
        listarRegistros({ estado: filtroEstado, tipo_solicitud: filtroTipo });
      }).catch(err => {
        handleErrorMessages(
          intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
          err
        );
      }).finally(() => { setLoading(false); });
    }
  };

  // ----------------------------------------------------------------
  // LISTAR
  // ----------------------------------------------------------------
  async function listarRegistros(params = {}) {
    setLoading(true);
    const filtros = {};
    if (params.estado)         filtros.estado         = params.estado;
    if (params.tipo_solicitud) filtros.tipo_solicitud = params.tipo_solicitud;

    await listar(filtros).then(response => {
      setListarReclamos(response);
    }).catch(err => {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
    }).finally(() => { setLoading(false); });
  }

  // ----------------------------------------------------------------
  // OBTENER UNO
  // ----------------------------------------------------------------
  async function obtenerRegistro(filtro) {
    const { id } = filtro;
    if (id) {
      const result = await obtener({ id });
      if (result && result.length > 0) {
        setDataRowEditNew({ ...result[0] });
      }
    }
  }

  // ----------------------------------------------------------------
  // FILTROS
  // ----------------------------------------------------------------
  const handleFiltroEstado = (valor) => {
    setFiltroEstado(valor);
    listarRegistros({ estado: valor, tipo_solicitud: filtroTipo });
  };

  const handleFiltroTipo = (valor) => {
    setFiltroTipo(valor);
    listarRegistros({ estado: filtroEstado, tipo_solicitud: valor });
  };

  // ----------------------------------------------------------------
  // INIT
  // ----------------------------------------------------------------
  useEffect(() => {
    listarRegistros();
  }, []);

  return (
    <>
      {modoEdicion && (
        <LibroReclamoEditPage
          cancelarEdicion={cancelarEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarReclamo={actualizarReclamo}
          titulo={titulo}
          accessButton={accessButton}
        />
      )}

      {!modoEdicion && (
        <LibroReclamoListPage
          listarReclamos={listarReclamos}
          verRegistro={verRegistro}
          eliminarRegistro={eliminarRegistro}
          titulo={titulo}
          accessButton={accessButton}
          filtroEstado={filtroEstado}
          filtroTipo={filtroTipo}
          onFiltroEstadoChange={handleFiltroEstado}
          onFiltroTipoChange={handleFiltroTipo}
        />
      )}
    </>
  );
};

export default injectIntl(WithLoandingPanel(LibroReclamoIndexPage));
