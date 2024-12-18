import { Route, Routes, useParams } from "react-router";
import { EnvironmentProvider } from "#/lib/EnvironmentContext.tsx";
import { DevicesPage } from "#/routes/environment/routes/devices/page.tsx";
import { DevicePage } from "#/routes/environment/routes/device/page.tsx";

export function EnvironmentPage() {
  const { environmentId } = useParams();

  if (environmentId == null) {
    throw new Error("Environment ID is required");
  }

  return (
    <EnvironmentProvider key={environmentId} environmentId={environmentId}>
      <Routes>
        <Route path="" element={<DevicesPage />} />
        <Route path="device/:deviceId/*" element={<DevicePage />} />
      </Routes>
    </EnvironmentProvider>
  );
}
