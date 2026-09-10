import React, { useState, useMemo } from "react";
import { injectIntl } from "react-intl";
import { TreeView } from "devextreme-react";// Button, DropDownButton,

import { isNotEmpty } from "../../../utils/utils";
import PropTypes from "prop-types";

/**
 * Normaliza un ítem del tree: acepta claves en mayúsculas o como vienen del API.
 */
function normalizeItem(item) {
  const idMenu = item.IdMenu ?? item.idmenu;
  const idPadre = item.IdMenuPadre ?? item.idmenupadre;
  const idMenuObjetos = item.id_menu_objetos ?? item.idMenuObjetos;
  const idObjeto = item.IdObjeto ?? item.idObjeto ?? idMenuObjetos;
  const menu = item.Menu ?? item.menu;
  const nombre = item.Nombre ?? item.nombre;
  const icon = item.Icon ?? item.icon;
  const icono = item.Icono ?? item.icono;
  const tipo = item.Tipo ?? item.tipo;
  const nivel = item.Nivel ?? item.nivel;
  const selected = item.selected;
  const expanded = item.Expanded ?? item.expanded;
  return {
    ...item,
    IdMenu: idMenu != null ? String(idMenu) : undefined,
    IdMenuPadre: idPadre != null ? String(idPadre) : null,
    id_menu_objetos: idMenuObjetos,
    IdObjeto: idObjeto,
    Menu: menu ?? nombre,
    Nombre: nombre ?? menu,
    Icon: icon ?? icono,
    Icono: icono ?? icon,
    Tipo: tipo,
    Nivel: nivel,
    selected: selected === true || selected === 1 || selected === "1",
    Expanded: expanded === true || expanded === 1 || expanded === "1",
  };
}

/**
 * Garantiza claves únicas y jerarquía correcta para el TreeView.
 * Usa Tipo (modulo/menu/objeto) e ids para treeKey y parentTreeKey para que los objetos
 * cuelguen siempre del menú correcto (parentTreeKey = 'm' + id_menu).
 */
export function ensureUniqueTreeKeys(items, keyExpr, parentIdExpr) {
  if (!Array.isArray(items) || items.length === 0) return items;
  if (items.every((item) => item != null && item.treeKey != null)) {
    return items;
  }
  const normalized = items.map(normalizeItem);
  const keySet = new Set();

  const getKeys = (item, index) => {
    const tipo = (item.Tipo || "").toLowerCase();
    const idMenu = item.IdMenu;
    const idPadre = item.IdMenuPadre;
    const idMenuNum = item.id_menu;
    const idMenuObjetos = item.id_menu_objetos;

    let treeKey;
    let parentTreeKey = null;

    if (tipo === "modulo") {
      treeKey = idMenu != null ? String(idMenu) : `mod_${index}`;
      if (!treeKey.startsWith("mod_")) treeKey = `mod_${treeKey}`;
      parentTreeKey = null;
    } else if (tipo === "objeto") {
      treeKey = (typeof idMenu === "string" && (idMenu.startsWith("o") || idMenu.startsWith("om")))
        ? idMenu
        : (idMenuObjetos != null ? `o${idMenuObjetos}` : (idMenu != null ? `o${idMenu}` : `o-${index}`));
      parentTreeKey = idMenuNum != null ? `m${idMenuNum}` : (idPadre != null ? String(idPadre) : null);
    } else {
      treeKey = idMenu != null ? String(idMenu) : `m${idMenuNum}-${index}`;
      if (!treeKey.startsWith("m") && !treeKey.startsWith("mod_")) treeKey = `m${treeKey}`;
      parentTreeKey = idPadre != null && idPadre !== "" ? String(idPadre) : null;
    }

    let finalKey = treeKey;
    if (keySet.has(finalKey)) {
      finalKey = `${treeKey}-${index}`;
    }
    keySet.add(finalKey);

    return { treeKey: finalKey, parentTreeKey };
  };

  const withKeys = normalized.map((item, index) => {
    const { treeKey, parentTreeKey } = getKeys(item, index);
    return { ...item, treeKey, parentTreeKey };
  });

  const sorted = [...withKeys].sort((a, b) => {
    const na = Number(a.Nivel) || 0;
    const nb = Number(b.Nivel) || 0;
    if (na !== nb) return na - nb;
    return String(a.Menu || "").localeCompare(String(b.Menu || ""));
  });

  return sorted;
}

const MenuTreeViewPage = ({
  id = "treeview-base",
  menus = [],
  modoEdicion = false,
  showCheckBoxesModes = "none",
  selectionMode = "single",
  searchEnabled = true,
  searchMode = "contains",
  displayExpr = "Menu",
  parentIdExpr = "IdMenuPadre",
  keyExpr = "IdMenu",
  selectNodesRecursive = true,
  customRender = (e) => TreeviewDefaultItem(e),
  height = "420px",
  seleccionarNodo: onSeleccionarNodo,
  treeViewRef: forwardedRef,
  ...rest
}) => {
  const [treeViewRef, setTreeViewRef] = useState(null);

  const normalizedMenus = useMemo(
    () => ensureUniqueTreeKeys(menus, keyExpr, parentIdExpr),
    [menus, keyExpr, parentIdExpr]
  );

  const seleccionarNodo = (evt) => {
    // Con checkboxes, no forzar selectItem: rompe cascada padre/hijo e indeterminado (-).
    if (showCheckBoxesModes !== "none") {
      return;
    }

    const item = evt.itemData;
    const key = item.treeKey ?? item.IdMenu;

    evt.component.selectItem(key);
    evt.event.preventDefault();

    if (isNotEmpty(item.IdMenu) && onSeleccionarNodo) {
      onSeleccionarNodo(item);
    }
  };

  const treeViewSelectionChanged = (e) => {
    syncSelection(e);
  };

  const onContentReady = (e) => {
    if (forwardedRef && e?.component) {
      forwardedRef.current = { instance: e.component };
    }
  };

  const syncSelection = (e) => {
    if (selectionMode === "multiple" && onSeleccionarNodo && e?.component) {
      try {
        const nodes = (e.component.getSelectedNodes() ?? []).filter(Boolean);
        const selectedNodos = nodes
          .map((n) => (n?.itemData != null ? n.itemData : n))
          .filter(Boolean);
        onSeleccionarNodo(selectedNodos, normalizedMenus);
      } catch (err) {
        console.warn("MenuTreeViewPage syncSelection:", err);
      }
    }
  };

  return (
    <>
      <TreeView
        id={id}
        items={normalizedMenus}
        ref={(e) => {
          setTreeViewRef(e);
          if (forwardedRef && e) {
            forwardedRef.current = { instance: e.instance ?? e };
          }
        }}
        onContentReady={onContentReady}
        dataStructure="plain"
        focusStateEnabled={true}
        disabled={modoEdicion}
        height={height}
        virtualModeEnabled={false}
        selectNodesRecursive={selectNodesRecursive}
        selectionMode={selectionMode}
        showCheckBoxesMode={showCheckBoxesModes}
        searchEnabled={searchEnabled}
        searchMode={searchMode}
        displayExpr={displayExpr}
        keyExpr="treeKey"
        parentIdExpr="parentTreeKey"
        selectedExpr="selected"
        expandedExpr="Expanded"
        onItemClick={seleccionarNodo}
        itemRender={customRender}
        onSelectionChanged={treeViewSelectionChanged}
      />
    </>
  );
};

MenuTreeViewPage.propTypes = {
  id: PropTypes.string,
  menus: PropTypes.array,
  modoEdicion: PropTypes.bool,
  showCheckBoxesModes: PropTypes.string,
  selectionMode: PropTypes.string,
  searchEnabled: PropTypes.bool,
  searchMode: PropTypes.string,
  displayExpr: PropTypes.string,
  parentIdExpr: PropTypes.string,
  keyExpr: PropTypes.string,
  customRender: PropTypes.func,
  selectNodesRecursive: PropTypes.bool,
  height: PropTypes.string,
  seleccionarNodo: PropTypes.func,
  treeViewRef: PropTypes.object,
};


const TreeviewDefaultItem = (e) => {
  const { icon, Icon, IconColor, Menu, Nombre, TextColor, TextBold, toolTip } = e;
  const iconName = icon ?? Icon ?? 'folder';
  const label = Menu ?? Nombre ?? '';
  // console.log("TreeviewDefaultItem::>", e)

  return (
    <div className="dx-item-content dx-treeview-item-content">
      <i className={!iconName?.startsWith("fas ") ? `dx-icon dx-icon-${iconName}` : iconName} style={{ color: isNotEmpty(IconColor) ? IconColor : '#000000' }} />
      {isNotEmpty(TextColor) || isNotEmpty(TextBold) ? (
        <span className={TextColor} style={{ fontSize: "12px", color: 'black' }}>
          <span className={TextBold} style={{ fontSize: "12px", color: 'black' }}>{label}</span>
        </span>
      ) : (
        <span style={{ fontSize: "12px", color: 'black' }}>{label}</span>
      )}
    </div>
  );
}

export default injectIntl(MenuTreeViewPage);
