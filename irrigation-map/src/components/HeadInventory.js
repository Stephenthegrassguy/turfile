import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import CreateInventory from "./CreateInventory";

import {
  overlayBase,
  panelBase,
  draggableHeader,
  button,
  select
} from "../styles/PanelStyles";

const toggleTrack = {
  width: "40px",
  height: "22px",
  backgroundColor: "#ccc",
  borderRadius: "999px",
  position: "relative",
  cursor: "pointer",
};

const toggleThumb = (on) => ({
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  backgroundColor: "white",
  position: "absolute",
  top: "2px",
  left: on ? "20px" : "2px",
  transition: "left 0.2s ease-in-out",
});

const toggleTrackActive = {
  backgroundColor: "#6fff8f",
};

const HeadInventory = ({
  holes,
  areas,
  onClose,
  mapRef,
  setSelectedItem,
  setPreviewItems,
  setShowPreviewPanel,
  showPreview
}) => {
  const [items, setItems] = useState([]);
  const [showCreateTool, setShowCreateTool] = useState(false);
  const [placingHead, setPlacingHead] = useState(null);
  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [holeFilter, setHoleFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 100, left: 420 });

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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "irrigationItems"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

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

  const filteredItems = items
    .filter((item) => {
      if (holeFilter && item.hole !== holeFilter) return false;
      if (areaFilter && item.area !== areaFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const nameA = a.name.replace(/\D+/g, '') || "0";
      const nameB = b.name.replace(/\D+/g, '') || "0";
      return parseInt(nameA) - parseInt(nameB);
    });

  return (
    <div
      style={{ ...overlayBase, top: panelPosition.top, left: panelPosition.left, zIndex: 12 }}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div
        style={{
          ...panelBase,
          width: showCreateTool ? "560px" : "320px",
          maxHeight: "80vh",
          overflowY: "auto"
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
            alignItems: "center"
          }}
          onMouseDown={startDrag}
        >
          <h4 style={{ fontWeight: "bold", fontSize: "13px", margin: 0 }}>
            {showCreateTool
              ? "Head Inventory Creator"
              : isPlacingMode
              ? "Placement Mode"
              : "Inventory Viewer"}
          </h4>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!showCreateTool && (
              <div
                style={{
                  ...toggleTrack,
                  ...(isPlacingMode ? toggleTrackActive : {})
                }}
                onClick={() => {
                  setIsPlacingMode(!isPlacingMode);
                  setPlacingHead(null);
                }}
              >
                <div style={toggleThumb(isPlacingMode)} />
              </div>
            )}
            <button
              style={{
                ...button,
                background: "transparent",
                border: "none",
                fontSize: "16px",
                padding: 0
              }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: "12px 16px" }}>
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

              <div style={{ marginTop: "12px", marginBottom: "12px", display: "flex", gap: "8px" }}>
                <select style={select} value={holeFilter} onChange={(e) => {
                  setHoleFilter(e.target.value);
                  setAreaFilter("");
                }}>
                  <option value="">All Holes</option>
                  {[...holes].sort((a, b) => parseInt(a) - parseInt(b)).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                <select
                  style={select}
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  disabled={!holeFilter}
                >
                  <option value="">All Areas</option>
                  {areas.map(a => (
                    <option key={a} value={a}>{a}</option>
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
                <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "12px" }}>
                  Click and place heads on the map
                </p>
              )}

              {filteredItems.length > 0 && (
                <>
                  <p style={{ fontSize: "12px" }}>Showing {filteredItems.length} heads</p>
                  <ul
                    key={isPlacingMode ? "placing" : "viewing"}
                    style={{ paddingLeft: "16px", fontSize: "12px", margin: 0 }}
                  >
                    {filteredItems.map((item, i) => (
                      <li
                        key={item.id}
                        style={{
                          marginBottom: "6px",
                          color: "#fff",
                          cursor: "pointer",
                          opacity: 0,
                          transform: "translateY(10px)",
                          animation: `fadeSlideIn 0.4s ease-out forwards`,
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
                        <strong>{item.name}</strong> — Hole {item.hole}, {item.area}
                        {isPlacingMode && (
                          <span style={{ color: item.position ? "#6fff8f" : "#ff5c5c", marginLeft: 6 }}>
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