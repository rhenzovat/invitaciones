import {
  Box, Typography, IconButton, Divider, Stack,
  TextField, Button, Switch, Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon  from "@mui/icons-material/Close";
import SaveIcon   from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon    from "@mui/icons-material/Add";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CotizacionSortableCaracteristicas from "./components/CotizacionSortableCaracteristicas";
import CotizacionCmsIconField from "./components/CotizacionCmsIconField";

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,74,153,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#004A99" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
}));

const Tag = styled(Typography)(() => ({
  fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase", color: "#60a5fa", marginBottom: 5, marginTop: 2,
}));

const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

const BLOCK_TITLES = {
  datos: "Editar datos del tipo",
  caracteristicas: "Editar características",
  all: "Editar tipo",
};

export default function CotizacionTipoCmsPanel({
  open, panelLeft = 0, isNew, editBlock = "all", datos, onChange, onSave, onClose, onDelete,
}) {
  const block = isNew ? "all" : (editBlock || "all");
  const showDatos = block === "all" || block === "datos";
  const showCaracteristicas = block === "all" || block === "caracteristicas";

  const rawCar = datos?.caracteristicas ?? datos?.includes;
  const car = Array.isArray(rawCar)
    ? rawCar
    : (() => { try { return JSON.parse(rawCar || "[]"); } catch { return []; } })();

  const setCaracteristicas = (arr) => onChange("caracteristicas", arr);
  const add = () => setCaracteristicas([...car, ""]);
  const update = (i, v) => { const a = [...car]; a[i] = v; setCaracteristicas(a); };
  const remove = (i) => setCaracteristicas(car.filter((_, idx) => idx !== i));

  // ── Funcionalidades PDF ──────────────────────────────────────────────────────
  const rawFuncs = datos?.funcionalidades ?? [];
  const funcs = Array.isArray(rawFuncs)
    ? rawFuncs
    : (() => { try { return JSON.parse(rawFuncs || "[]"); } catch { return []; } })();

  const setFuncs = (arr) => onChange("funcionalidades", arr);
  const addFunc  = () => setFuncs([...funcs, { nombre: "", incluido: true, descripcion: "" }]);
  const updateFunc = (i, field, val) => {
    const arr = [...funcs]; arr[i] = { ...arr[i], [field]: val }; setFuncs(arr);
  };
  const removeFunc = (i) => setFuncs(funcs.filter((_, idx) => idx !== i));

  const F = (label, key, multi = false, rows = 2, ph = "", type = "text") => (
    <DarkField key={key} size="small" fullWidth type={type} label={label}
      value={datos?.[key] ?? ""} multiline={multi} rows={multi ? rows : undefined}
      placeholder={ph} onChange={(e) => onChange(key, e.target.value)} sx={{ mb: 1.5 }} />
  );

  const panelTitle = isNew ? "Nuevo tipo" : (BLOCK_TITLES[block] || BLOCK_TITLES.all);

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(0,0,0,0.25)",
        position: "sticky", top: 0, zIndex: 1, gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
            {panelTitle}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
            {isNew ? "Completa los campos y guarda" : datos?.titulo || ""}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#60a5fa" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
        {showDatos && (
          <>
            <Tag>Identificación</Tag>
            <CotizacionCmsIconField
              Field={DarkField}
              label="Ícono (clase Bootstrap, ej. bi-rocket-takeoff)"
              fieldKey="icono"
              value={datos?.icono}
              onChange={onChange}
              placeholder="bi-rocket-takeoff"
            />
            {F("Slug", "slug", false, 1, "landing-page")}
            {F("Título", "titulo", false, 1, "Landing Page")}
            {F("Texto principal", "descripcion", true, 3, "Convierte visitantes en clientes...")}
            {F("Subtexto emocional", "subtexto_emocional", true, 2, "Ideal para campañas y emprendimientos...")}
            {F("Frase destacada (visual)", "frase_destacada", false, 1, "Ideal para promocionar servicios...")}
            {F("Badge (ej. Más solicitado)", "badge_etiqueta", false, 1, "Más solicitado")}
            {F("Texto del botón", "texto_boton", false, 1, "Quiero Mi Landing Page")}

            <Sep />
            <Tag>Precio y tiempo</Tag>
            {F("Precio base (S/.)", "precio_base", false, 1, "250", "number")}
            {F("Tiempo de entrega", "tiempo_entrega", false, 1, "5 a 10 días hábiles")}

            {block === "all" && (
              <>
                <Sep />
                <Tag>Opciones</Tag>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Switch size="small" checked={datos?.requiere_modulos === "S"}
                    onChange={(e) => onChange("requiere_modulos", e.target.checked ? "S" : "N")}
                    sx={{ "& .MuiSwitch-thumb": { bgcolor: datos?.requiere_modulos === "S" ? "#004A99" : "#94a3b8" } }} />
                  <Typography variant="caption" sx={{ color: "#f1f5f9" }}>Requiere módulos extras</Typography>
                </Box>
              </>
            )}
          </>
        )}

        {showDatos && showCaracteristicas && <Sep />}

        {showCaracteristicas && (
          <>
            <Tag>Características incluidas</Tag>
            <CotizacionSortableCaracteristicas
              items={car}
              onChange={setCaracteristicas}
              onRemove={remove}
              emptyHint="Sin características — agrega ítems abajo"
              renderField={(item, i) => (
                <DarkField
                  size="small"
                  fullWidth
                  value={item}
                  placeholder={`Característica ${i + 1}`}
                  onChange={(e) => update(i, e.target.value)}
                  sx={{ mb: 0 }}
                />
              )}
            />
            <Button size="small" startIcon={<AddIcon />} onClick={add}
              sx={{ color: "#60a5fa", textTransform: "none", fontSize: "0.72rem" }}>
              Agregar característica
            </Button>

            <Sep />

            {/* ── Funcionalidades PDF ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Tag sx={{ mb: 0, mt: 0 }}>Funcionalidades PDF</Tag>
              <Chip label="PDF" size="small" sx={{ fontSize: "0.55rem", height: 16, bgcolor: "#1e3a8a", color: "#93c5fd" }} />
            </Box>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1, fontSize: "0.60rem", lineHeight: 1.4 }}>
              Tabla que aparece en presupuesto y proforma. Activa el interruptor si la funcionalidad está incluida.
            </Typography>

            {funcs.length === 0 && (
              <Typography variant="caption" sx={{ color: "#475569", display: "block", mb: 1, fontStyle: "italic", fontSize: "0.65rem" }}>
                Sin funcionalidades — agrega filas abajo
              </Typography>
            )}

            {funcs.map((f, i) => (
              <Box key={i} sx={{ display: "flex", gap: 0.5, alignItems: "center", mb: 0.7 }}>
                {/* Nombre */}
                <DarkField
                  size="small"
                  value={f.nombre ?? ""}
                  placeholder="Funcionalidad"
                  onChange={(e) => updateFunc(i, "nombre", e.target.value)}
                  sx={{ flex: 2, mb: 0, "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
                />
                {/* Descripción */}
                <DarkField
                  size="small"
                  value={f.descripcion ?? ""}
                  placeholder="Descripción"
                  onChange={(e) => updateFunc(i, "descripcion", e.target.value)}
                  sx={{ flex: 2, mb: 0, "& .MuiInputBase-input": { fontSize: "0.75rem" } }}
                />
                {/* Incluido toggle */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, px: 0.3 }}>
                  <Switch
                    size="small"
                    checked={!!f.incluido}
                    onChange={(e) => updateFunc(i, "incluido", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-thumb": { bgcolor: f.incluido ? "#16a34a" : "#6b7280" },
                      "& .MuiSwitch-track": { bgcolor: f.incluido ? "#16a34a55" : "#6b728055" },
                    }}
                  />
                  <Typography sx={{ fontSize: "0.52rem", color: f.incluido ? "#4ade80" : "#6b7280", lineHeight: 1 }}>
                    {f.incluido ? "Si" : "No"}
                  </Typography>
                </Box>
                {/* Quitar */}
                <IconButton
                  size="small"
                  onClick={() => removeFunc(i)}
                  sx={{ color: "#ef4444", p: 0.3, flexShrink: 0, "&:hover": { color: "#fca5a5" } }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}

            <Button size="small" startIcon={<AddIcon />} onClick={addFunc}
              sx={{ color: "#34d399", textTransform: "none", fontSize: "0.72rem", mt: 0.3 }}>
              Agregar funcionalidad
            </Button>
          </>
        )}
      </Box>

      <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={onSave}
              sx={{ bgcolor: "#004A99", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#003580" } }}>
              {isNew ? "Crear tipo" : "Guardar cambios"}
            </Button>
            <Button variant="outlined" onClick={onClose}
              sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
          {!isNew && block === "all" && (
            <Button fullWidth variant="outlined" startIcon={<DeleteIcon />} onClick={onDelete}
              sx={{ borderColor: "rgba(239,68,68,0.5)", color: "#ef4444", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
              Eliminar tipo
            </Button>
          )}
        </Stack>
      </Box>
    </CmsPanelRoot>
  );
}
