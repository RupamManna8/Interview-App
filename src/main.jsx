import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App.jsx';
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
// import LoginSignup from "./Pages/Auth/Login";
import { UserProvider } from "./Context/UserContext";









//  import App from './App.jsx';

const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId={id}>
      <UserProvider>
        <App/>
      </UserProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
