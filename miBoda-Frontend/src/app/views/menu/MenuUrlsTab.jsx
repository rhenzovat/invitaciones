import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import LinkIcon from "@mui/icons-material/Link";
import { listarRutasSistema } from "../../api/menu.api";
import { buildSistemaUrlsRows, filterSistemaUrlsRows } from "../../utils/menuUrlIndex";

const GRUPO_COLORS = {
  admin: "primary",
  web: "success",
  api: "warning",
  material: "default",
  session: "secondary",
  menu: "info",
  externo: "error",
  ancla: "default",
  otro: "default",
};

function GrupoChip({ grupo }) {
  return (
    <Chip
      size="small"
      label={grupo || "otro"}
      color={GRUPO_COLORS[grupo] || "default"}
      variant="outlined"
      sx={{ textTransform: "capitalize", fontSize: "0.7rem" }}
    />
  );
}

export default function MenuUrlsTab({ menus = [] }) {
  const [laravelRoutes, setLaravelRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [search, setSearch] = useState("");
  const [grupo, setGrupo] = useState("todos");
  const [soloMenu, setSoloMenu] = useState(false);
  const [soloSinMenu, setSoloSinMenu] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingRoutes(true);
    listarRutasSistema()
      .then((data) => {
        if (!cancelled) setLaravelRoutes(data || []);
      })
      .catch(() => {
        if (!cancelled) setLaravelRoutes([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRoutes(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allRows = useMemo(
    () => buildSistemaUrlsRows({ menus, laravelRoutes }),
    [menus, laravelRoutes]
  );

  const filtered = useMemo(
    () => filterSistemaUrlsRows(allRows, { search, grupo, soloMenu, soloSinMenu }),
    [allRows, search, grupo, soloMenu, soloSinMenu]
  );

  const stats = useMemo(() => {
    const enMenu = allRows.filter((r) => r.enMenu).length;
    const sinMenu = allRows.filter((r) => r.url && !r.enMenu).length;
    return { total: allRows.length, enMenu, sinMenu, visibles: filtered.length };
  }, [allRows, filtered.length]);

  const gruposOpciones = useMemo(() => {
    const set = new Set(allRows.map((r) => r.grupo).filter(Boolean));
    return ["todos", ...Array.from(set).sort()];
  }, [allRows]);

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Chip size="small" label={`Total: ${stats.total}`} />
        <Chip size="small" color="info" variant="outlined" label={`En menú: ${stats.enMenu}`} />
        <Chip size="small" color="warning" variant="outlined" label={`Rutas sin menú: ${stats.sinMenu}`} />
        <Chip size="small" color="primary" variant="outlined" label={`Mostrando: ${stats.visibles}`} />
        {loadingRoutes && (
          <Chip
            size="small"
            icon={<CircularProgress size={12} />}
            label="Cargando rutas Laravel…"
            variant="outlined"
          />
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar URL, nombre de menú, módulo, ruta…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: "1 1 280px", minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="urls-grupo-label">Grupo</InputLabel>
          <Select
            labelId="urls-grupo-label"
            label="Grupo"
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
          >
            {gruposOpciones.map((g) => (
              <MenuItem key={g} value={g}>
                {g === "todos" ? "Todos" : g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={soloMenu}
              onChange={(e) => {
                setSoloMenu(e.target.checked);
                if (e.target.checked) setSoloSinMenu(false);
              }}
            />
          }
          label="Solo con menú"
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={soloSinMenu}
              onChange={(e) => {
                setSoloSinMenu(e.target.checked);
                if (e.target.checked) setSoloMenu(false);
              }}
            />
          }
          label="Sin asignar en menú"
        />
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 520 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>URL / URI</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 72 }}>Método</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 90 }}>Grupo</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Nombre en menú</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Ruta menú (árbol)</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 120 }}>Módulo</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 80 }}>Menú</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Origen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay resultados para el filtro actual
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, idx) => (
                <TableRow key={`${row.method}-${row.url}-${row.id_menu}-${idx}`} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {row.url ? (
                        <>
                          <LinkIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                          <Typography
                            variant="body2"
                            component="code"
                            sx={{ fontSize: "0.8rem", wordBreak: "break-all" }}
                          >
                            {row.url}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.disabled" fontStyle="italic">
                          (sin URL — contenedor)
                        </Typography>
                      )}
                    </Box>
                    {row.nombreRuta && (
                      <Typography variant="caption" color="text.disabled" display="block">
                        {row.nombreRuta}
                      </Typography>
                    )}
                    {row.label && !row.menuNombre && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {row.label}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{row.method || "—"}</Typography>
                  </TableCell>
                  <TableCell>
                    <GrupoChip grupo={row.grupo} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={row.menuNombre ? 600 : 400}>
                      {row.menuNombre || "—"}
                    </Typography>
                    {row.tieneHijos && (
                      <Typography variant="caption" color="text.secondary">
                        {row.soloContenedor ? "Solo contenedor" : "Tiene submenús"}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {row.menuRuta || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {row.modulo || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.enMenu ? (
                      <Chip
                        size="small"
                        label={row.menuActivo === "N" ? "Inactivo" : "Activo"}
                        color={row.menuActivo === "N" ? "default" : "success"}
                        variant="outlined"
                      />
                    ) : (
                      <Chip size="small" label="—" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {row.origen || "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
        Incluye rutas del panel admin (React), rutas Laravel (web y API) y cada ítem del menú con su ruta
        recursiva (módulo › menú › submenú). Use el buscador para cruzar una URL con su nombre en el menú.
      </Typography>
    </Box>
  );
}
