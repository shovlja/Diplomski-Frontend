import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./features/auth/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { setAuthHeader } from "@/lib/http";
import App from "./App"; // ili tvoj Router root
import "./index.css";

const TOKEN_KEY = "pmhub_token";
const bootToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
setAuthHeader(bootToken);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
