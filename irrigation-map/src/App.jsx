// src/App.jsx
import React, { useState, useRef } from "react";
import "./App.css";
import { useJsApiLoader } from "@react-google-maps/api";
import { signOut } from "firebase/auth";
import {
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  collection,
  doc,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

import { useAuthUser } from "./hooks/useAuthUser";
import { usePropertyData } from "./hooks/usePropertyData";
import { useIrrigationItems } from "./hooks/useIrrigationItems";
import { useHolesAndAreas } from "./hooks/useHolesAndAreas";
import { getShapeIcon } from "./utils/mapIcons";

import Login from "./Login";
import CreateProperty from "./components/CreateProperty";
import MapComponent from "./components/MapComponent";
import MapItems from "./components/MapItems";
import PlacementManagement from "./components/PlacementManagement";
import ManageAreas from "./components/ManageAreas";
import ControlBar from "./components/ControlBar";
import IssuesPanel from "./components/IssuesPanel";
import HeadInventory from "./components/HeadInventory";
import PreviewPanel from "./components/PreviewPanel";
import { auth, db, storage } from "./firebase";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const DEFAULT_CENTER = { lat: 49.214167, lng: -123.161944 };

export default function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const { user, userProfile, loadingUser } = useAuthUser();
  const propertyData = usePropertyData(userProfile?.propertyId);
  const items = useIrrigationItems(userProfile?.propertyId);
  const { holes, areas } = useHolesAndAreas();

  const [placingType, setPlacingType] = useState(null);
  const [itemName, setItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const [showAddObjectForm, setShowAddObjectForm] = useState(false);
  const [showManageAreas, setShowManageAreas] = useState(false);
  const [selectedHole, setSelectedHole] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [showIssuesPanel, setShowIssuesPanel] = useState(false);
  const [showInventoryPanel, setShowInventoryPanel] = useState(false);

  const [logDate, setLogDate] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logImage, setLogImage] = useState([]);
  const [logs, setLogs] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [mapZoom, setMapZoom] = useState(18);
  const [previewItems, setPreviewItems] = useState([]);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);

  const mapRef = useRef(null);
  const center = propertyData?.location || DEFAULT_CENTER;

  // --- Handlers --------------------------------------------------------------

  const handleMapClick = async (e) => {
    if (!placingType || !itemName) return;
    const newItem = {
      type: placingType,
      name: itemName,
      hole: selectedHole,     // ✅ NOT selectedItem.hole
      area: selectedArea,     // ✅ NOT selectedItem.area
      position: { lat: e.latLng.lat(), lng: e.latLng.lng() },
      status: "working",
      createdAt: new Date(),
      propertyId: userProfile.propertyId,
    };
    
    await addDoc(collection(db, "irrigationItems"), newItem);
    setShowAddObjectForm(false);
    setPlacingType(null);
    setItemName("");
  };

  const handleAddLog = async () => {
    if (!selectedItem || !logDate || !logNotes) return;
    setUploading(true);
    let imageUrls = [];
    try {
      if (logImage.length) {
        const uploads = logImage.map((file) => {
          const refPath = storageRef(
            storage,
            `logs/${selectedItem.id}/${Date.now()}_${file.name}`
          );
          return uploadBytes(refPath, file).then(() => getDownloadURL(refPath));
        });
        imageUrls = await Promise.all(uploads);
      }
      const logRef = collection(db, `irrigationItems/${selectedItem.id}/logs`);
      await addDoc(logRef, {
        date: logDate,
        notes: logNotes,
        imageUrls,
        createdAt: new Date(),
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
    if (!selectedItem) return;
    const snap = await getDocs(
      collection(db, `irrigationItems/${selectedItem.id}/logs`)
    );
    const allLogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setLogs(
      allLogs.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
    );
  };

  const confirmAndDelete = async () => {
    if (!selectedItem) return;
    if (
      window.confirm(
        "Delete this item and all its logs? This cannot be undone."
      )
    ) {
      await deleteDoc(doc(db, "irrigationItems", selectedItem.id));
      setSelectedItem(null);
    }
  };

  const toggleStatus = async () => {
    const newStatus = selectedItem.status === "working" ? "issue" : "working";
    await updateDoc(doc(db, "irrigationItems", selectedItem.id), {
      status: newStatus,
    });
    setSelectedItem((prev) => ({ ...prev, status: newStatus }));
  };

  const handleFocusItem = (item) => {
    if (!mapRef.current || !item) return;
    mapRef.current.panTo(item.position);
    mapRef.current.setZoom(20);
    setSelectedItem(item);
  };

  const handleConfirmPreview = async () => {
    const itemsToSave = previewItems.filter((i) => !i.duplicate);
  
    for (const item of itemsToSave) {
      await addDoc(collection(db, "irrigationItems"), {
        ...item,
        propertyId: userProfile.propertyId, // ✅ Makes it visible to the logged-in user
        status: "working",                  // ✅ Ensures MapItems includes it
      });
    }
  
    setPreviewItems([]);
    setShowPreviewPanel(false);
  };
  
  
  

  const showPreview = (items) => {
    setPreviewItems(items);
    setShowPreviewPanel(true);
  };

  // --- Render guards ---------------------------------------------------------

  if (loadingUser || !isLoaded) return <div>Loading Map...</div>;
  if (!user) return <Login onLogin={() => {}} />;
  if (user && !userProfile?.propertyId)
    return <CreateProperty onComplete={() => {}} />;
  if (!userProfile) return <div>Loading profile...</div>;

  const currentIssues = items.filter((i) => i.status === "issue" && i.issue);

  // --- JSX -------------------------------------------------------------------

  return (
    <>
      <ControlBar
        mapItems={items}
        setSelectedItem={setSelectedItem}
        setMapZoom={(z) => mapRef.current.setZoom(z)}
        setMapCenter={(p) => mapRef.current.panTo(p)}
        onAddObject={() => setShowAddObjectForm(true)}
        onManageAreas={() => setShowManageAreas(true)}
        onShowIssuesPanel={() => setShowIssuesPanel(true)}
        onLogout={() => signOut(auth)}
        onShowInventoryPanel={() => setShowInventoryPanel(true)}
      />

      {showAddObjectForm && (
        <PlacementManagement
        placingType={placingType}
        setPlacingType={setPlacingType}
        itemName={itemName}
        setItemName={setItemName}
        holes={holes}
        selectedHole={selectedHole}               // ✅ This was missing!
        setSelectedHole={setSelectedHole}
        selectedArea={selectedArea}               // ✅ Also missing!
        setSelectedArea={setSelectedArea}
        areas={areas}
        setShowAddObjectForm={setShowAddObjectForm}
      />
      
      )}

      {showManageAreas && (
        <ManageAreas
          holes={holes}
          areas={areas}
          onClose={() => setShowManageAreas(false)}
        />
      )}

      {showIssuesPanel && (
        <IssuesPanel
          issues={currentIssues}
          onFocusItem={handleFocusItem}
          onClose={() => setShowIssuesPanel(false)}
        />
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
