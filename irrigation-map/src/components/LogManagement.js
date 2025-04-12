import React, { useState } from "react";
import { InfoWindow } from "@react-google-maps/api";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import {
  panelBase,
  button,
  input,
  select,
  headerBase
} from "../styles/PanelStyles";

const LogManagement = ({
  position,
  onClose,
  selectedItem,
  refreshSelectedItem,
  setSelectedItem,
  confirmAndDelete,
  handleAddLog,
  handleViewHistory,
  logs,
  logDate,
  setLogDate,
  logNotes,
  setLogNotes,
  logImage,
  setLogImage,
  uploading
}) => {
  const [viewHistory, setViewHistory] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueType, setIssueType] = useState("");

  if (!selectedItem || !position) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleAddLog();
    setShowLogForm(false);
  };

  const handleViewHistoryClick = async () => {
    await handleViewHistory();
    setViewHistory(true);
  };

  const toggleStatus = async (itemId, issueType = null) => {
    try {
      const itemRef = doc(db, "irrigationItems", itemId);

      if (issueType) {
        await updateDoc(itemRef, {
          issue: { type: issueType, active: true },
          status: "issue"
        });
      } else {
        await updateDoc(itemRef, {
          issue: { type: "", active: false },
          status: "working"
        });
      }

      setSelectedItem((prev) => ({
        ...prev,
        issue: { type: issueType || "", active: !!issueType },
        status: issueType ? "issue" : "working"
      }));

      await refreshSelectedItem(itemId);
    } catch (error) {
      console.error("Error updating issue status:", error);
    }
  };

  return (
    <>
      <InfoWindow
        position={position}
        onCloseClick={onClose}
        options={{
          disableAutoPan: true,
          pixelOffset: new window.google.maps.Size(0, -35),
          closeBoxURL: "", // Hides default close button
        }}
      >
        <div style={styles.wrapper}>
          <div style={{ borderRadius: "12px", overflow: "hidden", maxWidth: "280px" }}>
            <div style={headerBase}>
              <span style={{ fontWeight: "bold", fontSize: "13px", color: "#fff" }}>
                {selectedItem.name}
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
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <div style={{ ...panelBase, padding: "12px", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <p style={styles.text}>Type: {selectedItem.type}</p>
              <p style={styles.text}>Hole: {selectedItem.hole}</p>
              <p style={styles.text}>Area: {selectedItem.area}</p>

              <div style={{ ...styles.text, marginTop: "10px" }}>
                <strong>Status:</strong>{" "}
                {selectedItem.issue?.active ? (
                  <>
                    <span style={{ color: "#e74c3c" }}>{selectedItem.issue.type}</span>
                    <button
                      style={{ ...button, marginLeft: "8px" }}
                      onClick={() => toggleStatus(selectedItem.id, null)}
                    >
                      Issue Solved
                    </button>
                  </>
                ) : !showIssueForm ? (
                  <button
                    onClick={() => setShowIssueForm(true)}
                    style={{ ...button, marginLeft: "8px" }}
                  >
                    Make an Issue
                  </button>
                ) : (
                  <div style={{ marginTop: "8px" }}>
                    <select
                      style={select}
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                    >
                      <option value="">Select Issue</option>
                      <option value="Needs level">Needs level</option>
                      <option value="Electrical Issue">Electrical Issue</option>
                      <option value="Weeping">Weeping</option>
                      <option value="Stuck on">Stuck on</option>
                      <option value="Stuck off">Stuck off</option>
                      <option value="Broken">Broken</option>
                      <option value="Coverage issue">Coverage issue</option>
                    </select>
                    <button
                      style={{ ...button, marginTop: "6px" }}
                      onClick={async () => {
                        await toggleStatus(selectedItem.id, issueType);
                        setShowIssueForm(false);
                        setIssueType("");
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {!viewHistory ? (
                showLogForm ? (
                  <form onSubmit={handleFormSubmit} style={{ marginTop: "10px" }}>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      required
                      style={input}
                    />
                    <textarea
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="Enter log notes"
                      required
                      style={styles.textarea}
                    />
                    <input
                      type="file"
                      onChange={(e) => setLogImage(e.target.files[0])}
                      style={input}
                    />
                    <div style={{ marginTop: "10px" }}>
                      <button type="submit" disabled={uploading} style={button}>Submit Log</button>
                      <button type="button" onClick={() => setShowLogForm(false)} style={button}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ marginTop: "10px" }}>
                    <button onClick={() => setShowLogForm(true)} style={button}>Add Log</button>
                    <button onClick={handleViewHistoryClick} style={button}>View History</button>
                  </div>
                )
              ) : (
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => setViewHistory(false)} style={button}>← Back</button>
                  <ul style={{ maxHeight: "150px", overflowY: "auto", paddingLeft: "16px" }}>
                    {Array.isArray(logs) && logs.length > 0 ? (
                      logs.map((log, index) => (
                        <li
                          key={index}
                          style={styles.logItem}
                          onClick={() => setSelectedLog(log)}
                        >
                          <strong>{log.date}</strong>
                          <p style={{ margin: 0, fontSize: "12px", color: "#ccc" }}>
                            {log.notes.slice(0, 30)}{log.notes.length > 30 ? "..." : ""}
                          </p>
                          {log.imageUrl && (
                            <img
                              src={log.imageUrl}
                              alt="thumb"
                              style={styles.thumb}
                            />
                          )}
                        </li>
                      ))
                    ) : (
                      <li style={styles.text}>No logs found.</li>
                    )}
                  </ul>
                </div>
              )}

              <button onClick={confirmAndDelete} style={{ ...button, marginTop: "10px" }}>Delete</button>
            </div>
          </div>
        </div>
      </InfoWindow>

      {selectedLog && (
        <div onClick={() => setSelectedLog(null)} style={styles.modalBackdrop}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modalContent}>
            <h3>{selectedLog.date}</h3>
            <p>{selectedLog.notes}</p>
            {selectedLog.imageUrl && (
              <img
                src={selectedLog.imageUrl}
                alt="log"
                style={styles.fullImage}
              />
            )}
            <button style={button} onClick={() => setSelectedLog(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  text: { margin: "4px 0", color: "#fff", fontSize: "13px" },
  textarea: {
    width: "100%",
    height: "60px",
    fontSize: "12px",
    borderRadius: "4px",
    border: "1px solid #444",
    backgroundColor: "#222",
    color: "#fff",
    marginTop: "6px"
  },
  logItem: {
    marginBottom: "10px",
    cursor: "pointer"
  },
  thumb: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "4px",
    marginTop: "4px"
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    background: "#111",
    color: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  fullImage: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "contain",
    marginTop: "10px",
    borderRadius: "6px"
  }
};

export default LogManagement;