// src/components/MapItems.jsx
import React from "react";
import { Marker, OverlayView } from "@react-google-maps/api";
import LogManagement from "./LogManagement";

const MapItems = ({
  items,
  mapZoom,
  selectedItem,
  setSelectedItem,
  getShapeIcon,
  setLogs,
  confirmAndDelete,
  handleViewHistory,
  handleAddLog,
  logs,
  logDate,
  setLogDate,
  logNotes,
  setLogNotes,
  logImage,
  setLogImage,
  uploading,
  refreshSelectedItem
}) => {
  return (
    <>
      {items
        .filter(
          (item) =>
            item.position &&
            typeof item.position.lat === "number" &&
            typeof item.position.lng === "number"
        )
        .map((item) => {
          const icon = getShapeIcon(item.type, mapZoom);
          console.log("📍 Rendering item:", item.name, item.position);
          console.log("🎯 Icon for", item.name, icon);

          return (
            <Marker
              key={item.id}
              position={item.position}
              icon={icon}
              onClick={() => {
                setSelectedItem(item);
                setLogs([]);
              }}
              label={
                selectedItem?.id === item.id
                  ? undefined
                  : {
                      text: item.name || "",
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: "#FFFFFF"
                    }
              }
            />
          );
        })}

      {selectedItem && selectedItem.position && (
        <OverlayView
          position={selectedItem.position}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div className="pulsating-dot" />
        </OverlayView>
      )}

      {selectedItem && (
        <LogManagement
          position={selectedItem.position}
          onClose={() => setSelectedItem(null)}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          refreshSelectedItem={refreshSelectedItem}
          confirmAndDelete={confirmAndDelete}
          handleAddLog={handleAddLog}
          handleViewHistory={handleViewHistory}
          logs={logs}
          logDate={logDate}
          setLogDate={setLogDate}
          logNotes={logNotes}
          setLogNotes={setLogNotes}
          logImage={logImage}
          setLogImage={setLogImage}
          uploading={uploading}
        />
      )}
    </>
  );
};

export default MapItems;