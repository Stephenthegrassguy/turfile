// src/hooks/useIrrigationItems.js
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export function useIrrigationItems(propertyId) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!propertyId) return;

    const q = query(
      collection(db, "irrigationItems"),
      where("propertyId", "==", propertyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(docs);
    });

    return () => unsubscribe(); // Clean up on unmount
  }, [propertyId]);

  return items;
}
