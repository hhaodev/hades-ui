import React, { useEffect, useState } from "react";
import { DragDropTable } from "../../components";
const fetchDataFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem("data");
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse localStorage data", e);
    return [];
  }
};
const KanbanTable = () => {
  const [data, setData] = useState(() => fetchDataFromLocalStorage());

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "data") {
        const newData = JSON.parse(event.newValue || "[]");
        setData(newData);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("data", JSON.stringify(data));
  }, [data]);

  let queue = [];
  let isRunning = false;

  function handleMove(newData, diffInfo) {
    queue.push({ newData, diffInfo });
    processQueue();
  }

  async function processQueue() {
    if (isRunning || queue.length === 0) return;
    isRunning = true;

    const { newData, diffInfo } = queue.shift();
    setData(newData);

    try {
      await fakeApiCall({ shouldFail: false });
    } catch {
      setData((prev) => rollbackMoveCard(prev, diffInfo));
    } finally {
      isRunning = false;
      processQueue();
    }
  }
  function rollbackMoveCard(board, diff, useOriginalIndex = false) {
    const { cardId, fromColId, toColId, fromIndex } = diff;
    const next = structuredClone(board);

    const fromCol = next.find((col) => col.id === fromColId);
    const toCol = next.find((col) => col.id === toColId);
    if (!fromCol || !toCol) return board;

    const idx = toCol.items.findIndex((item) => item.id === cardId);
    if (idx === -1) return board;

    const [moved] = toCol.items.splice(idx, 1);

    if (useOriginalIndex && fromIndex !== -1) {
      fromCol.items.splice(fromIndex, 0, moved);
    } else {
      fromCol.items.push(moved);
    }

    return next;
  }
  function fakeApiCall({ shouldFail = false, delay = 3000 } = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail || Math.random() < 0) {
          reject(new Error("Lỗi gọi API (giả lập)"));
        } else {
          resolve({ data: "Dữ liệu trả về từ API" });
        }
      }, delay);
    });
  }

  return <DragDropTable data={data} onChange={handleMove} />;
};

export default KanbanTable;
