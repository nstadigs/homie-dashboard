// @ts-types="@types/react-dom/client"
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
