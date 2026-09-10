import React, { useEffect, useState, useCallback, useRef } from "react";
import { useIntl, injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";
import PreciosPesoListPage from "./PreciosPesoListPage";
import PreciosPesoEditPage from "./PreciosPesoEditPage";
import { listarPreciosPeso, listar_productos, importarPreciosPesoExcel, crearPrecioPeso, eliminarPrecioPeso, actualizarPrecioPeso, obtenerPrecioPeso, descargar_reporte, } from "../../api/envios.api";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import ConfirmEnvio from "../../components/ConfirmEnvio";
import { listarEstadoSimple, isNotEmpty, dateFormat, } from "../../utils/utils";
import EmpleadosIndexPage from "../../components/Modales/modal_x_peso/EmpleadosIndexPage";

const EnviosIndexPage = ({ setLoading, ...props }) => {
const { accessButton } = UseAccesosObjetos();
  const fileInputRef = useRef(null);
  const intl = useIntl();

  const [titulo, setTitulo] = useState("Lista de Envios x Preso");
  const [tituloPrecio, setTituloPrecio] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [listarPrecios, setListarPrecios] = useState([]);
  const [visibleModalEmpleados, setVisibleModalEmpelados] = useState(false);
  const [listarPesosPrecios, setListarPesosPrecios] = useState({});
  const [isVisibleImportConfirm, setIsVisibleImportConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  // Funciones para Precios por Peso
  const nuevoPrecioPeso = () => {
    setDataRowEditNew({
      Activo: 'S',
      esNuevoRegistro: true,
      rango_min: 0,
      rango_max: 1,
      precio: 0
    });
    setTitulo(intl.formatMessage({ id: "ENVIO.TITULO.NUEVO_PRECIO" }));
    setModoEdicion(true);
  };
  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Lista de Envios x Preso");
    setDataRowEditNew({});
  };

  const editarPrecioPeso = (dataRow) => {
    // setTitulo(intl.formatMessage({ id: "ENVIO.TITULO.EDITAR_PRECIO" }));
    obtenerRegistro(dataRow);
    setVisibleModalEmpelados(true);
  };


  async function obtenerRegistro(dataRow) {
    const { paquete_medidas,  peso_kilogramo } = dataRow;

    if (paquete_medidas) {
      let datosAPI = await obtenerPrecioPeso({ paquete_medidas,  peso_kilogramo });
      // Actualizamos el estado con los datos listos para el formulario
      setListarPesosPrecios(datosAPI.data);
      setTituloPrecio(dataRow);
      setLoading(false);
    }
  }

  const eliminarPrecioPeso_ = async (data, confirm) => {
    const { id_precio_peso } = data;
    if (!confirm) {
      setSelected(id_precio_peso);
      setIsVisible(true);
      return;
    }

    setLoading(true);
    try {
      await eliminarPrecioPeso(selected);
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      cargarDatosPrecios();
    } catch (error) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const cargarDatosPrecios = async () => {
    setLoading(true);
    try {
      const data = await listar_productos();
      console.log('%c [test]-90', 'font-size:13px; background:pink; color:#bf2c9f;', data)
      setListarPrecios(data);
    } catch (error) {
      handleErrorMessages("Error al cargar precios por peso", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea un archivo Excel
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      handleErrorMessages("Error", "Por favor, seleccione un archivo Excel válido (.xlsx, .xls, .csv)");
      return;
    }

    // Guardar archivo y mostrar confirmación
    setPendingFile(file);
    setIsVisibleImportConfirm(true);
  };

  const confirmarImport = async () => {
    if (!pendingFile) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('archivo_excel', pendingFile);

      await importarPreciosPesoExcel(formData);
      toastSuccess(intl.formatMessage({ id: "ENVIO.NOTIFICACION.IMPORTACION_EXITOSA" }));
      cargarDatosPrecios();
    } catch (error) {
      handleErrorMessages("Error al importar archivo", error);
    } finally {
      setLoading(false);
      setPendingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  async function descargaReporte() {
    setLoading(true);
    await descargar_reporte().then(response => {
      if (isNotEmpty(response.fileName)) {
        let download = document.createElement('a');
        download.href = response.fileBase64;
        download.download = response.fileName;
        download.click();
        // handleSuccessMessages( intl.formatMessage({ id: "COMMON.MESSAGES.DOWNLOAD.SUCESS" }));
        toastSuccess(intl.formatMessage({ id: "COMMON.MESSAGES.DOWNLOAD.SUCESS" }));
        setLoading(false);
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading_reporte(false)
      setLoading(false);
    });
  }

  useEffect(() => {
    cargarDatosPrecios();
  }, []);

  return (
    <>
      <PreciosPesoListPage
        {...props}
        accessButton={accessButton}
        titulo={titulo}
        listarPrecios={listarPrecios}
        nuevoRegistro={nuevoPrecioPeso}
        editarRegistro={editarPrecioPeso}
        eliminarRegistro={(e) => eliminarPrecioPeso_(e.data, false)}
        handleImportExcel={handleImportExcel}
        triggerFileInput={triggerFileInput}
        fileInputRef={fileInputRef}
        descargaReporte={descargaReporte}

      />

      {/*** Confirmación -> Importar Excel ****/}
      <ConfirmEnvio
        isVisible={isVisibleImportConfirm}
        setIsVisible={setIsVisibleImportConfirm}
        title="Importar Excel"
        message={`¿Está seguro que desea importar el archivo "${pendingFile?.name}"? Esta acción reemplazará los datos existentes.`}
        confirmText="Importar"
        cancelText="Cancelar"
        onConfirm={confirmarImport}
        onHide={() => {
          setPendingFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />

      {/*** PopUp -> lista empleados ****/}
      {visibleModalEmpleados && (
        <EmpleadosIndexPage
          listarPesosPrecios={listarPesosPrecios}
             tituloPrecio={tituloPrecio}
          // selectData={obtenerEmpleados}
          showPopup={{ isVisiblePopUp: visibleModalEmpleados, setisVisiblePopUp: setVisibleModalEmpelados }}
          cancelarEdicion={() => setVisibleModalEmpelados(false)}
          selectionMode={"row"}
        />
      )}

    </>
  );
};

export default injectIntl(WithLoandingPanel(EnviosIndexPage));