import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  EmailRule,
} from "devextreme-react/form";
import { Button as ButtonDev } from "devextreme-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { listarEstadoSimple } from "../../../utils/utils";

const C_PRIMARY = "#cc292e";

export default function SettingsCard(props) {
  const intl = useIntl();
  const [estadoSimple, setEstadoSimple] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      props.actualizarUsuario(props.dataRowEditNew);
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <Box
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(204,41,46,0.06)",
        border: "1px solid rgba(204,41,46,0.08)",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f5f5f7",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #fef2f2, #fff0f0)",
              border: "1px solid rgba(204,41,46,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: 18, color: C_PRIMARY }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>
              {props?.titulo || "Configuración"}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af" }}>
              Edita tu información personal
            </Typography>
          </Box>
        </Box>

        <ButtonDev
          icon="save"
          type="default"
          hint="Grabar"
          onClick={grabar}
          useSubmitBehavior={true}
          validationGroup="FormEdicion"
          stylingMode="contained"
        />
      </Box>

      {/* Form */}
      <Box sx={{ p: 3 }}>
        <Form
          formData={props.dataRowEditNew}
          id="editForm"
          validationGroup="FormEdicion"
          labelLocation="top"
          showColonAfterLabel={false}
        >
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item dataField="avatar" visible={false} />

            <Item
              dataField="username"
              label={{ text: intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.USERNAME" }) }}
              isRequired={true}
              editorOptions={{
                // inputAttr: { style: "text-transform: uppercase" },
              }}
            />
            <Item
              dataField="email"
              label={{ text: intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.EMAL" }) }}
              isRequired={true}
              colSpan={2}
              editorOptions={{
                // inputAttr: { style: "text-transform: uppercase" },
                maxLength: 50,
              }}
            >
              <RequiredRule message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ISREQUIERD" })} />
              <EmailRule message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.EMAL.INVALID" })} />
            </Item>

            <Item
              dataField="password"
              label={{ text: intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.PASSWORD" }) }}
              editorOptions={{
                maxLength: 50,
                // inputAttr: { style: "text-transform: uppercase" },
                mode: "password",
                showClearButton: true,
              }}
            />

            <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ESTADO" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: estadoSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
              }}
            />
          </GroupItem>
        </Form>
      </Box>
    </Box>
  );
}
