// @deno-types="@types/react"
import { StrictMode } from "react";
// @deno-types="@types/react-dom/client"
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
