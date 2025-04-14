import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { button, input } from "../styles/PanelStyles";

const CreateInventory = ({ holes, areas, showPreview, onBack }) => {
  const [headCounts, setHeadCounts] = useState({});
  const [existingNames, setExistingNames] = useState([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && holes.length && areas.length) {
      const initial = {};
      holes.forEach((hole) => {
        initial[hole] = {};
        areas.forEach((area) => {
          initial[hole][area] = "";
        });
      });
      setHeadCounts(initial);
      initializedRef.current = true;
    }
  }, [holes, areas]);

  useEffect(() => {
    const fetchExistingNames = async () => {
      const snapshot = await getDocs(collection(db, "irrigationItems"));
      const names = snapshot.docs.map((doc) => doc.data().name);
      setExistingNames(names);
    };
    fetchExistingNames();
  }, []);

  const handleChange = (hole, area, value) => {
    if (/^\d*$/.test(value)) {
      setHeadCounts((prev) => ({
        ...prev,
        [hole]: {
          ...prev[hole],
          [area]: value,
        },
      }));
    }
  };

  const buildPreview = () => {
    const items = [];
    for (const hole in headCounts) {
      for (const area in headCounts[hole]) {
        const count = parseInt(headCounts[hole][area]) || 0;
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
            duplicate: isDuplicate,
          });
        }
      }
    }
    showPreview(items);
  };

  const hasValuesEntered = Object.values(headCounts).some((hole) =>
    Object.values(hole).some((val) => val && parseInt(val) > 0)
  );

  return (
    <div>
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  }}
>
  <p style={{ fontSize: "13px", fontWeight: "500", margin: 0 }}>
    Fill out your total head count per block
  </p>

  <div style={{ display: "flex", gap: "8px" }}>
  <button style={button} onClick={onBack}>
      ← Back
    </button>
    {hasValuesEntered && (
      <button style={button} onClick={buildPreview}>
        Preview
      </button>
    )}
  </div>
</div>


      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            fontSize: "12px",
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingBottom: "6px" }}>Hole</th>
              {areas.map((area) => (
                <th
                  key={area}
                  style={{ textAlign: "center", paddingBottom: "6px" }}
                >
                  {area}
                </th>
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      style={{ ...input, width: "40px" }}
                      value={headCounts[hole]?.[area] ?? ""}
                      onChange={(e) => handleChange(hole, area, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateInventory;
