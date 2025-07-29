import { useEffect } from "react";

function createSafeZoneManager() {
  const zones = [];

  function registerZone(zone, onClose) {
    const id = Symbol();
    zones.push({ id, zone, onClose });
    if (zones.length === 1) {
      window.addEventListener("mousedown", handleClick, true);
    }
    return id;
  }

  function unregisterZone(id) {
    const index = zones.findIndex((z) => z.id === id);
    if (index !== -1) {
      zones.splice(index, 1);
    }
    if (zones.length === 0) {
      window.removeEventListener("mousedown", handleClick, true);
    }
  }

  function handleClick(event) {
    let node = event.target;
    while (node && node.nodeType !== 1) node = node.parentNode;
    if (!node) {
      closeAllZones();
      return;
    }

    for (let i = zones.length - 1; i >= 0; i--) {
      const { zone } = zones[i];
      const contains = zone.contains
        ? zone.contains(node)
        : zone.contains(node);
      if (contains) {
        closeZonesAbove(i);
        return;
      }
    }
    closeAllZones();
  }

  function closeZonesAbove(index) {
    const toClose = zones.slice(index + 1);
    toClose.forEach(({ onClose, id }) => {
      onClose();
      unregisterZone(id);
    });
  }

  function closeAllZones() {
    zones.forEach(({ onClose, id }) => {
      onClose();
      unregisterZone(id);
    });
  }

  return {
    registerZone,
    unregisterZone,
  };
}

const safeZoneManager = createSafeZoneManager();

export function useSafeZone(open, referenceRef, popupRef, onClose) {
  useEffect(() => {
    if (!open) return;

    const zone = {
      contains: (el) =>
        (referenceRef.current && referenceRef.current.contains(el)) ||
        (popupRef.current && popupRef.current.contains(el)),
    };

    const id = safeZoneManager.registerZone(zone, onClose);

    return () => safeZoneManager.unregisterZone(id);
  }, [open, referenceRef, popupRef, onClose]);
}
