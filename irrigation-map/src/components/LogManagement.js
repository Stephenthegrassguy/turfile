import React, { useState } from "react";
import { InfoWindow } from "@react-google-maps/api";

const LogManagement = ({
  position,
  onClose,
  selectedItem,
  toggleStatus,
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
  const [selectedLog, setSelectedLog] = useState(null); // 🔥 New

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

  return (
    <>
      <InfoWindow position={position} onCloseClick={onClose}>
        <div style={{ maxWidth: "300px" }}>
          <p><strong>{selectedItem.name}</strong></p>
          <p>Type: {selectedItem.type}</p>
          <p>Hole: {selectedItem.hole}</p>
          <p>Area: {selectedItem.area}</p>

          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: 8 }}>Status:</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={selectedItem.status === "working"}
                onChange={toggleStatus}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {!viewHistory ? (
            <>
              {showLogForm ? (
                <form onSubmit={handleFormSubmit}>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    required
                    style={{ marginTop: "8px" }}
                  />
                  <textarea
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Enter log notes"
                    required
                    style={{ width: "100%", height: "60px", marginTop: "4px" }}
                  />
                  <input
                    type="file"
                    onChange={(e) => setLogImage(e.target.files[0])}
                    style={{ marginTop: "4px" }}
                  />
                  <button type="submit" disabled={uploading} style={{ marginTop: "6px" }}>
                    Submit Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogForm(false)}
                    style={{ marginLeft: "6px", marginTop: "6px" }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => setShowLogForm(true)}>Add Log</button>
                  <button onClick={handleViewHistoryClick} style={{ marginLeft: "6px" }}>
                    View History
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ marginTop: "10px" }}>
              <button onClick={() => setViewHistory(false)}>← Back</button>
              <ul style={{ maxHeight: "150px", overflowY: "auto", paddingLeft: "16px" }}>
                {Array.isArray(logs) && logs.length > 0 ? (
                  logs.map((log, index) => (
                    <li
                      key={index}
                      style={{ marginBottom: "8px", cursor: "pointer" }}
                      onClick={() => setSelectedLog(log)} // 🔥 Show modal
                    >
                      <strong>{log.date}</strong>
                      <p style={{ margin: 0, fontSize: "12px", color: "#333" }}>
                        {log.notes.slice(0, 30)}{log.notes.length > 30 ? "..." : ""}
                      </p>
                      {log.imageUrl && (
                        <img
                          src={log.imageUrl}
                          alt="thumb"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            marginTop: "4px",
                            borderRadius: "4px"
                          }}
                        />
                      )}
                    </li>
                  ))
                ) : (
                  <li>No logs found.</li>
                )}
              </ul>
            </div>
          )}

          <button onClick={confirmAndDelete} style={{ marginTop: 10 }}>Delete</button>
        </div>
      </InfoWindow>

      {selectedLog && (
        <div
          onClick={() => setSelectedLog(null)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <h3>{selectedLog.date}</h3>
            <p>{selectedLog.notes}</p>
            {selectedLog.imageUrl && (
              <img
                src={selectedLog.imageUrl}
                alt="log"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                  marginTop: "10px",
                  borderRadius: "6px"
                }}
              />
            )}
            <button
              style={{ marginTop: "10px", float: "right" }}
              onClick={() => setSelectedLog(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LogManagement;
