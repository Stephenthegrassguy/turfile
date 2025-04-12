import React, { useState } from "react";
import {
  panelBase,
  overlayBase,
  button,
  input,
  select,
  headerBase
} from "../styles/PanelStyles";

const PlacementManagement = ({
  placingType,
  setPlacingType,
  itemName,
  setItemName,
  holes,
  selectedHole,
  setSelectedHole,
  selectedArea,
  setSelectedArea,
  areas,
  setShowAddObjectForm
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 80, left: 200 });

  const startDrag = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - panelPosition.left,
      y: e.clientY - panelPosition.top
    });
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const newLeft = e.clientX - offset.x;
    const newTop = e.clientY - offset.y;
    setPanelPosition({ top: newTop, left: newLeft });
  };

  const stopDrag = () => setDragging(false);

  return (
    <div
      style={{ ...overlayBase, top: panelPosition.top, left: panelPosition.left }}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div style={{ borderRadius: "12px", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={headerBase}
          onMouseDown={(e) => {
            if (e.target.tagName !== "BUTTON") {
              e.stopPropagation();
              startDrag(e);
            }
          }}
          onMouseUp={stopDrag}
        >
          <span style={{ fontWeight: "bold", fontSize: "13px", color: "#fff", lineHeight: 1.2 }}>
            Add New Item
          </span>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "16px",
              padding: 0,
              lineHeight: 1,
              cursor: "pointer"
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowAddObjectForm(false);
            }}
          >
            ✕
          </button>
        </div>

        {/* Panel Body */}
        <div style={{ ...panelBase, padding: "20px", borderTopLeftRadius: 0, borderTopRightRadius: 0, width: "360px" }}>
          <p style={{ marginBottom: "10px" }}>
            Select object type then click the map to place it.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <select value={placingType} onChange={(e) => setPlacingType(e.target.value)} style={select}>
              <option value="">Select Type</option>
              <option value="head">Head</option>
              <option value="valve">Valve</option>
              <option value="satellite">Satellite</option>
              <option value="splice box">Splice Box</option>
            </select>

            <select value={selectedHole} onChange={(e) => setSelectedHole(e.target.value)} style={select}>
              <option value="">Select Hole</option>
              {holes.map((hole, i) => (
                <option key={i} value={hole}>{hole}</option>
              ))}
            </select>

            <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} style={select}>
              <option value="">Select Area</option>
              {areas.map((area, i) => (
                <option key={i} value={area}>{area}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Enter item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              style={input}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementManagement;
