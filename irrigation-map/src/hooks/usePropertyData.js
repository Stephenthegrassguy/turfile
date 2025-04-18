// src/hooks/usePropertyData.js
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function usePropertyData(propertyId) {
  const [propertyData, setPropertyData] = useState(null);

  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "properties", propertyId));
        if (snap.exists()) setPropertyData(snap.data());
        else console.warn("Property not found.");
      } catch (err) {
        console.error("Error fetching property:", err);
      }
    })();
  }, [propertyId]);

  return propertyData;
}
