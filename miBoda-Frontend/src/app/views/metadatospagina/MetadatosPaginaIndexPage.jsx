import React, { useEffect, useState, useCallback } from "react";
import MetadatosPaginaListPage from "./MetadatosPaginaListPage";
import MetadatosPaginaEditPage from "./MetadatosPaginaEditPage";
import {
  handleErrorMessages,
  handleErrorMessagesSimple,
  toastSuccess,
} from "../../components/notify-messages";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";
import Confirm from "../../components/Confirm";

import { obtener, listar, actualizar, crear, desactivar, restaurar } from "../../api/metadatospagina.api";

const MetadatosPaginaIndexPage = ({ setLoading, ...props }) => {
  const { accessButton } = UseAccesosObjetos();

  const [titulo, setTitulo]           = useState("Listar Metadatos de la Página");
  const [tabLista, setTabLista]       = useState(0);
  const [metadatos, setMetadatos]     = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});

  /* ── Conteos reales de AMBOS tabs (siempre sincronizados) ── */
  const [countsMap, setCountsMap] = useState({ activos: 0, inactivos: 0 });

  const [confirmState, setConfirmState] = useState({
    open: false, tipo: null, id: null,
  });

  const vistaLista = tabLista === 0 ? "activos" : "inactivos";

  /* ── Carga los conteos de ambos tabs en paralelo ── */
  const refrescarConteos = useCallback(async () => {
    try {
      const [resA, resI] = await Promise.all([
        listar({ solo: "activos"   }),
        listar({ solo: "inactivos" }),
      ]);
      setCountsMap({
        activos:   (resA.data || []).length,
        inactivos: (resI.data || []).length,
      });
    } catch (_) {
      /* silencioso — los contadores se actualizarán en la próxima carga normal */
    }
  }, []);

  /* ── Carga la grilla del tab activo + refresca conteos ── */
  const cargarMetadatos = useCallback(async (soloOverride) => {
    const solo = soloOverride ?? (tabLista === 0 ? "activos" : "inactivos");
    setLoading(true);
    try {
      /* Carga grilla y conteos en paralelo */
      const [resGrilla, resA, resI] = await Promise.all([
        listar({ solo }),
        listar({ solo: "activos"   }),
        listar({ solo: "inactivos" }),
      ]);
      setMetadatos(resGrilla.data || []);
      setCountsMap({
        activos:   (resA.data || []).length,
        inactivos: (resI.data || []).length,
      });
    } catch (error) {
      handleErrorMessages("Error al cargar metadatos de página", error);
    } finally {
      setLoading(false);
    }
  }, [tabLista, setLoading]);

  /* ── Navigation ── */
  const editarRegistro = (dataRow) => {
    obtenerRegistro(dataRow.id);
    setTitulo("Editar Metadatos de la Página");
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Listar Metadatos de la Página");
    setDataRowEditNew({});
  };

  const nuevoRegistro = () => {
    setDataRowEditNew({
      nombre_pagina: "", titulo_pagina: "",
      descripcion_pagina: "", activo: "S",
      esNuevoRegistro: true,
    });
    setTitulo("Nueva página (metadatos)");
    setModoEdicion(true);
  };

  /* Cambio de tab: actualiza grilla y conteos */
  const handleTabChange = (newTab) => {
    setTabLista(newTab);
    /* cargarMetadatos se ejecuta por el useEffect al cambiar tabLista */
  };

  /* ── Data ── */
  const obtenerRegistro = async (id) => {
    setLoading(true);
    try {
      const response = await obtener({ id });
      const row = response.data?.[0];
      if (!row) {
        handleErrorMessagesSimple("Metadatos", "No se encontró el registro seleccionado.");
        cancelarEdicion();
        return;
      }
      setDataRowEditNew({ ...row, esNuevoRegistro: false });
    } catch (error) {
      handleErrorMessages("Error al obtener metadatos", error);
      cancelarEdicion();
    } finally {
      setLoading(false);
    }
  };

  const crearMetadatos = async (row) => {
    setLoading(true);
    try {
      const slug = String(row.nombre_pagina || "")
        .trim().toLowerCase().replace(/\s+/g, "_");
      const res = await crear({
        nombre_pagina:      slug,
        titulo_pagina:      row.titulo_pagina,
        descripcion_pagina: row.descripcion_pagina,
      });
      toastSuccess(res?.message || "Metadatos creados correctamente");
      setTabLista(0);
      await cargarMetadatos("activos");
      cancelarEdicion();
    } catch (error) {
      handleErrorMessages("Error al crear metadatos", error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarMetadatos = async (row) => {
    setLoading(true);
    try {
      const { id, titulo_pagina, descripcion_pagina } = row;
      const res = await actualizar({ id, titulo_pagina, descripcion_pagina });
      toastSuccess(res?.message || "Metadatos actualizados correctamente");
      await cargarMetadatos();
      cancelarEdicion();
    } catch (error) {
      handleErrorMessages("Error al actualizar metadatos", error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Confirm actions ── */
  const pedirDesactivar = (row) => setConfirmState({ open: true, tipo: "desactivar", id: row.id });
  const pedirRestaurar  = (row) => setConfirmState({ open: true, tipo: "restaurar",  id: row.id });
  const cerrarConfirm   = ()    => setConfirmState({ open: false, tipo: null, id: null });

  const ejecutarConfirm = async () => {
    const { tipo, id } = confirmState;
    if (!tipo || !id) { cerrarConfirm(); return; }
    setLoading(true);
    try {
      if (tipo === "desactivar") {
        const res = await desactivar({ id });
        toastSuccess(res?.message || "Desactivado");
      } else if (tipo === "restaurar") {
        const res = await restaurar({ id });
        toastSuccess(res?.message || "Restaurado");
        setTabLista(0);
      }
      /* Recarga grilla + conteos actualizados */
      await cargarMetadatos(tipo === "restaurar" ? "activos" : undefined);
    } catch (error) {
      handleErrorMessages(
        tipo === "desactivar" ? "Error al desactivar" : "Error al restaurar",
        error
      );
    } finally {
      setLoading(false);
      cerrarConfirm();
    }
  };

  /* ── Efecto: recarga al cambiar tab o salir del modo edición ── */
  useEffect(() => {
    if (modoEdicion) return;
    cargarMetadatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabLista, modoEdicion]);

  /* ── Confirm texts ── */
  const tituloConfirm =
    confirmState.tipo === "desactivar" ? "Desactivar página"
    : confirmState.tipo === "restaurar"  ? "Restaurar registro"
    : "Confirmar";

  const mensajeConfirm =
    confirmState.tipo === "desactivar"
      ? "La página dejará de usarse en el sitio web (no se borra). Podrás reactivarla en la pestaña Inactivas."
      : confirmState.tipo === "restaurar"
        ? "El registro volverá a estar activo y visible en el sitio web."
        : "";

  return (
    <>
      {modoEdicion ? (
        <MetadatosPaginaEditPage
          {...props}
          accessButton={accessButton}
          titulo={titulo}
          dataRowEditNew={dataRowEditNew}
          cancelarEdicion={cancelarEdicion}
          actualizarMetadatos={actualizarMetadatos}
          crearMetadatos={crearMetadatos}
        />
      ) : (
        <MetadatosPaginaListPage
          {...props}
          accessButton={accessButton}
          titulo={titulo}
          metadatos={metadatos}
          vista={vistaLista}
          tabValue={tabLista}
          onTabChange={handleTabChange}
          countsMap={countsMap}
          editarRegistro={editarRegistro}
          nuevoRegistro={nuevoRegistro}
          pedirDesactivar={pedirDesactivar}
          pedirRestaurar={pedirRestaurar}
        />
      )}

      <Confirm
        isVisible={confirmState.open}
        setIsVisible={(v) => { if (!v) cerrarConfirm(); }}
        title={tituloConfirm}
        message={mensajeConfirm}
        onConfirm={ejecutarConfirm}
        confirmText="Sí, continuar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default WithLoandingPanel(MetadatosPaginaIndexPage);
