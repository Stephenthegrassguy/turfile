import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { useJsApiLoader } from "@react-google-maps/api";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDocs,
  getDoc
} from "firebase/firestore";
import { query, where} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CreateProperty from "./components/CreateProperty";
import { auth, db, storage } from "./firebase";
import Login from "./Login";
import MapComponent from "./components/MapComponent";
import MapItems from "./components/MapItems";
import PlacementManagement from "./components/PlacementManagement";
import ManageAreas from "./components/ManageAreas";
import ControlBar from "./components/ControlBar";
import IssuesPanel from "./components/IssuesPanel";
import HeadInventory from "./components/HeadInventory";
import PreviewPanel from "./components/PreviewPanel";
import AccountPanel from "./components/AccountPanel";


const containerStyle = {
  width: "100vw",
  height: "100vh"
};



function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [propertyData, setPropertyData] = useState(null);
  const [items, setItems] = useState([]);
  const [placingType, setPlacingType] = useState(null);
  const [itemName, setItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddObjectForm, setShowAddObjectForm] = useState(false);
  const [showManageAreas, setShowManageAreas] = useState(false);
  const [showIssuesPanel, setShowIssuesPanel] = useState(false);
  const [showInventoryPanel, setShowInventoryPanel] = useState(false);
  const [logDate, setLogDate] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logImage, setLogImage] = useState([]);
  const [logs, setLogs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mapZoom, setMapZoom] = useState(18);
  const [holes, setHoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedHole, setSelectedHole] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [previewItems, setPreviewItems] = useState([]);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const mapRef = useRef(null);

  const center = propertyData?.location || {
    lat: 49.214167,
    lng: -123.161944
  };
  console.log("PropertyData:", propertyData);
  console.log("Map center:", center);
  
  // 🔐 Load current user and their profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          console.error("User profile not found.");
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }

      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      if (userProfile?.propertyId) {
        try {
          const docRef = doc(db, "properties", userProfile.propertyId);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            setPropertyData(docSnap.data());
          } else {
            console.warn("Property not found in Firestore.");
          }
        } catch (err) {
          console.error("Error fetching property data:", err);
        }
      }
    };
  
    fetchProperty();
  }, [userProfile]);
  

   // make sure this is imported

useEffect(() => {
  if (!userProfile?.propertyId) return;

  const q = query(
    collection(db, "irrigationItems"),
    where("propertyId", "==", userProfile.propertyId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems(data);
  });

  return () => unsubscribe();
}, [userProfile]);


  useEffect(() => {
    const unsubscribeHoles = onSnapshot(collection(db, "holes"), (snapshot) => {
      setHoles(snapshot.docs.map((doc) => doc.data().name));
    });
    const unsubscribeAreas = onSnapshot(collection(db, "areas"), (snapshot) => {
      setAreas(snapshot.docs.map((doc) => doc.data().name));
    });
    return () => {
      unsubscribeHoles();
      unsubscribeAreas();
    };
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
    await addDoc(collection(db, "irrigationItems"), newItem);
    setPlacingType(null);
    setItemName("");
    setSelectedHole("");
    setSelectedArea("");
    setShowAddObjectForm(false);
  };

  const handleAddLog = async () => {
    if (!selectedItem || !logDate || !logNotes) return;
    setUploading(true);
    let imageUrls = [];

    try {
      if (logImage.length > 0) {
        const uploadPromises = logImage.map(file => {
          const imageRef = ref(storage, `logs/${selectedItem.id}/${Date.now()}_${file.name}`);
          return uploadBytes(imageRef, file).then(() => getDownloadURL(imageRef));
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      const logRef = collection(db, `irrigationItems/${selectedItem.id}/logs`);
      await addDoc(logRef, {
        date: logDate,
        notes: logNotes,
        imageUrls,
        createdAt: new Date()
      });

      setLogDate("");
      setLogNotes("");
      setLogImage([]);
    } catch (err) {
      alert("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleViewHistory = async () => {
    if (!selectedItem || !selectedItem.id) return;
    const logRef = collection(db, `irrigationItems/${selectedItem.id}/logs`);
    const logSnap = await getDocs(logRef);
    const logList = logSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLogs(logList.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() ?? new Date(a.date);
      const bTime = b.createdAt?.toDate?.() ?? new Date(b.date);
      return bTime - aTime;
    }));
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

  const handleFocusItem = (item) => {
    if (!mapRef.current || !item) return;
    mapRef.current.panTo(item.position);
    mapRef.current.setZoom(20);
    setSelectedItem(item);
  };

  const getShapeIcon = (type, zoom = 18) => {
    const scaleFactor = Math.pow(zoom, 1.4) / 8;
    if (!window.google) return null;
    switch (type) {
      case "head":
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: scaleFactor,
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
          scale: scaleFactor
        };
      case "satellite":
        return {
          path: "M 0,-10 L 10,10 L -10,10 Z",
          fillColor: "green",
          fillOpacity: 1,
          strokeWeight: 0,
          scale: scaleFactor
        };
      case "splice box":
        return {
          path: "M 10 0 L 7 7 L 0 10 L -7 7 L -10 0 L -7 -7 L 0 -10 L 7 -7 Z",
          fillColor: "purple",
          fillOpacity: 1,
          strokeWeight: 0,
          scale: scaleFactor
        };
      default:
        return null;
    }
  };

  const handleConfirmPreview = async () => {
    const filteredItems = previewItems.filter((item) => !item.duplicate);
    for (const item of filteredItems) {
      await addDoc(collection(db, "irrigationItems"), item);
    }
    setPreviewItems([]);
    setShowPreviewPanel(false);
  };

  const showPreview = (items) => {
    setPreviewItems(items);
    setShowPreviewPanel(true);
  };

  if (!isLoaded || loadingUser) return <div>Loading Map...</div>;
  if (!user) return <Login onLogin={() => setLoadingUser(true)} />;
  if (!userProfile?.propertyId && user) return <CreateProperty onComplete={() => setLoadingUser(true)} />;
  if (!userProfile) return <div>Loading user profile...</div>;


  const currentIssues = items.filter(item => item.status === "issue" && item.issue);

  return (
    <>
      <ControlBar
        mapItems={items}
        setSelectedItem={setSelectedItem}
        setMapZoom={(zoom) => mapRef.current.setZoom(zoom)}
        setMapCenter={(pos) => mapRef.current.panTo(pos)}
        onAddObject={() => setShowAddObjectForm(true)}
        onManageAreas={() => setShowManageAreas(true)}
        onShowIssuesPanel={() => setShowIssuesPanel(true)}
        onLogout={() => signOut(auth)}
        onShowInventoryPanel={() => setShowInventoryPanel(true)}
        onShowAccountPanel={() => setShowAccountPanel(true)}
      />

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
          areas={areas}
          setShowAddObjectForm={setShowAddObjectForm}
        />
      )}

      {showManageAreas && (
        <ManageAreas
          holes={holes}
          areas={areas}
          setShowManageAreas={setShowManageAreas}
        />
      )}

      {showIssuesPanel && (
        <IssuesPanel
          issues={currentIssues}
          onFocusItem={handleFocusItem}
          onClose={() => setShowIssuesPanel(false)}
        />
      )}

      {showAccountPanel && (
       <div className="fixed inset-0 z-50 bg-black bg-opacity-40">
         <AccountPanel onClose={() => setShowAccountPanel(false)} />
       </div>
      )}


      <MapComponent
        center={center}
        containerStyle={containerStyle}
        onMapClick={handleMapClick}
        mapRef={mapRef}
        onLoad={(map) => (mapRef.current = map)}
        onZoomChanged={() => {
          if (mapRef.current) {
            setMapZoom(mapRef.current.getZoom());
          }
        }}
      >
        {showInventoryPanel && (
          <HeadInventory
            holes={holes}
            areas={areas}
            onClose={() => setShowInventoryPanel(false)}
            mapRef={mapRef}
            setSelectedItem={setSelectedItem}
            showPreview={showPreview}
          />
        )}
        
        <MapItems
          items={items}
          mapZoom={mapZoom}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          getShapeIcon={getShapeIcon}
          setLogs={setLogs}
          toggleStatus={toggleStatus}
          confirmAndDelete={confirmAndDelete}
          handleViewHistory={handleViewHistory}
          handleAddLog={handleAddLog}
          logs={logs}
          logDate={logDate}
          setLogDate={setLogDate}
          logNotes={logNotes}
          setLogNotes={setLogNotes}
          logImage={logImage}
          setLogImage={setLogImage}
          uploading={uploading}
        />
      </MapComponent>

      {showPreviewPanel && (
        <div style={{ position: "fixed", top: 100, left: 60, zIndex: 99999 }}>
          <PreviewPanel
            previewItems={previewItems}
            onClose={() => setShowPreviewPanel(false)}
            onConfirm={handleConfirmPreview}
          />
        </div>
      )}
    </>
  );
}

export default App;
