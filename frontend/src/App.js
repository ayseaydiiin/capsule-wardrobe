import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import Closet from './components/Closet';
import AddItem from './components/AddItem';
import Navbar from './components/Navbar';
import OutfitCanvas from './components/OutfitCanvas';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Messaging from './components/Messaging';
import Feed from './components/Feed';
import Friends from './components/Friends';
import FloatingMessenger from './components/FloatingMessenger';

function App() {
  return (
    <AuthProvider>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <Routes>
            {/* Giriş Yap ve Kayıt Ol sayfaları */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Korumalı Rotalar */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-off-white">
                    <Navbar />
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-off-white">
                    <Navbar />
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/closet"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-off-white">
                    <Navbar />
                    <Closet />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-off-white">
                    <Navbar />
                    <AddItem />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/canvas"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-off-white">
                    <Navbar />
                    <OutfitCanvas />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-off-white">
                    <Navbar />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <Feed />
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-off-white">
                    <Navbar />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <Messaging />
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-off-white">
                    <Navbar />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <Friends />
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Tanımlanmayan rotalar login'e yönlendir */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <FloatingMessenger />
        </Router>
      </DndProvider>
    </AuthProvider>
  );
}

export default App;
