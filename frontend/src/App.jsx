
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";

import ProtectedRoute from "./context/ProtectedRoute";

function App() {
    return (
        <Routes>
            {/* Public pages */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected pages */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reports" element={<Reports />} />
            </Route>

            {/* Unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
