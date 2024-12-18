import { Status } from "#/components/ui/status.tsx";
import { Box, Heading, Stack } from "@chakra-ui/react";
import { motion } from "motion/react";
import {
  useEnvironment,
  useConnectionState,
} from "#/lib/EnvironmentContext.tsx";

export function Header() {
  const environment = useEnvironment();
  const connectionState = useConnectionState();

  return (
    <Stack direction="row" p="5" align="center" colorPalette="black">
      <Box asChild h="50px" w="50px" mr="2">
        <motion.img
          layoutId="homie-logo"
          src="/logo.svg"
          alt="Homie Dashboard"
        />
      </Box>
      <Heading>
        <motion.div layout="position" layoutId={`name-${environment.id}`}>
          {environment?.name}
        </motion.div>
      </Heading>
      {connectionState === "connecting" && <Status value="info" />}
      {connectionState === "connected" && <Status value="success" />}
      {connectionState === "disconnected" && <Status value="error" />}
      {connectionState === "reconnecting" && <Status value="warning" />}
    </Stack>
  );
}
