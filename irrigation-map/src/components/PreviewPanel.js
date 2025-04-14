import React, { useState } from "react";
import { button, panelBase, overlayBase, draggableHeader } from "../styles/PanelStyles";

const PreviewPanel = ({ previewItems, onClose, onConfirm }) => {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ top: 150, left: 500 });

  const startDrag = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.left, y: e.clientY - position.top });
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const newLeft = e.clientX - offset.x;
    const newTop = e.clientY - offset.y;
    setPosition({ top: newTop, left: newLeft });
  };

  const stopDrag = () => setDragging(false);

  return (
    <div
      style={{
        ...overlayBase,
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div
        style={{
          ...panelBase,
          width: "320px",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            ...draggableHeader,
            background: "rgba(15, 15, 15, 0.6)",
            padding: "10px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            zIndex: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "grab"
          }}
          onMouseDown={startDrag}
        >
          <h4 style={{ fontWeight: "bold", fontSize: "13px", margin: 0 }}>Heads Created</h4>
          <button
            style={{
              ...button,
              background: "transparent",
              border: "none",
              fontSize: "16px",
              padding: 0,
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "12px 16px" }}>
          <p style={{ fontSize: "12px" }}>
            {previewItems.length} heads will be created.
            <span style={{ color: "#f88" }}>
              {" "}
              {previewItems.filter((i) => i.duplicate).length} already exist and will be skipped.
            </span>
          </p>
          <ul
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              paddingLeft: "16px",
              fontSize: "12px",
            }}
          >
            {previewItems.map((item) => (
              <li
                key={item.name}
                style={{
                  marginBottom: "4px",
                  color: item.duplicate ? "#f88" : "#fff",
                }}
              >
                {item.name} — Hole {item.hole}, {item.area}
                {item.duplicate && " (already exists)"}
              </li>
            ))}
          </ul>

          <button
            style={{ ...button, marginTop: "10px" }}
            onClick={onConfirm}
          >
            Save {previewItems.filter((i) => !i.duplicate).length} Heads
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
