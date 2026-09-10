import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  Box, Typography, Chip, Alert, Button,
  Divider, Tooltip, Stack,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import Form, { Item, GroupItem, RequiredRule, EmailRule, PatternRule } from "devextreme-react/form";
import ValidationEngine from "devextreme/ui/validation_engine";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PersonIcon      from "@mui/icons-material/PersonOutlined";
import GoogleIcon      from "@mui/icons-material/Google";
import AddCircleIcon   from "@mui/icons-material/AddCircleOutline";
import EditNoteIcon    from "@mui/icons-material/EditNote";
import BadgeIcon       from "@mui/icons-material/BadgeOutlined";
import LockIcon        from "@mui/icons-material/LockOutlined";
import ToggleOnIcon    from "@mui/icons-material/ToggleOnOutlined";
import { listarEstadoSimple } from "../../utils/utils";
import UsuarioAuthConfigPanel from "./UsuarioAuthConfigPanel";

/* ── Animación ─────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── Styled ─────────────────────────────────────────────────── */
const PageWrap = styled(Box)(({ theme }) => ({
  margin: "1.5rem 2rem",
  animation: `${fadeUp} 0.3s ease-out`,
  maxWidth: 900,
  [theme.breakpoints.down("sm")]: { margin: "1rem" },
}));

const AvatarCircle = styled(Box)(({ isnew }) => ({
  width: 50,
  height: 50,
  borderRadius: "14px",
  background: isnew === "true"
    ? "linear-gradient(135deg, #22c55e, #16a34a)"
    : "linear-gradient(135deg, #f97316, #ea580c)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: isnew === "true"
    ? "0 4px 14px rgba(34,197,94,0.35)"
    : "0 4px 14px rgba(249,115,22,0.35)",
  flexShrink: 0,
}));

const CardSection = styled(Box)({
  backgroundColor: "#fff",
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
  overflow: "hidden",
  marginBottom: 20,
});

const CardHeader = styled(Box)({
  padding: "12px 20px",
  borderBottom: "1px solid #f1f5f9",
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "linear-gradient(to right, #fafbfc, #f8fafc)",
});

const CardBody = styled(Box)({
  padding: "20px 24px 28px",
});

/* ── Componente ─────────────────────────────────────────────── */
const UsuarioEditPage = (props) => {
  const { accessButton } = props;
  const intl = useIntl();
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [passwordMode, setPasswordMode] = useState("password");

  const isNew  = !!props.dataRowEditNew?.esNuevoRegistro;
  const isGoog = !isNew && Boolean(props.dataRowEditNew?.google_id);
  const username  = props.dataRowEditNew?.username || "";
  const initials  = username ? username.charAt(0).toUpperCase() : "U";

  useEffect(() => { setEstadoSimple(listarEstadoSimple()); }, []);

  const handleGuardar = () => {
    const result = ValidationEngine.validateGroup("FormEdicion");
    if (result.isValid) {
      if (isNew) props.agregarUsuario(props.dataRowEditNew);
      else       props.actualizarUsuario(props.dataRowEditNew);
    }
  };

  return (
    <PageWrap>

      {/* ── TopBar ───────────────────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: 2.5, flexWrap: "wrap", gap: 1.5,
      }}>
        {/* Avatar + título */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <AvatarCircle isnew={String(isNew)}>
            {isNew
              ? <AddCircleIcon sx={{ fontSize: 24, color: "#fff" }} />
              : <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.15rem" }}>{initials}</Typography>
            }
          </AvatarCircle>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#0f172a", lineHeight: 1.2 }}>
              {props?.titulo || (isNew ? "Nuevo usuario" : "Editar usuario")}
            </Typography>
            {!isNew && username && (
              <Box display="flex" alignItems="center" gap={0.8} mt={0.3}>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>@{username}</Typography>
                {isGoog && (
                  <Chip size="small"
                    icon={<GoogleIcon sx={{ fontSize: "11px !important" }} />}
                    label="Google"
                    sx={{ height: 18, fontSize: "0.62rem", bgcolor: "#fff3e0", color: "#e65100", border: "1px solid #fed7aa" }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Botones acción */}
        <Stack direction="row" spacing={1}>
          {accessButton?.crear && (
            <Button
              variant="contained"
              onClick={handleGuardar}
              startIcon={<SaveOutlinedIcon sx={{ fontSize: 17 }} />}
              sx={{
                bgcolor: "#f97316", textTransform: "none", fontWeight: 700,
                fontSize: "0.85rem", borderRadius: "9px", px: 2.5, py: 0.9,
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                "&:hover": { bgcolor: "#ea580c", boxShadow: "0 6px 18px rgba(249,115,22,0.45)", transform: "translateY(-1px)" },
              }}>
              Guardar
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={props.cancelarEdicion}
            startIcon={<CloseOutlinedIcon sx={{ fontSize: 17 }} />}
            sx={{
              textTransform: "none", fontWeight: 600,
              fontSize: "0.85rem", borderRadius: "9px", px: 2.2, py: 0.9,
              borderColor: "#e2e8f0", color: "#64748b",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
            }}>
            Cancelar
          </Button>
        </Stack>
      </Box>

      {/* ── Sección Datos del usuario ─────────────────────────────── */}
      <CardSection>
        <CardHeader>
          <Box sx={{
            width: 32, height: 32, borderRadius: "9px",
            bgcolor: "#fff7ed", border: "1.5px solid #fed7aa",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <PersonIcon sx={{ fontSize: 17, color: "#f97316" }} />
          </Box>
          <Box flex={1}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>
              Datos del usuario
            </Typography>
            <Typography sx={{ fontSize: "0.70rem", color: "#94a3b8" }}>
              Información de cuenta e inicio de sesión
            </Typography>
          </Box>
          {!isNew && (
            <Chip size="small"
              icon={<EditNoteIcon sx={{ fontSize: "13px !important" }} />}
              label="Editando"
              sx={{ height: 22, fontSize: "0.65rem", bgcolor: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd" }}
            />
          )}
        </CardHeader>

        <CardBody>
          {isGoog && (
            <Alert severity="info" icon={<GoogleIcon fontSize="small" />}
              sx={{ mb: 2.5, borderRadius: "10px", fontSize: "0.80rem",
                bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe",
                "& .MuiAlert-icon": { color: "#2563eb" } }}>
              Usuario vinculado a Google — el nombre y correo no se pueden editar desde aquí.
            </Alert>
          )}

          {/* Info chips */}
          <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
            {[
              { icon: <BadgeIcon sx={{ fontSize: 13 }} />, label: "Nombre / Usuario", color: "#6366f1" },
              { icon: <LockIcon  sx={{ fontSize: 13 }} />, label: "Contraseña",        color: "#0891b2" },
              { icon: <ToggleOnIcon sx={{ fontSize: 13 }} />, label: "Estado",         color: "#059669" },
            ].map(({ icon, label, color }) => (
              <Box key={label} sx={{
                display: "flex", alignItems: "center", gap: 0.6,
                px: 1.2, py: 0.4, borderRadius: "7px",
                bgcolor: `${color}10`, border: `1px solid ${color}25`,
              }}>
                <Box sx={{ color }}>{icon}</Box>
                <Typography sx={{ fontSize: "0.67rem", fontWeight: 600, color }}>{label}</Typography>
              </Box>
            ))}
          </Box>

          <Form
            formData={props.dataRowEditNew}
            id="editForm"
            validationGroup="FormEdicion"
            validationMessageMode="always"
          >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item
                dataField="username"
                label={{ text: intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.USERNAME" }) }}
                isRequired
                editorOptions={{ readOnly: isGoog }}
              />
              <Item
                dataField="email"
                label={{ text: intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.EMAL" }) }}
                isRequired
                editorOptions={{ readOnly: isGoog, maxLength: 50 }}
              >
                <RequiredRule message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ISREQUIERD" })} />
                <EmailRule message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.EMAL.INVALID" })} />
              </Item>
              <Item
                dataField="password"
                label={{ text: intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.PASSWORD" }) }}
                editorOptions={{
                  maxLength: 50,
                  mode: passwordMode,
                  showClearButton: true,
                  valueChangeEvent: "keyup",
                  buttons: [{
                    name: "password",
                    location: "after",
                    options: {
                      icon: passwordMode === "password" ? "eyeopen" : "eyeclose",
                      type: "default",
                      onClick: () => setPasswordMode(m => m === "password" ? "text" : "password"),
                    },
                  }],
                }}
              >
                <PatternRule
                  pattern={/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/}
                  message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.PASSWORD.VALIDATION" })}
                />
              </Item>
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

          {/* Footer del card */}
          <Divider sx={{ mt: 3, mb: 2, borderColor: "#f1f5f9" }} />
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button variant="outlined" onClick={props.cancelarEdicion}
              startIcon={<CloseOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
                borderRadius: "9px", px: 2, borderColor: "#e2e8f0", color: "#64748b",
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" } }}>
              Cancelar
            </Button>
            {accessButton?.crear && (
              <Button variant="contained" onClick={handleGuardar}
                startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
                  borderRadius: "9px", px: 2.2,
                  bgcolor: "#f97316", boxShadow: "0 3px 10px rgba(249,115,22,0.3)",
                  "&:hover": { bgcolor: "#ea580c" } }}>
                Guardar cambios
              </Button>
            )}
          </Box>
        </CardBody>
      </CardSection>

      {/* ── Panel configuración de acceso ─────────────────────────── */}
      {!isNew && props.dataRowEditNew?.id && (
        <UsuarioAuthConfigPanel
          idUsuario={props.dataRowEditNew.id}
          email={props.dataRowEditNew.email}
        />
      )}

    </PageWrap>
  );
};

export default UsuarioEditPage;
