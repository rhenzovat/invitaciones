import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useOutlet } from "react-router-dom";
import { Tabs, Dropdown } from "antd";
import useTabs from "app/contexts/TabsContext";
import { useCmsContentPush } from "app/contexts/CmsContentPushContext";
import MenuFavoriteButton from "app/components/MenuFavoriteButton";
import MenuModuloDeactivateButton from "app/components/MenuModuloDeactivateButton";
import "./tabbedOutlet.scss";

/**
 * Pestañas tipo Chrome: keep-alive + menú contextual (clic derecho).
 */
export default function TabbedOutlet() {
  const outlet = useOutlet();
  const {
    tabs,
    activeKey,
    setActiveTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
  } = useTabs();
  const { contentOffset } = useCmsContentPush();
  const outletRef = useRef(outlet);
  outletRef.current = outlet;

  const [cache, setCache] = useState({});
  const onlyOneTab = tabs.length <= 1;

  const hasOutlet = !!outlet;

  useEffect(() => {
    if (!activeKey || !outletRef.current) return;
    setCache((prev) => {
      if (prev[activeKey]) return prev;
      return { ...prev, [activeKey]: outletRef.current };
    });
  }, [activeKey, hasOutlet]);

  useEffect(() => {
    const openKeys = new Set(tabs.map((t) => t.key));
    setCache((prev) => {
      const next = {};
      let changed = false;
      for (const key of Object.keys(prev)) {
        if (openKeys.has(key)) {
          next[key] = prev[key];
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [tabs]);

  const buildContextMenu = useCallback(
    (tabKey) => ({
      items: [
        {
          key: "close",
          label: "Cerrar",
          disabled: onlyOneTab,
        },
        {
          key: "closeOthers",
          label: "Cerrar otros",
          disabled: onlyOneTab,
        },
        { type: "divider" },
        {
          key: "closeAll",
          label: "Cerrar todos",
          disabled: onlyOneTab,
        },
      ],
      onClick: ({ key, domEvent }) => {
        domEvent?.stopPropagation();
        if (key === "close") closeTab(tabKey);
        if (key === "closeOthers") closeOtherTabs(tabKey);
        if (key === "closeAll") closeAllTabs();
      },
    }),
    [onlyOneTab, closeTab, closeOtherTabs, closeAllTabs]
  );

  const tabItems = useMemo(
    () =>
      tabs.map((tab) => ({
        key: tab.key,
        label: (
          <Dropdown
            menu={buildContextMenu(tab.key)}
            trigger={["contextMenu"]}
          >
            <span className="tabbed-outlet-tab-label">{tab.title}</span>
          </Dropdown>
        ),
        closable: !onlyOneTab,
      })),
    [tabs, onlyOneTab, buildContextMenu]
  );

  const onEdit = (targetKey, action) => {
    if (action === "remove") closeTab(targetKey);
  };

  const handleTabChange = (key) => {
    if (key !== activeKey) setActiveTab(key);
  };

  return (
    <div
      className="tabbed-outlet-root"
      style={{
        marginLeft: contentOffset,
        transition: "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="tabbed-outlet-tabs">
        <Tabs
          type="editable-card"
          hideAdd
          size="small"
          activeKey={activeKey}
          onChange={handleTabChange}
          onEdit={onEdit}
          items={tabItems}
        />
        {activeKey && activeKey !== "/" && (
          <div className="tabbed-outlet-toolbar">
            <MenuModuloDeactivateButton path={activeKey} />
            <MenuFavoriteButton path={activeKey} />
          </div>
        )}
      </div>

      <div className="tabbed-outlet-panel">
        {tabs.map((tab) =>
          cache[tab.key] ? (
            <div
              key={tab.key}
              className={
                tab.key === activeKey
                  ? "tabbed-outlet-pane is-active"
                  : "tabbed-outlet-pane"
              }
            >
              {cache[tab.key]}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
