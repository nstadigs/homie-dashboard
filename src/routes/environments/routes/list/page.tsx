// @deno-types="@types/react"
import * as React from "react";

import {
  Button,
  Center,
  Grid,
  Heading,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  EnvironmentConfig,
  useEnvironmentConfigs,
  remove,
} from "../../../../state/environmentConfigs.ts";
import { MdOutlineHub } from "react-icons/md";
import { Link } from "react-router";
import { motion } from "motion/react";
import { DataListRoot, DataListItem } from "#/components/ui/data-list.tsx";
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "#/components/ui/popover.tsx";

export function EnvironmentsListPage() {
  const environments = useEnvironmentConfigs();

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(320px, 1fr))" gap="5">
      {environments.map((environment) => (
        <EnvironmentCard key={environment.id} {...environment} />
      ))}
      <LinkBox borderWidth="1px" p="5" rounded="md" display="flex">
        <Center flex="1">
          <Stack align="center" gap="5">
            <MdOutlineHub size="46" />
            <Button size="xl" variant="outline" asChild>
              <LinkOverlay asChild>
                <Link to="/new">Add Environment</Link>
              </LinkOverlay>
            </Button>
          </Stack>
        </Center>
      </LinkBox>
    </Grid>
  );
}

function EnvironmentCard({
  name,
  id,
  broker_url,
  username,
  homie_namespace,
}: EnvironmentConfig) {
  return (
    <LinkBox
      flexGrow="1"
      flexShrink="0"
      flexBasis="320px"
      borderWidth="1px"
      p="5"
      backgroundColor="bg.muted"
      rounded="md"
    >
      <Heading size="lg" mb="2">
        <LinkOverlay asChild>
          <Link to={`/env/${id}`}>
            <motion.div layout="position" layoutId={`name-${id}`}>
              {name}
            </motion.div>
          </Link>
        </LinkOverlay>
      </Heading>
      <DataListRoot>
        <DataListItem
          label="Broker URL"
          value={<motion.div layoutId={`url-${id}`}>{broker_url}</motion.div>}
        />
        <DataListItem
          label="Username"
          value={
            <motion.div layoutId={`username-${id}`}>{username}</motion.div>
          }
        />
        <DataListItem
          label="Homie namespace"
          value={
            <motion.div layoutId={`namespace-${id}`}>
              {homie_namespace}
            </motion.div>
          }
        />
      </DataListRoot>
      <Stack direction="row" mt="4">
        <Button size="sm" ml="auto" variant="outline" asChild>
          <Link to={`/edit/${id}`}>Edit</Link>
        </Button>
        <DeleteButton
          onDelete={() => {
            remove(id);
          }}
        />
      </Stack>
    </LinkBox>
  );
}

function DeleteButton({ onDelete }: { onDelete: VoidFunction }) {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverRoot open={open} onOpenChange={(event) => setOpen(event.open)}>
      <PopoverTrigger asChild>
        <Button size="sm" colorPalette="red" variant="subtle">
          Delete
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <PopoverTitle fontWeight="medium">Delete environment?</PopoverTitle>
          <Text my="4">This can not be undone!</Text>
          <Stack direction="row" gap="2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              ml="auto"
              colorPalette="red"
              variant="subtle"
              onClick={() => {
                onDelete();
              }}
            >
              Yes, Delete!
            </Button>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
}
