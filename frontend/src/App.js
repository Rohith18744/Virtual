import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import LandingPage from "./components/LandingPage";
import TryOnApp from "./components/TryOnApp";
import Gallery from "./components/Gallery";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tryon" element={<TryOnApp />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1b4b',
              color: '#e2e8f0',
              border: '1px solid #4c1d95',
            },
          }}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;