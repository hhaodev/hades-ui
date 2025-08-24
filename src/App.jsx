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

function App() {
  const components = [
    { key: "theme", title: "Theme", component: <ThemeDemo /> },
    { key: "form", title: "Form", component: <FormDemo /> },
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

  const getKeyFromUrl = () => {
    const urlKey = window.location.pathname.slice(1);
    const keys = components.map((c) => c.key);
    return keys.includes(urlKey) ? urlKey : "theme";
  };

  const [selectedKey, setSelectedKey] = useState(getKeyFromUrl());

  const handleSelect = (key) => {
    setSelectedKey(key);
  };

  useEffect(() => {
    const onPopState = () => setSelectedKey(getKeyFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    window.history.pushState(null, "", `/${selectedKey}`);
  }, [selectedKey]);

  const navItem = components.map(({ key, title }) => ({
    key,
    title,
    icon: ImageIcon,
    onClick: () => handleSelect(key),
    // notifs: 4,
  }));

  const componentMap = Object.fromEntries(
    components.map(({ key, component }) => [key, component])
  );

  return (
    <Stack
      flex
      style={{
        height: "100vh",
      }}
    >
      <Sidebar items={navItem} defaultSelectedKey={selectedKey} />
      <Stack
        style={{
          flex: 1,
          minWidth: 0,
          padding: 10,
          overflow: "auto",
        }}
      >
        {componentMap[selectedKey]}
      </Stack>
    </Stack>
  );
}

export default App;
