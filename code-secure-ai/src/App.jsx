import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/Auth/LoginPage";
import RegisterPage from "./components/Auth/LoginPage";
import ApiPage from "./components/ApiPage/ApiPage";
import ProtectedRoute from "./Validation/ProtectingRoute";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <ApiPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
