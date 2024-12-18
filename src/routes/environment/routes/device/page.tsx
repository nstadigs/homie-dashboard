import { Box, Heading, SimpleGrid, Stack } from "@chakra-ui/react";
import { useDevice } from "#/lib/EnvironmentContext.tsx";
import { useParams } from "react-router";
import { motion } from "motion/react";
import { DeviceHeader } from "#/routes/environment/components/DeviceHeader.tsx";
import {
  DeviceList,
  DeviceListItem,
} from "#/routes/environment/components/DeviceList.tsx";
import { EmptyState } from "#/components/ui/empty-state.tsx";
import { StatRoot, StatLabel, StatValueText } from "#/components/ui/stat.tsx";
import { NodeCard } from "./components/NodeCard.tsx";

export function DevicePage() {
  const { deviceId } = useParams();

  if (deviceId == null) {
    // TODO: We could probably throw here and use an error boundary
    throw new Error(
      "DevicePage was rendered outside of it's intended route pattern"
    );
  }

  const { device, setProperty } = useDevice(deviceId);

  if (!device) {
    // TODO: Make something prettier here maybe
    return <Box>Device not found</Box>;
  }

  return (
    <Stack gap="10" p="5">
      <Stack direction="row" align="center" colorPalette="black">
        <Box asChild h="50px" w="50px" mr="2">
          <motion.img
            layoutId="homie-logo"
            src="/logo.svg"
            alt="Homie Dashboard"
          />
        </Box>
        <DeviceHeader deviceId={deviceId as string} device={device} />
      </Stack>
      <Stack gap="5" direction="row">
        <StatRoot
          borderWidth="1px"
          borderRadius="md"
          p="4"
          backgroundColor="bg.muted"
        >
          <StatLabel>Root device</StatLabel>
          <StatValueText fontSize="md">
            {device.root == null ? (
              "No root"
            ) : (
              <DeviceName deviceId={device.root} />
            )}
          </StatValueText>
        </StatRoot>
        <StatRoot
          borderWidth="1px"
          borderRadius="md"
          p="4"
          backgroundColor="bg.muted"
        >
          <StatLabel>Parent device</StatLabel>
          <StatValueText fontSize="md">
            {device.parent == null ? (
              "No parent"
            ) : (
              <DeviceName deviceId={device.parent} />
            )}
          </StatValueText>
        </StatRoot>
        <StatRoot
          borderWidth="1px"
          borderRadius="md"
          p="4"
          backgroundColor="bg.muted"
        >
          <StatLabel>Extensions</StatLabel>
          <StatValueText fontSize="md">
            {device.extensions == null
              ? "No extensions"
              : device.extensions.join(", ")}
          </StatValueText>
        </StatRoot>
        <StatRoot
          borderWidth="1px"
          borderRadius="md"
          p="4"
          backgroundColor="bg.muted"
        >
          <StatLabel>Child devices</StatLabel>
          <StatValueText fontSize="md">
            {device.children?.length || "0"}
          </StatValueText>
        </StatRoot>
      </Stack>
      <Stack gap="5">
        <Heading size="lg">Nodes</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="5">
          {[...(device?.nodes ?? [])].map(([nodeId, node]) => (
            <NodeCard
              key={nodeId}
              nodeId={nodeId}
              node={node}
              onSet={(propertyId, value) => {
                setProperty(nodeId, propertyId, value);
              }}
            />
          ))}
        </SimpleGrid>
      </Stack>
      <Stack gap={0}>
        <Heading size="lg" borderBottomWidth="1px">
          Child devices
        </Heading>
        {device?.children?.length === 0 ? (
          <EmptyState title="No child devices">
            This device does not have any child devices
          </EmptyState>
        ) : (
          <DeviceList>
            {[...(device?.children ?? [])].map((deviceId) => (
              <ChildDeviceListItem key={deviceId} deviceId={deviceId} />
            ))}
          </DeviceList>
        )}
      </Stack>
    </Stack>
  );
}

function ChildDeviceListItem({ deviceId }: { deviceId: string }) {
  const { device } = useDevice(deviceId);

  if (!device) {
    return null;
  }

  return <DeviceListItem deviceId={deviceId} device={device} />;
}

function DeviceName({ deviceId }: { deviceId: string }) {
  const { device } = useDevice(deviceId);

  return device?.name ?? deviceId;
}
