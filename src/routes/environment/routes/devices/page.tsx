import { Stack } from "@chakra-ui/react";
import { Header } from "./components/Header.tsx";
import {
  DeviceList,
  DeviceListItem,
} from "#/routes/environment/components/DeviceList.tsx";
import { useDevice, useDevices } from "#/lib/EnvironmentContext.tsx";

export function DevicesPage() {
  return (
    <Stack gap="10">
      <Header />
      <Stack px="5">
        <AllDevicesList />
      </Stack>
    </Stack>
  );
}

function AllDevicesList() {
  const devices = useDevices();

  return (
    <DeviceList>
      {[...(devices ?? [])].map(([deviceId, device]) => (
        <DeviceListItemWithData deviceId={deviceId} key={deviceId} />
      ))}
    </DeviceList>
  );
}

function DeviceListItemWithData({ deviceId }: { deviceId: string }) {
  const { device } = useDevice(deviceId);

  if (!device) {
    return null;
  }

  return <DeviceListItem deviceId={deviceId} device={device} />;
}
