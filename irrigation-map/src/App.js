// irrigation-map/src/App.js
import React, { useState, useEffect } from "react";
import './App.css';
import { useJsApiLoader } from "@react-google-maps/api";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { auth, db, storage } from "./firebase";

import Login from "./Login";
import MapComponent from "./components/MapComponent";
import MapItems from "./components/MapItems";
import LogManagement from "./components/LogManagement";
import PlacementManagement from "./components/PlacementManagement";
import ManageAreas from "./components/ManageAreas";

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
  const [showAddObjectForm, setShowAddObjectForm] = useState(false);
  const [showManageAreas, setShowManageAreas] = useState(false);
  const [logDate, setLogDate] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logImage, setLogImage] = useState(null);
  const [logs, setLogs] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [holes, setHoles] = useState([]);
  const [areaTypes, setAreaTypes] = useState([]);
  const [areasByHole, setAreasByHole] = useState({});
  const [selectedHole, setSelectedHole] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [manageHoleName, setManageHoleName] = useState("");
  const [manageAreaType, setManageAreaType] = useState("");
  const [expandedHole, setExpandedHole] = useState(null);

  const itemsRef = collection(db, "irrigationItems");
  const holesCollection = collection(db, "holes");

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

  useEffect(() => {
    const unsubscribe = onSnapshot(holesCollection, (snapshot) => {
      const holesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHoles(holesData.map(h => h.name));
      const areasData = holesData.reduce((acc, hole) => {
        acc[hole.name] = hole.areas || [];
        return acc;
      }, {});
      setAreasByHole(areasData);
    });
    return () => unsubscribe();
  }, []);

  const handleMapClick = async (e) => {
    if (!placingType || !itemName || !selectedHole || !selectedArea) return;

    const newItem = {
      type: placingType,
      name: itemName,
      hole: selectedHole,
      area: selectedArea,
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
    setSelectedHole("");
    setSelectedArea("");
    setShowAddObjectForm(false);
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

  const addHole = async (holeName) => {
    if (!holes.includes(holeName)) {
      try {
        await addDoc(holesCollection, { name: holeName, areas: [] });
      } catch (error) {
        alert("Error adding hole: ", error.message);
      }
      setManageHoleName('');
    }
  };

  const addAreaType = (areaType) => {
    if (!areaTypes.includes(areaType)) {
      setAreaTypes([...areaTypes, areaType]);
      setManageAreaType('');
    }
  };

  const toggleAreaForHole = async (holeName, areaType) => {
    const holeDoc = holes.find(h => h.name === holeName);
    if (holeDoc) {
      const updatedAreas = areasByHole[holeName].includes(areaType)
        ? areasByHole[holeName].filter(a => a !== areaType)
        : [...areasByHole[holeName], areaType];

      setAreasByHole(prev => ({
        ...prev,
        [holeName]: updatedAreas
      }));

      try {
        await updateDoc(doc(db, "holes", holeDoc.id), { areas: updatedAreas });
      } catch (error) {
        alert("Error updating areas: ", error.message);
      }
    }
  };

  const removeHole = async (holeName) => {
    const holeDoc = holes.find(h => h.name === holeName);
    if (holeDoc) {
      try {
        await deleteDoc(doc(db, "holes", holeDoc.id));
      } catch (error) {
        alert("Error removing hole: ", error.message);
      }
    }
  };

  const removeAreaType = (areaType) => {
    setAreaTypes(areaTypes.filter(a => a !== areaType));
    setAreasByHole(Object.keys(areasByHole).reduce((acc, hole) => ({
      ...acc,
      [hole]: areasByHole[hole].filter(a => a !== areaType)
    }), {}));
  };

  if (!isLoaded) return <div>Loading Map...</div>;
  if (!user) return <Login />;

  const currentIssues = items.filter(item => item.status === "issue");

  return (
    <div>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
        <button onClick={() => setShowAddObjectForm(true)}>Add Object</button>
        <button onClick={() => setShowManageAreas(true)}>Manage Areas</button>
      </div>

      {showAddObjectForm && (
        <PlacementManagement
          placingType={placingType}
          setPlacingType={setPlacingType}
          itemName={itemName}
          setItemName={setItemName}
          holes={holes}
          selectedHole={selectedHole}
          setSelectedHole={setSelectedHole}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          areasByHole={areasByHole}
          setShowAddObjectForm={setShowAddObjectForm}
        />
      )}

      {showManageAreas && (
        <ManageAreas
          holes={holes}
          areaTypes={areaTypes}
          manageAreaType={manageAreaType}
          setManageAreaType={setManageAreaType}
          addAreaType={addAreaType}
          manageHoleName={manageHoleName}
          setManageHoleName={setManageHoleName}
          addHole={addHole}
          setExpandedHole={setExpandedHole}
          expandedHole={expandedHole}
          removeHole={removeHole}
          removeAreaType={removeAreaType}
          areasByHole={areasByHole}
          toggleAreaForHole={toggleAreaForHole}
          setShowManageAreas={setShowManageAreas}
        />
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

      <MapComponent
        center={center}
        containerStyle={containerStyle}
        onMapClick={handleMapClick}
      >
        <MapItems
          items={items}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          getShapeIcon={getShapeIcon}
          setLogs={setLogs}
          toggleStatus={toggleStatus}
          confirmAndDelete={confirmAndDelete}
          handleViewHistory={handleViewHistory}
        />
      </MapComponent>

      {selectedItem && (
        <LogManagement
          logs={logs}
          logDate={logDate}
          logNotes={logNotes}
          logImage={logImage}
          selectedItem={selectedItem}
          handleAddLog={handleAddLog}
          handleViewHistory={handleViewHistory}
          setLogDate={setLogDate}
          setLogNotes={setLogNotes}
          setLogImage={setLogImage}
          uploading={uploading}
        />
      )}
    </div>
  );
}

export default App;