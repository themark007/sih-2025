// src/App.jsx
import React from "react";
import "./App.css";
import LandingPage from "../Pages/LandingPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "../Pages/Signup";
import Login from "../Pages/Login";
import ProfileSetup from "./details/ProfileSetup";
import NotFound from "../Pages/NotFound";
import ProtectedRoute from "./ProtectedRoutes";
import Dashboard from "../Pages/Dashboard";
import GetVDisease from "../Pages/GetVDisease";
import CropChatFrontend from "../Pages/CropChatFrontend";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Use GetVDisease as its own route */}
        <Route
          path="/getvdisease"
          element={<GetVDisease apiUrl="http://localhost:4000/predict" topK={5} />}
        />

       <Route path="chat" element={<CropChatFrontend />} />
        <Route
          path="/details"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
