import { Stack, Tabs } from "./components";
import ThemeDemo from "./Preview/Theme";
import FormDemo from "./Preview/Form";
import TableDemo from "./Preview/Table";
import OverflowDemo from "./Preview/Overflow";
import TooltipDemo from "./Preview/Tooltip";
import TabDemo from "./Preview/Tab";
import ButtonDemo from "./Preview/Button";
import DividerDemo from "./Preview/Divider";
import FileUploadDemo from "./Preview/FileUpload";
import DndDemo from "./Preview/Dnd";
import KanbanTable from "./Preview/Kanban";
import LoadingDemo from "./Preview/Loading";
import MessageDemo from "./Preview/Message";
import NotificationDemo from "./Preview/Notification";
import ModalDemo from "./Preview/Modal";
import PanelDemo from "./Preview/Panel";
import ScrollerDivDemo from "./Preview/ScrollerDiv";
import RightClickDemo from "./Preview/RightClickMenu";
import DropdownDemo from "./Preview/Dropdown";

function App() {
  return (
    <Stack flex>
      <Stack
        style={{
          top: 0,
          height: "100vh",
          flex: "0 0 180px",
          position: "sticky",
        }}
      >
        navbar
      </Stack>

      <Stack style={{ flex: 1, minWidth: 0 }}>
        <Tabs destroy tabPosition="left">
          <Tabs.Item key={`theme`} tabKey={`theme`} title={`Theme`}>
            <ThemeDemo />
          </Tabs.Item>
          <Tabs.Item key={`form`} tabKey={`form`} title={`Form`}>
            <FormDemo />
          </Tabs.Item>
          <Tabs.Item key={`table`} tabKey={`table`} title={`Table`}>
            <TableDemo />
          </Tabs.Item>
          <Tabs.Item key={`overflow`} tabKey={`overflow`} title={`Overflow`}>
            <OverflowDemo />
          </Tabs.Item>
          <Tabs.Item key={`tooltip`} tabKey={`tooltip`} title={`Tooltip`}>
            <TooltipDemo />
          </Tabs.Item>
          <Tabs.Item key={`tab`} tabKey={`tab`} title={`Tabs`}>
            <TabDemo />
          </Tabs.Item>
          <Tabs.Item key={`button`} tabKey={`button`} title={`Button`}>
            <ButtonDemo />
          </Tabs.Item>
          <Tabs.Item key={`divider`} tabKey={`divider`} title={`Divider`}>
            <DividerDemo />
          </Tabs.Item>
          <Tabs.Item
            key={`fileupload`}
            tabKey={`fileupload`}
            title={`Fileupload`}
          >
            <FileUploadDemo />
          </Tabs.Item>
          <Tabs.Item
            key={`dndContext`}
            tabKey={`dndContext`}
            title={`dndContext`}
          >
            <DndDemo />
          </Tabs.Item>
          <Tabs.Item key={`kanban`} tabKey={`kanban`} title={`Kanban table`}>
            <KanbanTable />
          </Tabs.Item>
          <Tabs.Item key={`loading`} tabKey={`loading`} title={`Loading`}>
            <LoadingDemo />
          </Tabs.Item>
          <Tabs.Item key={`message`} tabKey={`message`} title={`Message`}>
            <MessageDemo />
          </Tabs.Item>
          <Tabs.Item key={`toast`} tabKey={`toast`} title={`Toast`}>
            <NotificationDemo />
          </Tabs.Item>
          <Tabs.Item key={`modal`} tabKey={`modal`} title={`Modal`}>
            <ModalDemo />
          </Tabs.Item>
          <Tabs.Item key={`Panel`} tabKey={`Panel`} title={`Panel`}>
            <PanelDemo />
          </Tabs.Item>
          <Tabs.Item key={`scroller`} tabKey={`scroller`} title={`ScrollerDiv`}>
            <ScrollerDivDemo />
          </Tabs.Item>
          <Tabs.Item
            key={`RightClickDemo`}
            tabKey={`RightClickDemo`}
            title={`RightClickMenu`}
          >
            <RightClickDemo />
          </Tabs.Item>
          <Tabs.Item
            key={`dropdown`}
            tabKey={`dropdown`}
            title={`Dropdown`}
          >
            <DropdownDemo />
          </Tabs.Item>
        </Tabs>
      </Stack>
    </Stack>
  );
}

export default App;
