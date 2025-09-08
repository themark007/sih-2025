import { useState } from 'react'
import './App.css'
import LandingPage from '../Pages/LandingPage'
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Signup from '../Pages/Signup';
import Login from '../Pages/Login';
import ProfileSetup from './details/ProfileSetup';
import NotFound from '../Pages/NotFound';
import ProtectedRoute from './ProtectedRoutes';



function App() {
  
  

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
        
        <Route path="/details" element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } />



            <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
    </>
  )
}

export default App
