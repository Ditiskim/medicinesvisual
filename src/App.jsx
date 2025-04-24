import React from "react";
import Graph from "./components/Graph";
//import atcCategories from "./data/atcCategories.js";

//function App() {
//  return (
//    <div className="w-full h-screen bg-white text-gray-800 font-questrial">
//      <h1 className="text-3xl font-bold text-center mt-6 text-[#004aad]">
//        Interactieve Geneesmiddelen Visualisatie
//      </h1>
//      <Graph atcCategories={atcCategories} />
//    </div>
//  );
//}

//export default App;

// src/App.jsx

//import React from 'react';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4 text-blue-700">Medicatie Visualisatie</h1>
      <Graph />
    </div>
  );
}

export default App;

