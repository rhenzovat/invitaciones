import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  actualizar,
  actualizarLogos,
  buildFooterTextPayload,
} from "../../../api/web_footer.api";
import FooterEditPage from "./FooterEditPage";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../../utils/useAccesosObjetos";
import ModalDocumentIndexPage from "../../../components/Modales/modal_footer/ModalDocumentIndexPage";
import { resizeImageFile } from "../../../utils/resizeImageFile";

const FooterIndexPage = (props) => {
  const { accessButton } = UseAccesosObjetos();
  const { setLoading } = props;
  const intl = useIntl();
  const [titulo] = useState("Información corporativa");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [visibleModalFooter, setVisibleModalFooter] = useState(false);
  const [idFooterTerminos, setIdFooterTerminos] = useState(0);
  const [cmsPanelOpen, setCmsPanelOpen] = useState(false);

  async function actualizarFooter(dataRow) {
    setLoading(true);
    const { logo_menu_file, logo_footer_file, img_central_file, ...rest } = dataRow;

    try {
      let logoResult = null;

      if (logo_menu_file || logo_footer_file || img_central_file) {
        const fd = new FormData();
        fd.append("id_footer", String(rest.id_footer ?? 1));
        if (logo_menu_file) {
          const f = await resizeImageFile(logo_menu_file, 800, 800);
          fd.append("logo_menu", f, f.name || "logo_menu.jpg");
        }
        if (logo_footer_file) {
          const f = await resizeImageFile(logo_footer_file, 800, 800);
          fd.append("logo_footer", f, f.name || "logo_footer.jpg");
        }
        if (img_central_file) {
          const f = await resizeImageFile(img_central_file, 1200, 1200);
          fd.append("qr", f, f.name || "qr.jpg");
        }
        logoResult = await actualizarLogos(fd);
      }

      const payload = buildFooterTextPayload({ ...rest, id_footer: rest.id_footer ?? 1 });
      await actualizar(payload);

      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));

      const refreshed = await obtener({ id: 1 });
      const row = Array.isArray(refreshed) ? refreshed[0] : refreshed;
      const merged = logoResult
        ? { ...row, ...logoResult, esNuevoRegistro: false }
        : { ...row, esNuevoRegistro: false };
      setDataRowEditNew(merged);
    } catch (err) {
      const msg =
        err?.response?.data?.message
        || err?.response?.data?.errors
        || err?.message;
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        typeof msg === "string" ? { message: msg } : err
      );
    } finally {
      setLoading(false);
    }
  }

  async function obtenerRegistro() {
    setLoading(true);
    try {
      const response = await obtener({ id: 1 });
      const row = Array.isArray(response) ? response[0] : response;
      setDataRowEditNew({ ...row, esNuevoRegistro: false });
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }

  const modalOpenDocument = (selected) => {
    const { id_footer_terminos } = selected;
    setIdFooterTerminos(id_footer_terminos);
    setVisibleModalFooter(true);
  };

  useEffect(() => {
    obtenerRegistro();
  }, []);

  return (
    <>
      <FooterEditPage
        dataRowEditNew={dataRowEditNew}
        actualizarFooter={actualizarFooter}
        titulo={titulo}
        accessButton={accessButton}
        modalOpenDocument={modalOpenDocument}
        onCmsPanelChange={setCmsPanelOpen}
      />

      {visibleModalFooter && (
        <ModalDocumentIndexPage
          idFooterTerminos={idFooterTerminos}
          selectData={null}
          showPopup={{ isVisiblePopUp: visibleModalFooter, setisVisiblePopUp: setVisibleModalFooter }}
          cancelarEdicion={() => setVisibleModalFooter(false)}
          selectionMode={"row"}
          cmsPanelOpen={cmsPanelOpen}
        />
      )}
    </>
  );
};

export default injectIntl(WithLoandingPanel(FooterIndexPage));
