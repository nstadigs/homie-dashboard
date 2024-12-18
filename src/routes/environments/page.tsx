import { Box, Stack, Heading, Text, Link } from "@chakra-ui/react";
import { Alert } from "#/components/ui/alert.tsx";
import { Route, Routes } from "react-router";
import { EnvironmentsListPage } from "./routes/list/page.tsx";
import { NewEnvironmentPage } from "./routes/new/page.tsx";
import { EditEnvironmentPage } from "#/routes/environments/routes/edit/page.tsx";
import { motion } from "motion/react";
import { ColorModeToggle } from "#/components/color-mode-toggle.tsx";

export function EnvironmentsPage() {
  return (
    <Stack p="5" gap="10">
      <Stack direction="row" align="center" gap="5">
        <Box asChild h="150px" w="150px">
          <motion.img
            layoutId="homie-logo"
            src="/public/logo.svg"
            alt="Homie"
          />
        </Box>
        <Stack asChild>
          <motion.div
            whileInView={{ opacity: 1 }}
            layout
            animate
            initial={{ opacity: 0 }}
          >
            <Heading size="2xl">Homie5 Dashboard</Heading>
            <Text>
              View and control the{" "}
              <Link href="https://homieiot.github.io/">Homie v5 devices</Link>{" "}
              in your network.
            </Text>
          </motion.div>
        </Stack>
        <Box ml="auto" alignSelf="flex-start">
          <ColorModeToggle />
        </Box>
      </Stack>
      <Stack>
        <Heading size="xl">Environments</Heading>
        <Routes>
          <Route path="/" element={<EnvironmentsListPage />} />
          <Route path="/new" element={<NewEnvironmentPage />} />
          <Route
            path="/edit/:environmentId/*"
            element={<EditEnvironmentPage />}
          />
        </Routes>
      </Stack>
      <Alert status="neutral" title="100% Local">
        This app is hosted on a static web server without a dedicated backend.
        Environments are stored in your browser's local storage. You connect
        directly to any MQTT broker accessible to your computer via websockets.
        You may use it to access an MQTT broker on your local network.
      </Alert>
    </Stack>
  );
}
