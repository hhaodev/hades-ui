import { createContext, useContext } from "react";

export const DndContext = createContext(null);

export function useDndContext() {
  return useContext(DndContext);
}
