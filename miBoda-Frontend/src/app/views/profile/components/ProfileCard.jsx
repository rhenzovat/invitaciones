import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import { Avatar } from "@files-ui/react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import TagIcon from "@mui/icons-material/Tag";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// Paleta corporativa royalsensorymassage
const C = {
  primary: "#cc292e",
  dark: "#a82024",
  light: "#e04347",
  bg: "#fef2f2",
  bgSoft: "#fff5f5",
  accent: "#ffc107",
};

export default function ProfileCard(props) {
  const [openModal, setOpenModal] = useState(false);

  const handleChangeSource = (selectedFile) => {
    props.setImagenProfile(selectedFile);
  };

  const { user, dataRowEditNew } = props;
  const isActive = dataRowEditNew?.Activo === "S" || dataRowEditNew?.Activo === 1;

  const avatarSrc = props.imagenProfile
    ? props.imagenProfile
    : props.dataFileBase64
      ? `data:image/jpeg;base64,${props.dataFileBase64}`
      : undefined;

  return (
    <>
      {/* ===== CARD PRINCIPAL ===== */}
      <Box
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(204,41,46,0.06)",
          border: "1px solid rgba(204,41,46,0.08)",
          transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
          "&:hover": {
            boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 12px 32px rgba(204,41,46,0.12)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Cover */}
        <Box
          sx={{
            height: 90,
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.light} 60%, ${C.accent} 100%)`,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            },
          }}
        />

        {/* Avatar */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: "-40px", px: 2, pb: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.primary}, ${C.light})`,
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
                  "&:hover": { transform: "scale(1.2) rotate(12deg)" },
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 13, color: "#fff" }} />
              </Box>
            }
          >
            <Avatar
              src={avatarSrc}
              alt="Avatar"
              onChange={handleChangeSource}
              style={{
                width: 80,
                height: 80,
                border: "3px solid #fff",
                boxShadow: "0 4px 16px rgba(204,41,46,0.18)",
                borderRadius: "50%",
              }}
            />
          </Badge>

          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", mt: 1.2, textAlign: "center", lineHeight: 1.3 }}>
            {user?.name || "Usuario"}
          </Typography>

          <Typography sx={{ fontSize: "0.75rem", color: "#8b8fa3", mt: 0.2, textAlign: "center", wordBreak: "break-all" }}>
            {user?.email || ""}
          </Typography>

          {dataRowEditNew?.Activo !== undefined && (
            <Chip
              icon={<FiberManualRecordIcon sx={{ fontSize: "8px !important" }} />}
              label={isActive ? "Activo" : "Inactivo"}
              size="small"
              sx={{
                mt: 1,
                fontWeight: 600,
                fontSize: "0.68rem",
                height: 22,
                backgroundColor: isActive ? "#ecfdf5" : C.bg,
                color: isActive ? "#059669" : C.primary,
                borderRadius: "6px",
                "& .MuiChip-icon": { color: isActive ? "#059669" : C.primary },
              }}
            />
          )}
        </Box>

        {/* Stats pills */}
        <Box sx={{ mx: 1.5, mb: 1.5, display: "flex", gap: 0.8 }}>
          <StatPill label="Rol" value="Usuario" />
          <StatPill
            label="Estado"
            value={isActive ? "Activo" : "Inactivo"}
            valueColor={isActive ? "#059669" : C.primary}
          />
        </Box>

        {/* Boton Ver Detalle */}
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            onClick={() => setOpenModal(true)}
            disableElevation
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              py: 0.9,
              fontWeight: 600,
              fontSize: "0.8rem",
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.light} 100%)`,
              color: "#fff",
              transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
              "&:hover": {
                background: `linear-gradient(135deg, ${C.dark} 0%, ${C.primary} 100%)`,
                transform: "translateY(-1px)",
                boxShadow: `0 6px 20px rgba(204,41,46,0.35)`,
              },
              "&:active": { transform: "translateY(0)" },
            }}
          >
            Ver Detalle
          </Button>
        </Box>
      </Box>

      {/* ===== MODAL DETALLE ===== */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(204,41,46,0.15), 0 10px 30px rgba(0,0,0,0.08)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.light} 60%, ${C.accent} 100%)`,
            px: 3,
            pt: 3,
            pb: 5,
            position: "relative",
            textAlign: "center",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
            },
          }}
        >
          <IconButton
            onClick={() => setOpenModal(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "rgba(255,255,255,0.6)",
              zIndex: 1,
              transition: "all 0.2s",
              "&:hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.12)", transform: "rotate(90deg)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.25)",
                mx: "auto",
                mb: 1.2,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Box sx={{ width: "100%", height: "100%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PersonOutlineIcon sx={{ fontSize: 30, color: "rgba(255,255,255,0.6)" }} />
                </Box>
              )}
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>
              {user?.name || "Usuario"}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", mt: 0.2 }}>
              Detalle del perfil
            </Typography>
          </Box>
        </Box>

        {/* Contenido */}
        <DialogContent sx={{ p: 0, mt: -2.5 }}>
          <Box
            sx={{
              mx: 2,
              mb: 2,
              backgroundColor: "#fff",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <ModalRow
              icon={<PersonOutlineIcon sx={{ fontSize: 18, color: C.primary }} />}
              label="Usuario"
              value={dataRowEditNew?.username || user?.name || "-"}
            />
            <ModalRow
              icon={<EmailOutlinedIcon sx={{ fontSize: 18, color: C.primary }} />}
              label="Correo electr\u00f3nico"
              value={dataRowEditNew?.email || user?.email || "-"}
            />
            <ModalRow
              icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 18, color: isActive ? "#059669" : C.primary }} />}
              label="Estado"
              value={
                <Chip
                  size="small"
                  label={isActive ? "Activo" : "Inactivo"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.68rem",
                    height: 22,
                    borderRadius: "6px",
                    backgroundColor: isActive ? "#ecfdf5" : C.bg,
                    color: isActive ? "#059669" : C.primary,
                  }}
                />
              }
            />
            {dataRowEditNew?.id && (
              <ModalRow
                icon={<TagIcon sx={{ fontSize: 18, color: C.primary }} />}
                label="ID de Usuario"
                value={`#${dataRowEditNew.id}`}
                isLast
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            fullWidth
            onClick={() => setOpenModal(false)}
            disableElevation
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              py: 0.9,
              fontWeight: 600,
              fontSize: "0.8rem",
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              transition: "all 0.2s",
              "&:hover": { backgroundColor: "#e5e7eb", color: "#374151" },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/* Pill de estad\u00edsticas */
function StatPill({ label, value, valueColor }) {
  return (
    <Box
      sx={{
        flex: 1,
        textAlign: "center",
        py: 1,
        px: 0.5,
        backgroundColor: "#fafbfc",
        borderRadius: "10px",
        border: "1px solid #f0f1f3",
        transition: "all 0.2s",
        "&:hover": { backgroundColor: "#fff5f5", borderColor: "rgba(204,41,46,0.12)" },
      }}
    >
      <Typography sx={{ fontSize: "0.6rem", fontWeight: 600, color: "#b0b5c0", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.2 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: valueColor || "#2d3142" }}>
        {value}
      </Typography>
    </Box>
  );
}

/* Fila del modal */
function ModalRow({ icon, label, value, isLast }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.4,
        borderBottom: isLast ? "none" : "1px solid #f5f5f7",
        transition: "all 0.2s",
        cursor: "default",
        "&:hover": {
          backgroundColor: "#fff8f8",
          "& .modal-row-icon": { transform: "scale(1.08)" },
        },
      }}
    >
      <Box
        className="modal-row-icon"
        sx={{
          width: 34,
          height: 34,
          borderRadius: "8px",
          background: `linear-gradient(135deg, ${C.bg}, #fff0f0)`,
          border: "1px solid rgba(204,41,46,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "transform 0.2s",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 500, lineHeight: 1, mb: 0.3 }}>
          {label}
        </Typography>
        {typeof value === "string" ? (
          <Typography sx={{ fontSize: "0.83rem", fontWeight: 600, color: "#1f2937", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Box>
  );
}
