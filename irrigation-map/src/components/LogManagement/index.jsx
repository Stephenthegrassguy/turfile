// Import React and useState hook for managing component state
import React, { useState } from "react";
// Import InfoWindow component from the Google Maps API for displaying an info window on the map
import { InfoWindow } from "@react-google-maps/api";
// Import Firebase Firestore methods for updating, deleting, and adding documents
import { doc, updateDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
// Import the Firebase database configuration
import { db } from "../../firebase";

// Import shared styles for the panel layout, buttons, inputs, etc.
import {
  panelBase,
  button,
  input,
  select,
  headerBase,
} from "../../styles/PanelStyles";
// Import custom styles specific to this component
import styles from "./styles";

// Main React component for managing logs related to an irrigation item
const LogManagement = ({
  position,               // Coordinates for positioning the info window on the map
  onClose,                // Callback function to close the info window
  selectedItem,           // The currently selected irrigation item object
  refreshSelectedItem,    // Function to refresh the data for the selected item
  setSelectedItem,        // Function to update the selected item state
  confirmAndDelete,       // Function to confirm and delete an irrigation item
  handleAddLog,           // Function to add a new log entry
  handleViewHistory,      // Function to retrieve historical log entries
  logs,                   // Array of log entries for the selected item
  logDate,                // State for the date field in the log form
  setLogDate,             // Function to update the log date
  logNotes,               // State for the notes field in the log form
  setLogNotes,            // Function to update the log notes
  logImage,               // State array containing selected image files for the log
  setLogImage,            // Function to update the log image array
  uploading               // Boolean flag indicating if an image upload is in progress
}) => {
  // Local state to determine if the history view is active
  const [viewHistory, setViewHistory] = useState(false);
  // Local state to determine if the log form should be shown
  const [showLogForm, setShowLogForm] = useState(false);
  // Local state to keep track of the currently selected log (for modal display)
  const [selectedLog, setSelectedLog] = useState(null);
  // Local state to determine if the issue creation form should be displayed
  const [showIssueForm, setShowIssueForm] = useState(false);
  // Local state to hold the selected issue type when creating an issue
  const [issueType, setIssueType] = useState("");

  // If no item is selected or no position is defined, do not render the component
  if (!selectedItem || !position) return null;

  // Handles submission of the new log form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Execute the provided function to add a log
    handleAddLog();
    // Hide the log form after submission
    setShowLogForm(false);
  };

  // Handles the click event for viewing the log history
  const handleViewHistoryClick = async () => {
    await handleViewHistory();  // Fetch logs from the database
    setViewHistory(true);        // Activate the history view
  };

  // Toggles the status of an irrigation item (mark as issue or resolve issue)
  // Accepts an optional issueType: if provided, it marks the item as having an issue.
  const toggleStatus = async (itemId, issueType = null) => {
    try {
      // Reference to the Firestore document for the selected item
      const itemRef = doc(db, "irrigationItems", itemId);
      if (issueType) {
        // Update Firestore: mark as issue with the provided issue type and update the status
        await updateDoc(itemRef, {
          issue: { type: issueType, active: true },
          status: "issue"
        });
      } else {
        // Update Firestore: clear the issue and mark the status as working
        await updateDoc(itemRef, {
          issue: { type: "", active: false },
          status: "working"
        });
      }
      
      // Reference to the logs subcollection for the item
      const logRef = collection(db, `irrigationItems/${itemId}/logs`);
      // Get today’s date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];
      // Set a descriptive log note based on the issue status change
      const logNote = issueType ? `Marked as issue: ${issueType}` : "Issue resolved";

      // Add a new log entry for the change in status
      await addDoc(logRef, {
        date: today,
        notes: logNote,
        imageUrls: [],
        createdAt: new Date()
      });

      // Update the selected item state with the new issue status locally
      setSelectedItem((prev) => ({
        ...prev,
        issue: { type: issueType || "", active: !!issueType },
        status: issueType ? "issue" : "working"
      }));

      // Refresh the selected item’s data by retrieving updated info from Firestore
      if (typeof refreshSelectedItem === "function") {
        await refreshSelectedItem(itemId);
      }      
    } catch (error) {
      console.error("Error updating issue status or logging:", error);
    }
  };

  // Handles deletion of a log entry
  const handleDeleteLog = async () => {
    // Ensure we have both a selected item and a selected log before proceeding
    if (!selectedItem || !selectedLog) return;
    // Confirm user action with a dialog
    if (window.confirm("Are you sure you want to delete this log?")) {
      try {
        // Reference to the specific log document in Firestore to delete
        const logRef = doc(db, `irrigationItems/${selectedItem.id}/logs`, selectedLog.id);
        await deleteDoc(logRef);
        // Clear the selected log after deletion
        setSelectedLog(null);
        // Refresh the log history to reflect the deletion
        await handleViewHistory();
      } catch (error) {
        console.error("Error deleting log:", error);
        alert("Failed to delete the log.");
      }
    }
  };

  return (
    <>
      {/* Google Maps InfoWindow to display item information and controls */}
      <InfoWindow
        position={position}
        onCloseClick={onClose}
        // Custom options for the info window – disables auto panning and provides a custom close box
        options={{
          disableAutoPan: true,
          pixelOffset: new window.google.maps.Size(0, -35),
          closeBoxURL: "",
        }}
      >
        <div style={styles.wrapper}>
          <div style={{ width: "250px", borderRadius: "12px", overflow: "hidden" }}>
            {/* Header section displaying the name of the selected item and a close button */}
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
            {/* Main panel displaying item details and interactive controls */}
            <div style={{ ...panelBase, padding: "12px", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              {/* Display basic item information */}
              <p style={styles.text}>Type: {selectedItem.type}</p>
              <p style={styles.text}>Hole: {selectedItem.hole}</p>
              <p style={styles.text}>Area: {selectedItem.area}</p>

              {/* Conditionally render controls when not showing the log form or history */}
              {!showLogForm && !viewHistory && (
                <div style={styles.statusRow}>
                  <span style={{ fontWeight: "bold", color: "#fff", fontSize: "13px" }}>Status:</span>
                  {/* If an issue is active, show its details with a button to resolve it */}
                  {selectedItem.issue?.active ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#e74c3c", fontSize: "13px" }}>{selectedItem.issue.type}</span>
                      <button style={button} onClick={() => toggleStatus(selectedItem.id, null)}>Issue Solved</button>
                    </div>
                  ) : 
                  // Otherwise, if not showing the issue creation form, offer a button to set an issue
                  !showIssueForm ? (
                    <button style={{ ...button, marginLeft: "8px" }} onClick={() => setShowIssueForm(true)}>Make an Issue</button>
                  ) : (
                    // If the issue creation form is active, present a select menu for choosing the issue type and an add button
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
                        // Reset and hide the issue creation form once an issue is added
                        setShowIssueForm(false);
                        setIssueType("");
                      }}>Add</button>
                    </div>
                  )}
                </div>
              )}

              {/* Conditionally render either the log form or the primary button group */}
              {!viewHistory ? (
                showLogForm ? (
                  // Log Form for adding a new log entry
                  <form onSubmit={handleFormSubmit} style={styles.logForm}>
                    {/* Date input for the log entry */}
                    <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required style={input} />
                    {/* Textarea for entering log notes */}
                    <textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} placeholder="Enter log notes" required style={styles.textarea} />
                    {/* File input button for uploading images (hidden input, styled label) */}
                    <label htmlFor="fileUpload" style={{ ...button, display: "inline-block", textAlign: "center" }}>
                      {logImage.length > 0 ? `Files selected (${logImage.length})` : "Choose Files"}
                      <input type="file" id="fileUpload" multiple onChange={(e) => setLogImage(prev => [...prev, ...Array.from(e.target.files)])} style={styles.fileInput} />
                    </label>

                    {/* Preview selected images if any have been chosen */}
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

                    {/* Buttons for submitting or cancelling the log form */}
                    <div style={styles.logFormButtons}>
                      <button type="submit" disabled={uploading} style={button}>Submit Log</button>
                      <button type="button" onClick={() => setShowLogForm(false)} style={button}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  // Primary button group when not in the log form or history view
                  <div style={styles.buttonGroup}>
                    <button onClick={() => setShowLogForm(true)} style={button}>Add Log</button>
                    <button onClick={handleViewHistoryClick} style={button}>View History</button>
                    <button onClick={confirmAndDelete} style={{ ...button, backgroundColor: "#c0392b" }}>Delete</button>
                  </div>
                )
              ) : (
                // History view: displays a list of past log entries with a back button
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => setViewHistory(false)} style={button}>← Back</button>
                  <div style={styles.logList}>
                    {Array.isArray(logs) && logs.length > 0 ? (
                      logs.map((log, index) => (
                        <div key={index} style={styles.logRow} onClick={() => setSelectedLog(log)}>
                          <div style={styles.logText}>
                            <strong>{log.date}</strong>
                            <p style={{ margin: 0, fontSize: "12px", color: "#ccc" }}>
                              {log.notes.slice(0, 40)}{log.notes.length > 40 ? "..." : ""}
                            </p>
                          </div>
                          {/* Render a thumbnail if an image URL exists for the log */}
                          {log.imageUrls?.[0] && (
                            <img src={log.imageUrls[0]} alt="thumb" style={styles.logThumb} />
                          )}
                        </div>
                      ))
                    ) : (
                      // Message shown if no logs are available
                      <p style={styles.text}>No logs found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </InfoWindow>

      {/* Modal display for viewing detailed information about a selected log */}
      {selectedLog && (
        <div onClick={() => setSelectedLog(null)} style={styles.modalBackdrop}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modalContent}>
            <h3>{selectedLog.date}</h3>
            <p>{selectedLog.notes}</p>
            {/* Render each image associated with the log */}
            {selectedLog.imageUrls?.map((url, i) => (
              <img key={i} src={url} alt={`log-${i}`} style={styles.fullImage} />
            ))}
            {/* Modal actions for closing or deleting the selected log */}
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
