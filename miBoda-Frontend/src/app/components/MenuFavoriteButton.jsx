import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import useMenuFavoritos from "app/contexts/MenuFavoritosContext";
import { normalizeNavPath } from "app/utils/flattenNavItems";

export default function MenuFavoriteButton({ path, nombre, size = "small", sx }) {
  const { isFavorite, toggleFavorite, favoritos, loading } = useMenuFavoritos();
  const key = normalizeNavPath(path);
  const active = isFavorite(key);

  if (!key || key === "/") return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ path: key, nombre });
  };

  return (
    <Tooltip
      title={
        active
          ? "Quitar de favoritos (este rol)"
          : "Agregar a favoritos (este rol)"
      }
    >
      <IconButton
        size={size}
        onClick={handleClick}
        disabled={loading && favoritos.length === 0}
        sx={{
          color: active ? "#f43f5e" : "rgba(0,0,0,0.45)",
          opacity: active ? 1 : 0.75,
          "&:hover": { color: "#f43f5e", opacity: 1 },
          "& .MuiSvgIcon-root": {
            color: active ? "#f43f5e" : "inherit",
          },
          ...sx,
        }}
        aria-label={active ? "Quitar favorito" : "Agregar favorito"}
      >
        {active ? (
          <FavoriteIcon fontSize={size === "small" ? "small" : "medium"} />
        ) : (
          <FavoriteBorderIcon fontSize={size === "small" ? "small" : "medium"} />
        )}
      </IconButton>
    </Tooltip>
  );
}
