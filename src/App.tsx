import { Routes, Route } from "react-router";
import { EnvironmentsPage } from "./routes/environments/page.tsx";
import { EnvironmentPage } from "./routes/environment/page.tsx";

function App() {
  return (
    <Routes>
      <Route path="/env/:environmentId/*" element={<EnvironmentPage />} />
      <Route path="*" element={<EnvironmentsPage />} />
    </Routes>
  );
}

export default App;
