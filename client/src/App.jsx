import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MyScans from "./pages/MyScans";
import Navbar from "./pages/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./pages/ProtectedRoute";
import Reports from "./pages/Reports";
import Dashboard from "./pages/Dashboard";
import Footer from "./pages/Footer";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/"       element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/my-scans"  element={<ProtectedRoute><MyScans /></ProtectedRoute>} />
          <Route path="/reports"   element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
