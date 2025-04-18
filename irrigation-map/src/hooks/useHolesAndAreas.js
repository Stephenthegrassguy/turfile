// src/hooks/useHolesAndAreas.js
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export function useHolesAndAreas() {
  const [holes, setHoles] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const unsubH = onSnapshot(collection(db, "holes"), (snap) =>
      setHoles(snap.docs.map((d) => d.data().name))
    );
    const unsubA = onSnapshot(collection(db, "areas"), (snap) =>
      setAreas(snap.docs.map((d) => d.data().name))
    );
    return () => {
      unsubH();
      unsubA();
    };
  }, []);

  return { holes, areas };
}
