import React from "react"
import ReactDOM from "react-dom/client"
import "leaflet/dist/leaflet.css"
import App from "./App"
import "./index.css"
import "./styles/location-picker.css"
import { CartProvider } from "./context/CartContext"
import { AuthProvider } from "./context/AuthContext"
import { GoogleOAuthProvider } from "@react-oauth/google"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <AuthProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <CartProvider>
          <App />
        </CartProvider>
      </GoogleOAuthProvider>
    </AuthProvider>

  </React.StrictMode>
)
