// src/components/CreateInventory/index.js
import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";             // Go up 2 levels
import { button, input } from "../../styles/PanelStyles"; // Go up 2 levels
import styles from "./styles";

const CreateInventory = ({ holes, areas, showPreview, onBack }) => {
  const [headCounts, setHeadCounts] = useState({});
  const [existingNames, setExistingNames] = useState([]);
  const initializedRef = useRef(false);

  // Initialize headCounts with holes and areas only once
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

  // Fetch existing names from Firestore
  useEffect(() => {
    const fetchExistingNames = async () => {
      const snapshot = await getDocs(collection(db, "irrigationItems"));
      const names = snapshot.docs.map((doc) => doc.data().name);
      setExistingNames(names);
    };
    fetchExistingNames();
  }, []);

  // Update headCounts if the input value is a valid number
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

  // Build preview items from headCounts and invoke showPreview callback
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

  // Check if any head count value has been entered
  const hasValuesEntered = Object.values(headCounts).some((hole) =>
    Object.values(hole).some((val) => val && parseInt(val) > 0)
  );

  return (
    <div>
      <div style={styles.headerContainer}>
        <p style={styles.headerText}>
          Fill out your total head count per block
        </p>
        <div style={styles.headerButtonContainer}>
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

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeaderLeft}>Hole</th>
              {areas.map((area) => (
                <th key={area} style={styles.tableHeaderCenter}>
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
                  <td key={area} style={styles.tableDataCenter}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      style={{ ...input, ...styles.inventoryInput }}
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

export default CreateInventory