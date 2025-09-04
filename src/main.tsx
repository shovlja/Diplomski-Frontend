import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./features/auth/AuthContext";
import { BrowserRouter } from "react-router-dom";
import App from "./App"; // ili tvoj Router root
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
