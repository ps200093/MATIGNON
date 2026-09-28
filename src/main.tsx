import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/pinyon-script/latin-400.css";
import "@fontsource/noto-sans-kr/korean-400.css";
import "@fontsource/noto-sans-kr/latin-400.css";
import App from "./App";
import MoulinRougeInvitation from "./MoulinRougeInvitation";
import "./styles.css";
import "./brand.css";
import "./cover.css";
import "./moulin-rouge.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {new URLSearchParams(window.location.search).get("v") === "moulin-rouge" ? (
      <MoulinRougeInvitation />
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
