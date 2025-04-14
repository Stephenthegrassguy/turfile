// src/components/HeadInventory/index.js
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import CreateInventory from "../CreateInventory";

// Import shared global styles from PanelStyles
import {
  overlayBase,
  panelBase,
  draggableHeader,
  button,
  select
} from "../../styles/PanelStyles";
// Import local styles for HeadInventory
import styles from "./styles";

const HeadInventory = ({
  holes,
  areas,
  onClose,
  mapRef,
  setSelectedItem,
  showPreview,
}) => {
  // Inventory data and UI state
  const [items, setItems] = useState([]);
  const [showCreateTool, setShowCreateTool] = useState(false);
  const [placingHead, setPlacingHead] = useState(null);
  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [holeFilter, setHoleFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  // Drag state for moving the panel
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 100, left: 420 });

  // Start dragging the panel; record the offset
  const startDrag = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - panelPosition.left,
      y: e.clientY - panelPosition.top,
    });
  };

  // Update panel position during dragging
  const onDrag = (e) => {
    if (!dragging) return;
    const newLeft = e.clientX - offset.x;
    const newTop = e.clientY - offset.y;
    setPanelPosition({ top: newTop, left: newLeft });
  };

  // Stop dragging the panel
  const stopDrag = () => setDragging(false);

  // Subscribe to the "irrigationItems" collection from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "irrigationItems"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  // Listen for map clicks to update head position when in placement mode
  useEffect(() => {
    const mapInstance = mapRef?.current;
    const handleMapClick = async (e) => {
      if (!placingHead || !mapInstance) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const headRef = doc(db, "irrigationItems", placingHead.id);
      await updateDoc(headRef, { position: { lat, lng } });
      setPlacingHead(null);
    };

    if (mapInstance && isPlacingMode) {
      mapInstance.addListener("click", handleMapClick);
    }
    return () => {
      if (mapInstance) {
        window.google.maps.event.clearListeners(mapInstance, "click");
      }
    };
  }, [placingHead, isPlacingMode, mapRef]);

  // Filter and sort the inventory items
  const filteredItems = items
    .filter((item) => {
      if (holeFilter && item.hole !== holeFilter) return false;
      if (areaFilter && item.area !== areaFilter) return false;
      return true;
    })
    .sort((a, b) => {
      // Extract any numbers from the item names; fallback to "0" if not found
      const nameA = a.name.replace(/\D+/g, "") || "0";
      const nameB = b.name.replace(/\D+/g, "") || "0";
      return parseInt(nameA) - parseInt(nameB);
    });

  return (
    <div
      style={{
        ...overlayBase,
        ...styles.container,
        top: panelPosition.top,
        left: panelPosition.left,
      }}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div
        style={{
          ...panelBase,
          ...styles.panel,
          width: showCreateTool ? "560px" : "320px",
        }}
      >
        <div
          style={{
            ...draggableHeader,
            ...styles.header,
          }}
          onMouseDown={startDrag}
        >
          <h4 style={styles.headerTitle}>
            {showCreateTool
              ? "Head Inventory Creator"
              : isPlacingMode
              ? "Placement Mode"
              : "Inventory Viewer"}
          </h4>

          <div style={styles.headerButtons}>
            {!showCreateTool && (
              <div
                style={{
                  ...styles.toggleTrack,
                  ...(isPlacingMode ? styles.toggleTrackActive : {}),
                }}
                onClick={() => {
                  setIsPlacingMode(!isPlacingMode);
                  setPlacingHead(null);
                }}
              >
                <div style={styles.toggleThumb(isPlacingMode)} />
              </div>
            )}
            <button style={{ ...button, ...styles.closeButton }} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={styles.content}>
          {showCreateTool ? (
            <CreateInventory
              holes={[...holes].sort((a, b) => parseInt(a) - parseInt(b))}
              areas={areas}
              onGenerate={() => {}}
              showPreview={showPreview}
              onBack={() => setShowCreateTool(false)}
            />
          ) : (
            <>
              {!isPlacingMode && (
                <button style={button} onClick={() => setShowCreateTool(true)}>
                  Create Inventory
                </button>
              )}

              <div style={styles.filterContainer}>
                <select
                  style={select}
                  value={holeFilter}
                  onChange={(e) => {
                    setHoleFilter(e.target.value);
                    setAreaFilter("");
                  }}
                >
                  <option value="">All Holes</option>
                  {[...holes]
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                </select>

                <select
                  style={select}
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  disabled={!holeFilter}
                >
                  <option value="">All Areas</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                <button
                  style={button}
                  onClick={() => {
                    setHoleFilter("");
                    setAreaFilter("");
                  }}
                >
                  Clear Filters
                </button>
              </div>

              {isPlacingMode && (
                <p style={styles.placingMessage}>
                  Click and place heads on the map
                </p>
              )}

              {filteredItems.length > 0 && (
                <>
                  <p style={styles.countText}>Showing {filteredItems.length} heads</p>
                  <ul style={styles.list}>
                    {filteredItems.map((item, i) => (
                      <li
                        key={item.id}
                        style={{
                          ...styles.listItem,
                          animationDelay: i < 25 ? `${i * 50}ms` : "0ms",
                        }}
                        onClick={() => {
                          if (isPlacingMode) {
                            setPlacingHead(item);
                          } else if (item.position && mapRef?.current) {
                            mapRef.current.panTo(item.position);
                            mapRef.current.setZoom(20);
                            setSelectedItem(item);
                          }
                        }}
                      >
                        <strong>{item.name}</strong> — Hole {item.hole},{" "}
                        {item.area}
                        {isPlacingMode && (
                          <span
                            style={{
                              color: item.position ? "#6fff8f" : "#ff5c5c",
                              marginLeft: 6,
                            }}
                          >
                            ({item.position ? "on map" : "off map"})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadInventory;
