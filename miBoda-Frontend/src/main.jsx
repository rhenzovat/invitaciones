import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// ROOT APP COMPONENT
import App from "./app/App";
// THIRD PARTY CSS
import 'react-perfect-scrollbar/dist/css/styles.css';
//icons fuentes
import "@mdi/font/css/materialdesignicons.css";

import 'bootstrap/dist/css/bootstrap.css';

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
