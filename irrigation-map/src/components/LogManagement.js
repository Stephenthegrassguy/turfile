// irrigation-map/src/components/LogManagement.js
import React from "react";

const LogManagement = ({
  logs,
  logDate,
  logNotes,
  logImage,
  selectedItem,
  handleAddLog,
  handleViewHistory,
  setLogDate,
  setLogNotes,
  setLogImage,
  uploading
}) => {
  if (!selectedItem) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleAddLog();
  };

  return (
    <div style={{ position: "absolute", bottom: "10px", right: "10px", background: "white", padding: "10px", border: "1px solid gray", zIndex: 2 }}>
      <h3>Logs for {selectedItem.name}</h3>
      <form onSubmit={handleFormSubmit}>
        <input
          type="date"
          value={logDate}
          onChange={(e) => setLogDate(e.target.value)}
          required
        />
        <textarea
          value={logNotes}
          onChange={(e) => setLogNotes(e.target.value)}
          placeholder="Enter log notes"
          required
        />
        <input type="file" onChange={(e) => setLogImage(e.target.files[0])} />
        <button type="submit" disabled={uploading}>Add Log</button>
      </form>
      <button onClick={handleViewHistory} style={{ marginTop: "10px" }}>View History</button>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <p>{log.date}: {log.notes}</p>
            {log.imageUrl && <img src={log.imageUrl} alt="log" style={{ width: "100px" }} />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogManagement;