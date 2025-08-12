import React from "react";
import { DragDropProvider, Draggable, Droppable } from "../../components";

const DndDemo = () => {
  return (
    <DragDropProvider onDragEnd={(props) => console.log(props)}>
      <Droppable droppableId="board" acceptType="column">
        <div style={{ display: "flex", gap: 8 }}>
          <Draggable
            droppableId="board"
            draggableId="col-1"
            dragType="column"
            data={{ id: "col-1" }}
          >
            <div
              style={{
                padding: 16,
                background: "#ccc",
              }}
            >
              <div className="column-header">Column 1</div>
              <Droppable droppableId="col-1" acceptType="card">
                <div className="card-list">
                  <Draggable
                    draggableId="card-1"
                    dragType="card"
                    droppableId="col-1"
                    data={{ id: "card-1" }}
                  >
                    <div className="card">Card 1</div>
                    <div>
                      <Droppable droppableId="card-1" acceptType="mini-card">
                        <Draggable
                          draggableId="mini-card-1"
                          dragType="mini-card"
                          droppableId="card-1"
                          data={{ id: "mini-card-1" }}
                        >
                          <div>mini card 1</div>
                        </Draggable>
                      </Droppable>
                    </div>
                  </Draggable>
                </div>
              </Droppable>
            </div>
          </Draggable>
          <Draggable
            droppableId="board"
            draggableId="col-2"
            dragType="column"
            data={{ id: "col-2" }}
          >
            <div
              style={{
                padding: 16,
                background: "#ccc",
              }}
            >
              <div className="column-header">Column 2</div>
              <Droppable droppableId="col-2" acceptType="card">
                <div className="card-list">
                  <Draggable
                    draggableId="card-2"
                    dragType="card"
                    droppableId="col-2"
                    data={{ id: "card-2" }}
                  >
                    <div className="card">Card 2</div>
                    <div>
                      <Droppable droppableId="card-2" acceptType="mini-card">
                        <Draggable
                          draggableId="mini-card-2"
                          dragType="mini-card"
                          droppableId="card-2"
                          data={{ id: "mini-card-2" }}
                        >
                          <div>mini card 2</div>
                        </Draggable>
                      </Droppable>
                    </div>
                  </Draggable>
                </div>
              </Droppable>
            </div>
          </Draggable>
        </div>
      </Droppable>
    </DragDropProvider>
  );
};

export default DndDemo;
