import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";

import {
  panelBase,
  overlayBase,
  button,
  input,
  headerBase
} from "../styles/PanelStyles";

const ManageAreas = ({ holes, areas, setShowManageAreas }) => {
  const [newArea, setNewArea] = useState("");
  const [newHole, setNewHole] = useState("");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 100, left: 300 });
  const [localAreas, setLocalAreas] = useState([...areas]);
  const [localHoles, setLocalHoles] = useState([...holes]);

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

  const addArea = async () => {
    if (!newArea) return;
    await addDoc(collection(db, "areas"), { name: newArea });
    setLocalAreas([newArea, ...localAreas]);
    setNewArea("");
  };

  const deleteArea = async (name) => {
    const snapshot = await getDocs(collection(db, "areas"));
    snapshot.forEach(async (docItem) => {
      if (docItem.data().name === name) {
        await deleteDoc(doc(db, "areas", docItem.id));
      }
    });
    setLocalAreas(localAreas.filter((a) => a !== name));
  };

  const addHole = async () => {
    if (!newHole) return;
    await addDoc(collection(db, "holes"), { name: newHole });
    setLocalHoles([newHole, ...localHoles]);
    setNewHole("");
  };

  const deleteHole = async (name) => {
    const snapshot = await getDocs(collection(db, "holes"));
    snapshot.forEach(async (docItem) => {
      if (docItem.data().name === name) {
        await deleteDoc(doc(db, "holes", docItem.id));
      }
    });
    setLocalHoles(localHoles.filter((h) => h !== name));
  };

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
    e.stopPropagation(); // ✅ don't let it bubble up and break clicks
    startDrag(e);
  }}
  onMouseUp={stopDrag}
>

          <span style={{ fontWeight: "bold", fontSize: "13px", color: "#fff", lineHeight: 1.2 }}>
            Manage Areas and Holes
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
            onClick={() => setShowManageAreas(false)}
          >
            ✕
          </button>
        </div>

        {/* Panel Body */}
        <div style={{ ...panelBase, padding: "20px", borderTopLeftRadius: 0, borderTopRightRadius: 0, width: "320px", maxHeight: "70vh", overflowY: "auto" }}>
          <div>
            <h4 style={{ fontSize: "14px", margin: "10px 0 6px" }}>Areas</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="New area name"
                style={input}
              />
              <button style={{ ...button, backgroundColor: "#27ae60", border: "none" }} onClick={addArea}>Add</button>
            </div>
            <ul style={{ listStyle: "none", paddingLeft: "0", marginTop: "6px" }}>
              {localAreas.map((area, index) => (
                <li key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  {area}
                  <button
                    style={{ ...button, backgroundColor: "#c0392b", border: "none", fontSize: "11px", padding: "2px 6px" }}
                    onClick={() => deleteArea(area)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", margin: "10px 0 6px" }}>Holes</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <input
                type="text"
                value={newHole}
                onChange={(e) => setNewHole(e.target.value)}
                placeholder="New hole number"
                style={input}
              />
              <button style={{ ...button, backgroundColor: "#27ae60", border: "none" }} onClick={addHole}>Add</button>
            </div>
            <ul style={{ listStyle: "none", paddingLeft: "0", marginTop: "6px" }}>
              {localHoles.map((hole, index) => (
                <li key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  {hole}
                  <button
                    style={{ ...button, backgroundColor: "#c0392b", border: "none", fontSize: "11px", padding: "2px 6px" }}
                    onClick={() => deleteHole(hole)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAreas;
