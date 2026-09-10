/**
 * Tokens para guardar permisos del TreeView (mod_X, mY, oZ, omZ).
 */

export function tokenFromItemData(item) {
  if (!item) return null;
  const tipo = String(item.Tipo || "").toLowerCase();
  const idMenu = String(item.IdMenu || item.treeKey || "");

  if (tipo === "modulo") {
    const m = idMenu.match(/^mod_(\d+)/);
    return m ? `mod_${m[1]}` : null;
  }
  if (tipo === "menu") {
    const id = item.id_menu ?? idMenu.match(/^m(\d+)/)?.[1];
    return id != null && id !== "" ? `m${id}` : null;
  }
  if (tipo === "objeto") {
    if (idMenu.startsWith("om")) {
      const id = item.id_menu_objetos ?? idMenu.match(/^om(\d+)/)?.[1];
      return id != null && id !== "" ? `om${id}` : null;
    }
    const id = item.id_menu_objetos ?? idMenu.match(/^o(\d+)/)?.[1];
    return id != null && id !== "" ? `o${id}` : null;
  }
  return null;
}

function isItemChecked(item) {
  return item?.selected === true || item?.selected === 1 || item?.selected === "1";
}

/**
 * Lee checkboxes marcados desde la instancia DevExtreme (estado vivo, no props React).
 */
export function collectCheckedPayload(instance) {
  if (!instance) return [];

  const tokens = [];
  const seen = new Set();

  const pushItem = (item) => {
    const token = tokenFromItemData(item);
    if (token && !seen.has(token)) {
      seen.add(token);
      tokens.push(token);
    }
  };

  const pushNode = (node) => {
    if (!node) return;
    pushItem(node.itemData ?? node);
    const children = node.children;
    if (Array.isArray(children)) {
      children.forEach(pushNode);
    }
  };

  if (typeof instance.getSelectedNodes === "function") {
    (instance.getSelectedNodes() ?? []).forEach(pushNode);
  }

  const items = typeof instance.option === "function" ? instance.option("items") : null;

  if (typeof instance.getSelectedNodeKeys === "function" && Array.isArray(items)) {
    const keySet = new Set(instance.getSelectedNodeKeys() ?? []);
    items.forEach((item) => {
      const key = item.treeKey ?? item.IdMenu;
      if (key != null && keySet.has(key)) {
        pushItem(item);
      }
    });
  }

  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (isItemChecked(item)) {
        pushItem(item);
      }
    });
  }

  return tokens;
}

export function resolveTreeViewInstance(ref) {
  const holder = ref?.current;
  if (!holder) return null;
  if (holder.instance) return holder.instance;
  if (typeof holder.getSelectedNodes === "function" || typeof holder.option === "function") {
    return holder;
  }
  return holder.instance ?? null;
}
