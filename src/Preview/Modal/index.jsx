import React, { useState } from "react";
import { Button, Modal, Stack } from "../../components";

const ModalDemo = () => {
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  return (
    <Stack>
      <Stack flex justify="space-between">
        <Button onClick={() => setOpenModal1(true)}>Open Modal</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
      </Stack>
      <Modal
        title={"Modal 1"}
        buttons={[
          <Button theme="default" key="ok">
            Custom btn
          </Button>,
          <Button key="close">Custom btn</Button>,
        ]}
        open={openModal1}
        onClose={() => setOpenModal1(false)}
      >
        ContentModal1
      </Modal>
      <Modal
        title={"Modal 2"}
        open={openModal2}
        onClose={() => setOpenModal2(false)}
      >
        ContentModal2
      </Modal>
    </Stack>
  );
};

export default ModalDemo;
