import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { button, input } from "../styles/PanelStyles";

const CreateInventory = ({ holes, areas, onGenerate }) => {
  const [headCounts, setHeadCounts] = useState({});
  const [previewItems, setPreviewItems] = useState([]);
  const [existingNames, setExistingNames] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const initial = {};
    holes.forEach((hole) => {
      initial[hole] = {};
      areas.forEach((area) => {
        initial[hole][area] = 0;
      });
    });
    setHeadCounts(initial);
    fetchExistingNames();
  }, [holes, areas]);

  const fetchExistingNames = async () => {
    const snapshot = await getDocs(collection(db, "irrigationItems"));
    const names = snapshot.docs.map((doc) => doc.data().name);
    setExistingNames(names);
  };

  const handleChange = (hole, area, value) => {
    setHeadCounts((prev) => ({
      ...prev,
      [hole]: {
        ...prev[hole],
        [area]: parseInt(value) || 0,
      },
    }));
  };

  const buildPreview = () => {
    const items = [];

    for (const hole in headCounts) {
      for (const area in headCounts[hole]) {
        const count = headCounts[hole][area];
        for (let i = 1; i <= count; i++) {
          const name = `${hole}${area.charAt(0).toUpperCase()}${i}`;
          const isDuplicate = existingNames.includes(name);

          items.push({
            name,
            hole,
            area,
            type: "head",
            position: null,
            createdAt: new Date(),
            duplicate: isDuplicate
          });
        }
      }
    }

    setPreviewItems(items);
    setShowPreview(true);
  };

  const handleConfirmGenerate = () => {
    const filtered = previewItems.filter((item) => !item.duplicate);
    onGenerate(filtered);
    setPreviewItems([]);
    setShowPreview(false);
  };

  return (
    <div>
      <h4 style={{ fontSize: "13px", marginBottom: "10px" }}>Generate Heads</h4>

      <div style={{ overflowX: "auto" }}>
        <table style={{ fontSize: "12px", width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingBottom: "6px" }}>Hole</th>
              {areas.map((area) => (
                <th key={area} style={{ textAlign: "center", paddingBottom: "6px" }}>{area}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holes.map((hole) => (
              <tr key={hole}>
                <td>{hole}</td>
                {areas.map((area) => (
                  <td key={area} style={{ textAlign: "center" }}>
                    <input
                      type="number"
                      min="0"
                      style={{ ...input, width: "40px" }}
                      value={headCounts[hole]?.[area] || ""}
                      onChange={(e) => handleChange(hole, area, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showPreview && (
        <button style={{ ...button, marginTop: "10px" }} onClick={buildPreview}>
          Preview
        </button>
      )}

      {showPreview && (
        <>
          <p style={{ fontSize: "12px" }}>
            {previewItems.length} heads will be created.
            <span style={{ color: "#f88" }}> {previewItems.filter((i) => i.duplicate).length} already exist and will be skipped.</span>
          </p>

          <ul style={{ maxHeight: "150px", overflowY: "auto", paddingLeft: "16px", fontSize: "12px" }}>
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

          <button style={{ ...button, marginTop: "8px" }} onClick={handleConfirmGenerate}>
            Generate {previewItems.filter((i) => !i.duplicate).length} Heads
          </button>
        </>
      )}
    </div>
  );
};

export default CreateInventory;