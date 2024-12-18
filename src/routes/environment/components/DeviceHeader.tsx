import { Stack, Heading, VisuallyHidden } from "@chakra-ui/react";
import { motion } from "motion/react";
import { useDevice } from "#/lib/EnvironmentContext.tsx";
import { Device } from "#/lib/Store.ts";
import { Tooltip } from "#/components/ui/tooltip.tsx";
import { Status } from "#/components/ui/status.tsx";
import { Link } from "#/components/link.tsx";
import { useParams } from "react-router";

export function DeviceHeader({
  deviceId,
  device,
}: {
  deviceId: string;
  device: Device;
}) {
  const { environmentId } = useParams();

  return (
    <Stack gap={0} asChild>
      <motion.div layout="position" layoutId={`name-${deviceId}`}>
        {device.parent && (
          <Link to={`/env/${environmentId}/device/${device.parent}`}>
            <Heading size="sm" fontWeight="normal" color="fg.muted">
              <ParentDeviceName deviceId={device.parent} />
            </Heading>
          </Link>
        )}
        <Stack direction="row">
          <Link to={`/env/${environmentId}/device/${deviceId}`}>
            <Heading size="md">{device.name ?? deviceId}</Heading>
          </Link>
          <DeviceState state={device?.state} />
        </Stack>
      </motion.div>
    </Stack>
  );
}

function ParentDeviceName({ deviceId }: { deviceId: string }) {
  const { device } = useDevice(deviceId);
  return device?.name ?? deviceId;
}

function DeviceState({ state }: { state?: Device["state"] }) {
  const [color, text] = {
    ready: ["green", "Ready"],
    init: ["yellow", "Initializing"],
    lost: ["red", "Lost"],
    sleeping: ["blue", "Sleeping"],
    disconnected: ["gray", "Disconnected"],
    unknown: ["gray", "Unknown"],
  }[state ?? "unknown"];

  return (
    <Tooltip content={text} contentProps={{ css: { "--tooltip-bg": color } }}>
      <Status tabIndex={0} colorPalette={color}>
        <VisuallyHidden>{text}</VisuallyHidden>
      </Status>
    </Tooltip>
  );
}
