import IconButton from "@mui/material/IconButton";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import useMenuFavoritos from "app/contexts/MenuFavoritosContext";
import { normalizeNavPath, pathsMatch } from "app/utils/flattenNavItems";

/** Corazón en ítems del sidebar (visible al hover en modo full). */
export default function MenuFavoriteHeart({ item, mode }) {
  const { isFavorite, toggleFavorite, favoritos, idRoles } = useMenuFavoritos();
  if (!item?.path || mode === "compact") return null;

  const path = normalizeNavPath(item.path);
  const active = isFavorite(path) || favoritos.some((f) => pathsMatch(f.path, path));

  // Ya aparece en la sección FAVORITOS: no duplicar el icono en SISTEMA
  if (active) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      path,
      nombre: item.name,
      icon: item.icon,
      id_menu: item.id_menu,
      id_modulo: item.id_modulo,
      id_roles: idRoles,
    });
  };

  return (
    <IconButton
      size="small"
      onClick={handleClick}
      className={`sidenavHoverShow menu-fav-heart${active ? " menu-fav-heart--on" : ""}`}
      sx={{
        p: 0.25,
        ml: 0.5,
        color: active ? "#fb7185" : "rgba(255,255,255,0.45)",
        opacity: active ? 1 : 0,
        transition: "opacity 150ms ease, color 150ms ease",
        ".navigation &:hover &, .navItemActive &, &.menu-fav-heart--on": { opacity: 1 },
        "&:hover": { color: "#fb7185", background: "rgba(244,63,94,0.12)" },
      }}
      aria-label={active ? "Quitar favorito" : "Agregar favorito"}
    >
      {active ? (
        <FavoriteIcon sx={{ fontSize: 16 }} />
      ) : (
        <FavoriteBorderIcon sx={{ fontSize: 16 }} />
      )}
    </IconButton>
  );
}
