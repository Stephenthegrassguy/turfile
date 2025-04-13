// Updated MapItems.js
import React from "react";
import { Marker } from "@react-google-maps/api";
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
}) => (
  <>
    {items.map(item => (
      <Marker
        key={item.id}
        position={item.position}
        icon={getShapeIcon(item.type, mapZoom)}
        onClick={() => {
          setSelectedItem(item);
          setLogs([]); // Clear previous logs when selecting a new item
        }}
        label={{
          text: item.name || "",
          fontSize: "11px",
          fontWeight: "bold",
          color: "#FFFFFF"
        }}
      />
    ))}

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

export default MapItems;
