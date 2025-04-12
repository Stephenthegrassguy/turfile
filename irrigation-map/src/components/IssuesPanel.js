// src/components/IssuesPanel.js

import React, { useState } from "react";
import {
  overlayBase,
  panelBase,
  draggableHeader,
  button
} from "../styles/PanelStyles";

const IssuesPanel = ({ issues, onFocusItem, onClose }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 100, left: 300 });

  const startDrag = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - panelPosition.left, y: e.clientY - panelPosition.top });
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
      style={{ ...overlayBase, top: panelPosition.top, left: panelPosition.left, zIndex: 12 }}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div style={{ display: "flex", flexDirection: "row-reverse" }}>
        <div style={{ ...panelBase, width: "200px", maxHeight: "30vh", overflowY: "auto" }}>
          <div
            style={{ ...draggableHeader, background: "rgba(15, 15, 15, 0.6)", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", zIndex: 2 }}
            onMouseDown={startDrag}
          >
            <h4 style={{ fontWeight: "bold", fontSize: "13px", margin: 0 }}>Current Issues</h4>
            <button
              style={{ ...button, background: "transparent", border: "none", fontSize: "16px", padding: 0 }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <ul style={{ listStyle: "disc", padding: "10px 20px", margin: 0, overflowY: "auto" }}>
            {issues && issues.length > 0 ? (
              issues.map((item) => (
                <li
                  key={item.id}
                  style={{
                    fontSize: "12px",
                    marginBottom: "6px",
                    cursor: "pointer",
                    color: "#fff"
                  }}
                  onClick={() => onFocusItem(item)}
                >
                  {item.name} – <span style={{ color: "#ccc", fontStyle: "italic" }}>{item.issue?.type || ""}</span>
                </li>
              ))
            ) : (
              <li style={{ fontSize: "12px", color: "#fff" }}>No issues found.</li>
            )}
          </ul>
        </div>

        {/* Gradient fade remains untouched */}
        <div
          style={{
            width: "60px",
            height: "100%",
            background: "linear-gradient(to left, rgba(15,15,15,0.6), rgba(15,15,15,0.25), rgba(15,15,15,0.05), transparent)",
            pointerEvents: "none"
          }}
        />
      </div>
    </div>
  );
};

export default IssuesPanel;
