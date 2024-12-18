import { Box, Group, Stack, Text } from "@chakra-ui/react";
import { Property as TProperty } from "#/lib/Store.ts";
import { Button } from "#/components/ui/button.tsx";
import { ProgressBar, ProgressRoot } from "#/components/ui/progress.tsx";

export function Property({
  property,
  onSet,
}: {
  property: TProperty;
  onSet: (value: string) => void;
}) {
  if (property.datatype === "enum") {
    if (!property.settable && !property.retained) {
      return <UnretainedUnsettableEnumProperty value={property.value} />;
    }

    if (!property.settable && property.retained) {
      return <Box>{property.value}</Box>;
    }

    if (property.settable && !property.retained) {
      return (
        <UnretainedSettableEnumProperty
          onSet={onSet}
          format={property.format}
        />
      );
    }
  }

  if (
    property.datatype === "integer" &&
    property.retained &&
    !property.settable
  ) {
    return (
      <RetainedUnsettableIntegerProperty
        format={property.format}
        value={property.value?.toString()}
      />
    );
  }

  return null;
}

function UnretainedUnsettableEnumProperty({ value }: { value?: string }) {
  return <Text>{value}</Text>;
}

function UnretainedSettableEnumProperty({
  format,
  onSet,
}: {
  format: string;
  onSet: (value: string) => void;
}) {
  const options = format.split(",").map((option) => option.trim());

  return (
    <Stack>
      <Group attached>
        {options.map((option) => (
          <Button
            key={option}
            size="sm"
            variant="outline"
            onClick={() => onSet(option)}
          >
            {option}
          </Button>
        ))}
      </Group>
    </Stack>
  );
}

function RetainedUnsettableIntegerProperty({
  value,
  format,
}: {
  value?: string;
  format?: string;
}) {
  let numberValue = parseInt(value ?? "0", 10);

  if (isNaN(numberValue)) {
    numberValue = 0;
  }

  const [min, max] = (format ?? "")
    .split(":")
    .map((value) => parseInt(value, 10));

  return (
    <ProgressRoot value={numberValue} min={min} max={max}>
      <ProgressBar />
    </ProgressRoot>
  );
}
