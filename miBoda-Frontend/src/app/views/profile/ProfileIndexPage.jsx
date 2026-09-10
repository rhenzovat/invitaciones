import React, { useEffect, useState, } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar,
} from "../../api/usuario.api";


import Grid from "@mui/material/Grid2";
import ProfileCard from "./components/ProfileCard";
import SettingsCard from "./components/SettingsCard";
import TwoFactorSettingsCard from "./components/TwoFactorSettingsCard";
import { handleErrorMessages, toastSuccess, handleSuccessMessages } from "../../components/notify-messages";
import { isNotEmpty, } from "../../utils/utils";

//1. Permisos
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";

const ProfileIndexPage = props => {

  //1. Permisos.
  const { perfil, user, refreshUser, updateUser } = props.useAuth();
  const [imagenProfile, setImagenProfile] = React.useState(null);
  // const { accessButton } = UseAccesosObjetos();
  const intl = useIntl();

  const { setLoading } = props;
  const [titulo, setTitulo] = useState("Perfil");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [dataFileBase64, setDataFileBase64] = useState(null);

  async function obtenerRegistro() {
    setLoading(true);
    const id_usuario = user.id;
    await obtener({ id: id_usuario }).then(response => {
      setDataFileBase64(response.fileBase64);
      setDataRowEditNew({ ...response[0], esNuevoRegistro: false });
      if (response.fileBase64 && updateUser) {
        updateUser({ avatar: `data:image/jpeg;base64,${response.fileBase64}` });
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarUsuario(usuarios) {

    setLoading(true);
    const { id, username, email, password, Activo, avatar } = usuarios;

    const formData = new FormData();
    formData.append("image", imagenProfile);
    formData.append("id", id);
    formData.append("name", isNotEmpty(username) ? username : "");
    formData.append("email", isNotEmpty(email) ? email : "");
    formData.append("password", password);
    formData.append("Activo", Activo);
    formData.append("avatar", avatar);

    await actualizar(formData).then(async () => {
      handleSuccessMessages("Información", intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      if (updateUser && imagenProfile) {
        if (typeof imagenProfile === "string" && imagenProfile.startsWith("data:")) {
          updateUser({ avatar: imagenProfile });
        } else if (imagenProfile instanceof File) {
          const reader = new FileReader();
          reader.onload = () => updateUser({ avatar: reader.result });
          reader.readAsDataURL(imagenProfile);
        }
      }
      if (refreshUser) await refreshUser();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  useEffect(() => {
    obtenerRegistro();
  }, []);


  return (
    <div className="content-box analytics">
      <Grid container direction="column" sx={{ overflowX: "hidden" }}>
        <Grid container spacing={3} alignItems="flex-start">
          {/* PROFILE CARD */}
          <Grid size={{ md: 3, xs: 12 }}>
            <ProfileCard
              user={user}
              setImagenProfile={setImagenProfile}
              imagenProfile={imagenProfile}
              dataFileBase64={dataFileBase64}
              dataRowEditNew={dataRowEditNew}
            />
          </Grid>

          {/* SETTINGS CARD */}
          <Grid size={{ md: 9, xs: 12 }}>
            <SettingsCard
              dataRowEditNew={dataRowEditNew}
              actualizarUsuario={actualizarUsuario}
              titulo={titulo}
            />
            <TwoFactorSettingsCard />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
export default injectIntl(WithLoandingPanel(ProfileIndexPage));