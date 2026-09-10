import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";

import { listar, generar, descargar, eliminar } from "../../api/backup.api";
import BackupListPage from "./BackupListPage";

import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";

const BackupIndexPage = props => {

  const { accessButton } = UseAccesosObjetos();
  const { setLoading } = props;
  const intl = useIntl();

  const [titulo, setTitulo] = useState("Sistema de gestión de backup");
  const [listarBackups, setListarBackups] = useState([]);

  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});

  async function listarRegistros() {
    setLoading(true);

    await listar()
      .then(response => {
        setListarBackups(response);
      })
      .catch(err => {
        handleErrorMessages("Error", err);
      })
      .finally(() => setLoading(false));
  }

  async function generarBackup() {
    setLoading(true);

    await generar()
      .then(response => {
        if (response.success) {
          toastSuccess("Backup generado correctamente");
          listarRegistros();
        } else {
          handleErrorMessages("Error", response.message);
        }
      })
      .catch(err => handleErrorMessages("Error", err))
      .finally(() => setLoading(false));
  }

  async function descargarBackup(data) {
    setLoading(true);

    await descargar(data.id_backup)
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", data.nombre_archivo);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(err => handleErrorMessages("Error", err))
      .finally(() => setLoading(false));
  }

  async function eliminarRegistro(backup, confirm) {
    setSelected(backup);
    setIsVisible(!confirm);

    if (confirm) {
      setLoading(true);

      const { id_backup } = backup;

      await eliminar(id_backup)
        .then(response => {
          if (response.success) {
            toastSuccess("Backup eliminado correctamente");
            listarRegistros();
          } else {
            handleErrorMessages("Error", response.message);
          }
        })
        .catch(err => handleErrorMessages("Error", err))
        .finally(() => setLoading(false));
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
      <BackupListPage
        listarBackups={listarBackups}
        titulo={titulo}
        generarBackup={generarBackup}
        descargarBackup={descargarBackup}
        eliminarRegistro={eliminarRegistro}
        accessButton={accessButton}
      />
      <Confirm
        message="¿Desea eliminar este backup?"
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title="Confirmar eliminación"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(BackupIndexPage));