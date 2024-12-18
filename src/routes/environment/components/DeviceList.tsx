import { type Device } from "#/lib/Store.ts";
import { SimpleGrid, GridItem, Stack } from "@chakra-ui/react";
import {
  StatRoot,
  StatValueText,
  StatValueUnit,
} from "#/components/ui/stat.tsx";

import { DeviceHeader } from "./DeviceHeader.tsx";
import { Link } from "#/components/link.tsx";

export function DeviceList({ children }: { children: React.ReactNode }) {
  return <Stack gap={0}>{children}</Stack>;
}

export function DeviceListItem({
  deviceId,
  device,
}: {
  deviceId: string;
  device: Device;
}) {
  return (
    <SimpleGrid
      columns={4}
      py="4"
      direction="row"
      alignItems="center"
      borderBottomWidth="1px"
    >
      <GridItem colSpan={2}>
        <DeviceHeader deviceId={deviceId} device={device} />
      </GridItem>
      <StatRoot asChild>
        <Link to={`/device/${deviceId}`}>
          <StatValueText alignItems="baseline">
            {device?.children?.length ?? "0"}
            <StatValueUnit>children</StatValueUnit>
          </StatValueText>
        </Link>
      </StatRoot>
      <StatRoot>
        <StatValueText alignItems="baseline">
          {device.nodes
            .values()
            .reduce((acc, node) => acc + node.properties.size, 0)}
          <StatValueUnit>properties in </StatValueUnit>
          {device.nodes.size}
          <StatValueUnit>Nodes</StatValueUnit>
        </StatValueText>
      </StatRoot>
    </SimpleGrid>
  );
}
