// src/components/IssuesPanel.js
import React, { useState } from "react";
// Import shared base styles from PanelStyles
import {
  overlayBase,
  panelBase,
  draggableHeader,
  button
} from "../../styles/PanelStyles";
// Import extracted local styles from the new styles.js file
import styles from "./styles";

const IssuesPanel = ({ issues, onFocusItem, onClose }) => {
  // State for drag behavior
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  // Initial panel position; will be updated on drag
  const [panelPosition, setPanelPosition] = useState({ top: 100, left: 300 });

  // Handler to start dragging; calculates offset
  const startDrag = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - panelPosition.left,
      y: e.clientY - panelPosition.top,
    });
  };

  // Handler to update panel position while dragging
  const onDrag = (e) => {
    if (!dragging) return;
    const newLeft = e.clientX - offset.x;
    const newTop = e.clientY - offset.y;
    setPanelPosition({ top: newTop, left: newLeft });
  };

  // Handler to stop dragging
  const stopDrag = () => setDragging(false);

  return (
    <div
      style={{
        // Merge shared overlayBase with local dynamic styles
        ...overlayBase,
        ...styles.outerContainer,
        top: panelPosition.top,
        left: panelPosition.left,
      }}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div style={styles.flexRowReverse}>
        <div style={{ ...panelBase, ...styles.panel }}>
          <div
            style={{ ...draggableHeader, ...styles.draggableHeader }}
            onMouseDown={startDrag}
          >
            <h4 style={styles.headerText}>Current Issues</h4>
            <button style={{ ...button, ...styles.closeButton }} onClick={onClose}>
              ✕
            </button>
          </div>

          <ul style={styles.issuesList}>
            {issues && issues.length > 0 ? (
              issues.map((item) => (
                <li
                  key={item.id}
                  style={styles.listItem}
                  onClick={() => onFocusItem(item)}
                >
                  {item.name} –{" "}
                  <span style={{ color: "#ccc", fontStyle: "italic" }}>
                    {item.issue?.type || ""}
                  </span>
                </li>
              ))
            ) : (
              <li style={styles.noIssues}>No issues found.</li>
            )}
          </ul>
        </div>

        {/* Gradient fade element */}
        <div style={styles.gradientFade} />
      </div>
    </div>
  );
};

export default IssuesPanel;
