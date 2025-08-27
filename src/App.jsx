import { useEffect, useState } from "react";
import { ImageIcon, Sidebar, Stack } from "./components";
import ButtonDemo from "./Preview/Button";
import DividerDemo from "./Preview/Divider";
import DndDemo from "./Preview/Dnd";
import DropdownDemo from "./Preview/Dropdown";
import FileUploadDemo from "./Preview/FileUpload";
import FormDemo from "./Preview/Form";
import InputDemo from "./Preview/Input";
import KanbanTable from "./Preview/Kanban";
import LoadingDemo from "./Preview/Loading";
import MessageDemo from "./Preview/Message";
import ModalDemo from "./Preview/Modal";
import NotificationDemo from "./Preview/Notification";
import OverflowDemo from "./Preview/Overflow";
import PanelDemo from "./Preview/Panel";
import RightClickDemo from "./Preview/RightClickMenu";
import ScrollerDivDemo from "./Preview/ScrollerDiv";
import TabDemo from "./Preview/Tab";
import TableDemo from "./Preview/Table";
import ThemeDemo from "./Preview/Theme";
import TooltipDemo from "./Preview/Tooltip";

const generateMenuObject = (
  depth,
  childrenPerLevel = 2,
  rootKey = "",
  rootTitle = "",
  component = <></>
) => {
  const Cpn = component;
  const createItem = (level, parentPath = []) => {
    const path = parentPath;
    const key = `${rootKey}${path.join("")}`;
    const title = `${rootTitle} ${path.join(".")}`;

    const item = { key, title, component: <Cpn /> };

    if (level < depth) {
      item.children = [];
      for (let i = 1; i <= childrenPerLevel; i++) {
        if (i === childrenPerLevel) {
          item.children.push(createItem(level + 1, [...path, i]));
        } else {
          item.children.push({
            key: `${rootKey}${[...path, i].join("")}`,
            title: `${rootTitle} ${[...path, i].join(".")}`,
            component: <Cpn />,
          });
        }
      }
    }

    return item;
  };

  const root = { key: rootKey, title: rootTitle, component: <Cpn /> };
  root.children = [];
  for (let i = 1; i <= childrenPerLevel; i++) {
    if (i === childrenPerLevel) {
      root.children.push(createItem(1, [i]));
    } else {
      root.children.push({
        key: `${rootKey}${i}`,
        title: `${rootTitle} ${i}`,
        component: <Cpn />,
      });
    }
  }

  return root;
};

const components = [
  generateMenuObject(5, 3, "theme", "Theme", ThemeDemo),
  generateMenuObject(5, 2, "form", "Form", FormDemo),
  { key: "table", title: "Table", component: <TableDemo /> },
  { key: "overflow", title: "Overflow", component: <OverflowDemo /> },
  { key: "tooltip", title: "Tooltip", component: <TooltipDemo /> },
  { key: "tabs", title: "Tabs", component: <TabDemo /> },
  { key: "button", title: "Button", component: <ButtonDemo /> },
  { key: "divider", title: "Divider", component: <DividerDemo /> },
  { key: "fileupload", title: "FileUpload", component: <FileUploadDemo /> },
  { key: "dnd", title: "DndContext", component: <DndDemo /> },
  { key: "kanban", title: "KanbanTable", component: <KanbanTable /> },
  { key: "loading", title: "Loading", component: <LoadingDemo /> },
  { key: "message", title: "Message", component: <MessageDemo /> },
  {
    key: "notification",
    title: "Notification",
    component: <NotificationDemo />,
  },
  { key: "modal", title: "Modal", component: <ModalDemo /> },
  { key: "panel", title: "Panel", component: <PanelDemo /> },
  { key: "scroller", title: "ScrollerDiv", component: <ScrollerDivDemo /> },
  {
    key: "rightclick",
    title: "RightClickMenu",
    component: <RightClickDemo />,
  },
  { key: "dropdown", title: "Dropdown", component: <DropdownDemo /> },
  { key: "input", title: "Input", component: <InputDemo /> },
];

function buildComponentMap(components) {
  const map = {};
  components.forEach(({ key, component, title, children }) => {
    map[key] = { component, title };
    if (children) {
      Object.assign(map, buildComponentMap(children));
    }
  });
  return map;
}

const componentMap = buildComponentMap(components);

const getKeyFromUrl = () => {
  const urlKey = window.location.pathname.slice(1);
  const keys = Object.keys(componentMap);
  const keyToUse = keys.includes(urlKey) ? urlKey : "theme";

  const title = componentMap[keyToUse]?.title || keyToUse;
  document.title = `${title} - Hades UI`;
  return keyToUse;
};

function App() {
  const [selectedKey, setSelectedKey] = useState(getKeyFromUrl());
  const [expanded, setExpanded] = useState(["theme", "theme3333"]);

  useEffect(() => {
    const onPopState = () => setSelectedKey(getKeyFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleSelect = (key) => {
    setSelectedKey(key);
    const title = componentMap[key]?.title;
    document.title = `${title} - Hades UI`;
    window.history.pushState(null, "", `/${key}`);
  };

  const mapNavItems = (items, handleSelect, IconComponent) => {
    return items.map(({ key, title, children }) => ({
      key,
      title,
      // onClick: () => handleSelect(key),
      children: children
        ? mapNavItems(children, handleSelect, IconComponent)
        : [],
    }));
  };

  const navItem = mapNavItems(components, handleSelect, ImageIcon);

  return (
    <Stack
      flex
      style={{
        height: "100vh",
      }}
    >
      <Sidebar
        items={navItem}
        defaultSelectedKey={selectedKey} // default for uncontrolled
        selectedKey={selectedKey} // controlled
        onSelectKey={handleSelect} //<--
        onSelectItem={(item) => {}}
        expandedItems={expanded} // controlled expanded
        onExpandedChange={setExpanded} //<--
        defaultExpandedItems={[]} // default expanded for uncontrolled expanded
        treeLine
      />
      <Stack
        style={{
          flex: 1,
          minWidth: 0,
          padding: 10,
          overflow: "auto",
        }}
      >
        {componentMap[selectedKey].component}
      </Stack>
    </Stack>
  );
}

export default App;
