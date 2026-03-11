import "bootstrap/dist/css/bootstrap.css";
import App from "./App.tsx";

import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./AuthContext";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
    ,
  </BrowserRouter>,
);
