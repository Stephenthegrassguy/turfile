import React, { useState, useEffect } from "react";
import './App.css';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { auth, db, storage } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./Login";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const containerStyle = {
  width: "100vw",
  height: "100vh"
};

const center = {
  lat: 49.2117,
  lng: -123.1554
};

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });
  

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [placingType, setPlacingType] = useState(null);
  const [itemName, setItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logDate, setLogDate] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logImage, setLogImage] = useState(null);
  const [logs, setLogs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);

  const itemsRef = collection(db, "irrigationItems");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const handleMapClick = async (e) => {
    if (!placingType || !itemName) return;

    const newItem = {
      type: placingType,
      name: itemName,
      position: {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      },
      status: "working",
      createdAt: new Date()
    };

    await addDoc(itemsRef, newItem);
    setPlacingType(null);
    setItemName("");
  };

  const handleAddLog = async () => {
    if (!selectedItem || !logDate || !logNotes) return;

    setUploading(true);
    let imageUrl = "";

    try {
      if (logImage) {
        const imageRef = ref(storage, `logs/${selectedItem.id}/${Date.now()}_${logImage.name}`);
        await uploadBytes(imageRef, logImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      const logRef = collection(db, `irrigationItems/${selectedItem.id}/logs`);
      await addDoc(logRef, {
        date: logDate,
        notes: logNotes,
        imageUrl,
        createdAt: new Date()
      });

      setShowLogForm(false);
      setLogDate("");
      setLogNotes("");
      setLogImage(null);
    } catch (err) {
      alert("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleViewHistory = async () => {
    const logRef = collection(db, `irrigationItems/${selectedItem.id}/logs`);
    const logSnap = await getDocs(logRef);
    const logList = logSnap.docs.map(doc => doc.data());
    setLogs(logList.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const confirmAndDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item? All logs and data will be permanently removed.")) {
      await deleteDoc(doc(db, "irrigationItems", selectedItem.id));
      setSelectedItem(null);
    }
  };

  const toggleStatus = async () => {
    const newStatus = selectedItem.status === "working" ? "issue" : "working";
    await updateDoc(doc(db, "irrigationItems", selectedItem.id), { status: newStatus });
    setSelectedItem(prev => ({ ...prev, status: newStatus }));
  };

  const getShapeIcon = (type) => {
    const size = 10;
    if (!window.google) return null;
    switch (type) {
      case "head":
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: size,
          fillColor: "blue",
          fillOpacity: 1,
          strokeWeight: 0
        };
      case "valve":
        return {
          path: "M -10 -10 L 10 -10 L 10 10 L -10 10 Z",
          fillColor: "red",
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 1
        };
      case "satellite":
        return {
          path: "M 0,-10 L 10,10 L -10,10 Z",
          fillColor: "green",
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 1
        };
      case "splice box":
        return {
          path: "M 10 0 L 7 7 L 0 10 L -7 7 L -10 0 L -7 -7 L 0 -10 L 7 -7 Z",
          fillColor: "purple",
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 1
        };
      default:
        return null;
    }
  };

  if (!isLoaded) return <div>Loading Map...</div>;
  if (!user) return <Login />;

  const currentIssues = items.filter(item => item.status === "issue");

  return (
    <div>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
        <button onClick={() => setPlacingType("head")}>Place Head</button>
        <button onClick={() => setPlacingType("valve")}>Place Valve</button>
        <button onClick={() => setPlacingType("satellite")}>Place Satellite</button>
        <button onClick={() => setPlacingType("splice box")}>Place Splice Box</button>
        <button onClick={() => setPlacingType("wire")}>Place Wire</button>
        <button onClick={() => setPlacingType("pipe")}>Place Pipe</button>
      </div>

      {placingType && (
        <div style={{ position: "absolute", top: 160, left: 10, background: "white", padding: "10px", border: "1px solid gray", zIndex: 2 }}>
          <p><strong>Placing:</strong> {placingType.toUpperCase()}</p>
          <input
            type="text"
            placeholder="Enter item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <p style={{ fontSize: "0.85rem", marginTop: "5px" }}>
            Click anywhere on the map to place it.
          </p>
        </div>
      )}

      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
        <button onClick={() => signOut(auth)}>Logout</button>
      </div>

      {currentIssues.length > 0 && (
        <div style={{ position: "absolute", bottom: 10, left: 10, background: "white", padding: "10px", border: "1px solid red", zIndex: 2 }}>
          <h4 style={{ margin: 0 }}>Current Issues:</h4>
          <ul>
            {currentIssues.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={18}
        onClick={handleMapClick}
        options={{
          mapTypeId: "satellite",
          tilt: 0,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
      >
        {items.map((item) => (
          <Marker
            key={item.id}
            position={item.position}
            icon={getShapeIcon(item.type)}
            onClick={() => {
              setSelectedItem(item);
              setLogs([]);
            }}
            label={{
              text: item.name || "",
              fontSize: "10px",
              fontWeight: "bold"
            }}
          />
        ))}

        {selectedItem && (
          <InfoWindow
            position={selectedItem.position}
            onCloseClick={() => {
              setSelectedItem(null);
              setShowLogForm(false);
              setExpandedLog(null);
            }}
          >
            <div style={{ maxWidth: "300px" }}>
              <p><strong>{selectedItem.name}</strong></p>
              <p>Type: {selectedItem.type}</p>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: 8 }}>Status:</span>
                <label className="switch">
                  <input type="checkbox" checked={selectedItem.status === "working"} onChange={toggleStatus} />
                  <span className="slider round"></span>
                </label>
              </div>
              <button onClick={confirmAndDelete} style={{ marginTop: 10 }}>Delete</button>
              <button onClick={() => setShowLogForm(true)} style={{ marginLeft: "8px" }}>Add Log</button>
              <button onClick={handleViewHistory} style={{ marginLeft: "8px" }}>View History</button>

              {showLogForm && (
                <div style={{ marginTop: "10px" }}>
                  <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} /><br />
                  <textarea
                    placeholder="Enter notes"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    style={{ width: "100%", height: "60px", marginTop: "5px" }}
                  /><br />
                  <input type="file" onChange={(e) => setLogImage(e.target.files[0])} /><br />
                  <button onClick={handleAddLog} disabled={uploading}>Save Log</button>
                  <button onClick={() => setShowLogForm(false)} style={{ marginLeft: "8px" }}>Cancel</button>
                </div>
              )}

              {logs.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <h4>Log History:</h4>
                  {logs.map((log, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "5px", cursor: "pointer" }} onClick={() => setExpandedLog(log)}>
                      {log.imageUrl && <img src={log.imageUrl} alt="log-thumb" style={{ width: "30px", height: "30px", objectFit: "cover", marginRight: "8px" }} />}
                      <div>
                        <strong>{log.date}</strong><br />
                        <span style={{ fontSize: "12px" }}>{log.notes.substring(0, 30)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfoWindow>
        )}

        {expandedLog && (
          <InfoWindow
            position={selectedItem.position}
            onCloseClick={() => setExpandedLog(null)}
          >
            <div style={{ maxWidth: "300px" }}>
              <h4>Log Detail</h4>
              <p><strong>Date:</strong> {expandedLog.date}</p>
              <p><strong>Notes:</strong> {expandedLog.notes}</p>
              {expandedLog.imageUrl && <img src={expandedLog.imageUrl} alt="log" style={{ width: "100%" }} />}
              <button onClick={() => setExpandedLog(null)} style={{ marginTop: "8px" }}>Close</button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default App;