import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar     from "./components/Navbar";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Dashboard  from "./pages/Dashboard";
import Profile    from "./pages/Profile";

export default function App() {
  const token = localStorage.getItem("token");
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login"    element={token ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
        <Route path="/"         element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile"  element={token ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
