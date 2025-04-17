import React, { useState, useCallback } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
  marginTop: "1rem"
};

const defaultCenter = {
  lat: 49.214167,
  lng: -123.161944
};

const CreateProperty = ({ onComplete }) => {
  const [propertyName, setPropertyName] = useState("");
  const [marker, setMarker] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const onMapClick = useCallback((e) => {
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!propertyName.trim() || !marker) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      const propertyId = propertyName.toLowerCase().replace(/\s+/g, "-");

      // 1. Save property data
      await setDoc(doc(db, "properties", propertyId), {
        name: propertyName,
        createdBy: user.uid,
        members: [user.uid],
        location: marker
      });

      // 2. Update user profile
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "admin",
        propertyId
      });

      onComplete(); // triggers profile reload
    } catch (err) {
      setError("Error creating property: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Set Up Your Golf Course</h2>
      <form onSubmit={handleCreate}>
        <input
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
          placeholder="e.g. Marine Drive Golf Club"
          required
        />

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker || defaultCenter}
          zoom={marker ? 17 : 10}
          onClick={onMapClick}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>

        <br />
        <button type="submit" disabled={!marker || loading}>
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
};

export default CreateProperty;
