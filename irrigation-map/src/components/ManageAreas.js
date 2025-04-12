import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const ManageAreas = ({ setShowManageAreas }) => {
  const [holes, setHoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [newArea, setNewArea] = useState("");
  const [newHole, setNewHole] = useState("");

  const areasCollection = collection(db, "areas");
  const holesCollection = collection(db, "holes");

  useEffect(() => {
    const unsubscribeAreas = onSnapshot(areasCollection, (snapshot) => {
      setAreas(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });

    const unsubscribeHoles = onSnapshot(holesCollection, (snapshot) => {
      setHoles(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });

    return () => {
      unsubscribeAreas();
      unsubscribeHoles();
    };
  }, []);

  const addArea = async () => {
    if (newArea && !areas.some(area => area.name === newArea)) {
      try {
        await addDoc(areasCollection, { name: newArea });
        setNewArea("");
      } catch (error) {
        alert("Error adding area: " + error.message);
      }
    }
  };

  const addHole = async () => {
    if (newHole && !holes.some(hole => hole.name === newHole)) {
      try {
        await addDoc(holesCollection, { name: newHole });
        setNewHole("");
      } catch (error) {
        alert("Error adding hole: " + error.message);
      }
    }
  };

  const deleteArea = async (id) => {
    try {
      await deleteDoc(doc(db, "areas", id));
    } catch (error) {
      alert("Error deleting area: " + error.message);
    }
  };

  const deleteHole = async (id) => {
    try {
      await deleteDoc(doc(db, "holes", id));
    } catch (error) {
      alert("Error deleting hole: " + error.message);
    }
  };

  return (
    <div style={{ position: "absolute", top: 60, left: 10, background: "white", padding: "10px", border: "1px solid gray", zIndex: 2 }}>
      <h2>Manage Areas and Holes</h2>

      <div>
        <h3>Area Types</h3>
        <input
          type="text"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
          placeholder="New area type"
        />
        <button onClick={addArea}>Add Area Type</button>
        <ul>
          {areas.map((area) => (
            <li key={area.id}>
              {area.name}{" "}
              <button onClick={() => deleteArea(area.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Hole Names</h3>
        <input
          type="text"
          value={newHole}
          onChange={(e) => setNewHole(e.target.value)}
          placeholder="New hole name"
        />
        <button onClick={addHole}>Add Hole</button>
        <ul>
          {holes.map((hole) => (
            <li key={hole.id}>
              {hole.name}{" "}
              <button onClick={() => deleteHole(hole.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => setShowManageAreas(false)}>Close</button>
    </div>
  );
};

export default ManageAreas;
