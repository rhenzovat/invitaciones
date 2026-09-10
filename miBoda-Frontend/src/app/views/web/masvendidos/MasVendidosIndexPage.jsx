import React, { useEffect, useState, } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  listar,
  actualizar,
} from "../../../api/web_masvendido.api";
import MasVendidosEditPage from "./MasVendidosEditPage";
import { handleErrorMessages, toastSuccess, handleSuccessMessages, } from "../../../components/notify-messages";
import Grid from '@mui/material/Grid';
//1. Permisos
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../../utils/useAccesosObjetos";

const MasVendidosIndexPage = props => {
  //1. Permisos.
const { accessButton } = UseAccesosObjetos();
  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Seleccione lo más vendido");
  const [dataRowEditNew, setDataRowEditNew] = useState({});

  async function actualizarVendido(dataRow) {

    setLoading(true);
    const { id_mas_vendido, titulo, descripcion,precio, urlFileTem, Activo, } = dataRow;
    const formData = new FormData();
    formData.append("id_mas_vendido", id_mas_vendido);
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);

    formData.append("image", urlFileTem);
    formData.append("Activo", Activo);
    await actualizar(formData).then(response => { //response: Sale 1 como resultado
      handleSuccessMessages("Información", intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function obtenerRegistro() {
    let datos = await listar();
    setDataRowEditNew(datos);
  }

  useEffect(() => {
    obtenerRegistro();
  }, []);

  return (
    <>
      <Grid container spacing={2}>
        {
          Object.keys(dataRowEditNew).length > 0 && (
            dataRowEditNew.map((item, index) => {
              return (
                <Grid item xs={4} >
                  <MasVendidosEditPage
                    dataRowEditNew={item}
                    actualizarVendido={actualizarVendido}
                    titulo={titulo}
                    accessButton={accessButton}
                  />
                </Grid>
              )
            })
          )
        }
      </Grid>
    </>
  );
}

export default injectIntl(WithLoandingPanel(MasVendidosIndexPage));