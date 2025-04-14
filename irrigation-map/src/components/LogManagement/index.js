// index.js
import React, { useState } from "react";
import { InfoWindow } from "@react-google-maps/api";
import { doc, updateDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

import {
  panelBase,
  button,
  input,
  select,
  headerBase
} from "../../styles/PanelStyles";
import styles from "./styles";

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
      const logRef = collection(db, `irrigationItems/${itemId}/logs`);
      const today = new Date().toISOString().split("T")[0];
      const logNote = issueType ? `Marked as issue: ${issueType}` : "Issue resolved";

      await addDoc(logRef, {
        date: today,
        notes: logNote,
        imageUrls: [],
        createdAt: new Date()
      });

      setSelectedItem((prev) => ({
        ...prev,
        issue: { type: issueType || "", active: !!issueType },
        status: issueType ? "issue" : "working"
      }));

      await refreshSelectedItem(itemId);
    } catch (error) {
      console.error("Error updating issue status or logging:", error);
    }
  };

  const handleDeleteLog = async () => {
    if (!selectedItem || !selectedLog) return;
    if (window.confirm("Are you sure you want to delete this log?")) {
      try {
        const logRef = doc(db, `irrigationItems/${selectedItem.id}/logs`, selectedLog.id);
        await deleteDoc(logRef);
        setSelectedLog(null);
        await handleViewHistory();
      } catch (error) {
        console.error("Error deleting log:", error);
        alert("Failed to delete the log.");
      }
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
          closeBoxURL: "",
        }}
      >
        <div style={styles.wrapper}>
          <div style={{ width: "250px", borderRadius: "12px", overflow: "hidden" }}>
            <div style={headerBase}>
              <span style={{ fontWeight: "bold", fontSize: "13px", color: "#fff" }}>
                {selectedItem.name}
              </span>
              <button
                style={{ background: "transparent", border: "none", color: "#fff", fontSize: "16px", padding: 0, lineHeight: 1, cursor: "pointer" }}
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <div style={{ ...panelBase, padding: "12px", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <p style={styles.text}>Type: {selectedItem.type}</p>
              <p style={styles.text}>Hole: {selectedItem.hole}</p>
              <p style={styles.text}>Area: {selectedItem.area}</p>

              {!showLogForm && !viewHistory && (
                <div style={styles.statusRow}>
                  <span style={{ fontWeight: "bold", color: "#fff", fontSize: "13px" }}>Status:</span>
                  {selectedItem.issue?.active ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#e74c3c", fontSize: "13px" }}>{selectedItem.issue.type}</span>
                      <button style={button} onClick={() => toggleStatus(selectedItem.id, null)}>Issue Solved</button>
                    </div>
                  ) : !showIssueForm ? (
                    <button style={{ ...button, marginLeft: "8px" }} onClick={() => setShowIssueForm(true)}>Make an Issue</button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select style={select} value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                        <option value="">Select Issue</option>
                        <option value="Needs level">Needs level</option>
                        <option value="Electrical Issue">Electrical Issue</option>
                        <option value="Weeping">Weeping</option>
                        <option value="Stuck on">Stuck on</option>
                        <option value="Stuck off">Stuck off</option>
                        <option value="Broken">Broken</option>
                        <option value="Coverage issue">Coverage issue</option>
                      </select>
                      <button style={button} onClick={async () => {
                        await toggleStatus(selectedItem.id, issueType);
                        setShowIssueForm(false);
                        setIssueType("");
                      }}>Add</button>
                    </div>
                  )}
                </div>
              )}

              {!viewHistory ? (
                showLogForm ? (
                  <form onSubmit={handleFormSubmit} style={styles.logForm}>
                    <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required style={input} />
                    <textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} placeholder="Enter log notes" required style={styles.textarea} />
                    <label htmlFor="fileUpload" style={{ ...button, display: "inline-block", textAlign: "center" }}>
                      {logImage.length > 0 ? `Files selected (${logImage.length})` : "Choose Files"}
                      <input type="file" id="fileUpload" multiple onChange={(e) => setLogImage(prev => [...prev, ...Array.from(e.target.files)])} style={styles.fileInput} />
                    </label>

                    {logImage.length > 0 && (
                      <div style={styles.imagePreviewContainer}>
                        {logImage.map((file, i) => (
                          <div key={i} style={styles.thumbWrapper}>
                            <img src={URL.createObjectURL(file)} alt={`thumb-${i}`} style={styles.thumb} />
                            <button onClick={() => setLogImage(prev => prev.filter((_, index) => index !== i))} style={styles.removeButton}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={styles.logFormButtons}>
                      <button type="submit" disabled={uploading} style={button}>Submit Log</button>
                      <button type="button" onClick={() => setShowLogForm(false)} style={button}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div style={styles.buttonGroup}>
                    <button onClick={() => setShowLogForm(true)} style={button}>Add Log</button>
                    <button onClick={handleViewHistoryClick} style={button}>View History</button>
                    <button onClick={confirmAndDelete} style={{ ...button, backgroundColor: "#c0392b" }}>Delete</button>
                  </div>
                )
              ) : (
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => setViewHistory(false)} style={button}>← Back</button>
                  <div style={styles.logList}>
                    {Array.isArray(logs) && logs.length > 0 ? (
                      logs.map((log, index) => (
                        <div key={index} style={styles.logRow} onClick={() => setSelectedLog(log)}>
                          <div style={styles.logText}>
                            <strong>{log.date}</strong>
                            <p style={{ margin: 0, fontSize: "12px", color: "#ccc" }}>{log.notes.slice(0, 40)}{log.notes.length > 40 ? "..." : ""}</p>
                          </div>
                          {log.imageUrls?.[0] && (
                            <img src={log.imageUrls[0]} alt="thumb" style={styles.logThumb} />
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={styles.text}>No logs found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </InfoWindow>

      {selectedLog && (
        <div onClick={() => setSelectedLog(null)} style={styles.modalBackdrop}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modalContent}>
            <h3>{selectedLog.date}</h3>
            <p>{selectedLog.notes}</p>
            {selectedLog.imageUrls?.map((url, i) => (
              <img key={i} src={url} alt={`log-${i}`} style={styles.fullImage} />
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <button style={button} onClick={() => setSelectedLog(null)}>Close</button>
              <button style={{ ...button, backgroundColor: "#c0392b" }} onClick={handleDeleteLog}>Delete Log</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogManagement;