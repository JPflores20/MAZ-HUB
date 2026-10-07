import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyB7RK02a6zRonJdXTaK3K4BJLxkJqZUF8Y",
  authDomain: "maz-pdca-hub.firebaseapp.com",
  projectId: "maz-pdca-hub",
  storageBucket: "maz-pdca-hub.appspot.com",
  messagingSenderId: "148809930773",
  appId: "1:148809930773:web:5317ba9173f47814a08082",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "pdcas"));
  const snap = await getDocs(q);
  
  const michelob = snap.docs.find(d => d.data().title?.includes("Michelob Ultra"));
  
  if (michelob) {
    const data = michelob.data();
    fs.writeFileSync("michelob-data.json", JSON.stringify({
      five_whys_tables: data.five_whys_tables,
      fiveWhysTables: data.fiveWhysTables,
      fiveWhys: data.fiveWhys,
      ishikawas: data.ishikawas,
      ishikawaCauses: data.ishikawaCauses,
      ishikawa_causes: data.ishikawa_causes
    }, null, 2));
    console.log("Found Michelob Ultra! Saved to michelob-data.json");
  } else {
    console.log("Not found by exact title. Just dumping the first 5 into a file.");
    const out = snap.docs.slice(0, 5).map(d => ({
      title: d.data().title,
      five_whys_tables: d.data().five_whys_tables,
      fiveWhysTables: d.data().fiveWhysTables,
      ishikawas: d.data().ishikawas,
      ishikawaCauses: d.data().ishikawaCauses,
      ishikawa_causes: d.data().ishikawa_causes
    }));
    fs.writeFileSync("michelob-data.json", JSON.stringify(out, null, 2));
  }
}

run().catch(console.error);
