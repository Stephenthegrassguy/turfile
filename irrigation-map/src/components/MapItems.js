// irrigation-map/src/components/MapItems.js
import React from "react";
import { Marker, InfoWindow } from "@react-google-maps/api";

const MapItems = ({
  items,
  selectedItem,
  setSelectedItem,
  getShapeIcon,
  setLogs,
  toggleStatus,
  confirmAndDelete,
  handleViewHistory
}) => (
  <>
    {items.map(item => (
      <Marker
        key={item.id}
        position={item.position}
        icon={getShapeIcon(item.type)}
        onClick={() => {
          setSelectedItem(item);
          setLogs([]);
        }}
        label={{
          text: item.name || "",
          fontSize: "10px",
          fontWeight: "bold"
        }}
      />
    ))}
    
    {selectedItem && (
      <InfoWindow
        position={selectedItem.position}
        onCloseClick={() => setSelectedItem(null)}
      >
        <div style={{ maxWidth: "300px" }}>
          <p><strong>{selectedItem.name}</strong></p>
          <p>Type: {selectedItem.type}</p>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: 8 }}>Status:</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={selectedItem.status === "working"}
                onChange={toggleStatus}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <button onClick={confirmAndDelete} style={{ marginTop: 10 }}>Delete</button>
          <button onClick={handleViewHistory} style={{ marginLeft: "8px" }}>View History</button>
        </div>
      </InfoWindow>
    )}
  </>
);

export default MapItems;