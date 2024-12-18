// @deno-types="@types/react"
import * as React from "react";
import { Button, Fieldset, Input, Stack } from "@chakra-ui/react";
import { Field } from "#/components/ui/field.tsx";
import {
  EnvironmentConfig,
  EnvironmentConfigSchema,
} from "../../../state/environmentConfigs.ts";

export type EnvironmentFormProps = {
  defaultValues?: Partial<EnvironmentConfig>;
  legend?: string;
  onSubmit: (
    data: Partial<EnvironmentConfig>
  ) => ReturnType<typeof EnvironmentConfigSchema.safeParse> | null;
};

export function EnvironmentForm({
  defaultValues = {},
  legend,
  onSubmit,
}: EnvironmentFormProps) {
  const [result, formAction] = React.useActionState<ReturnType<
    typeof EnvironmentConfigSchema.safeParse
  > | null>((_prev, formData: FormData) => {
    const environmentData = formDataToObject(formData);
    return onSubmit(environmentData);
  }, null);

  return (
    <form action={formAction}>
      <Fieldset.Root size="lg" maxW="md">
        <Stack>
          {legend && <Fieldset.Legend>{legend}</Fieldset.Legend>}
          <Fieldset.HelperText>
            Insert your environment details below. If your MQTT broker accept
            JWT authentication, you can enter the token as either username or
            password, depending on your broker is configured.
          </Fieldset.HelperText>
        </Stack>

        <Fieldset.Content>
          <Field label="Name" helperText="Alias for this environment">
            <Input
              name="name"
              defaultValue={defaultValues.name}
              placeholder="My homie devices"
            />
          </Field>

          <Field
            label="Broker Url *"
            helperText="For the mqtt websocket connection"
          >
            <Input
              required
              name="broker_url"
              defaultValue={defaultValues.broker_url}
              placeholder="ws://localhost:8083"
            />
          </Field>

          <Field label="Username">
            <Input name="username" defaultValue={defaultValues.username} />
          </Field>

          <Field label="Password">
            <Input
              name="password"
              defaultValue={defaultValues.password}
              type="password"
            />
          </Field>

          <Field
            label="Homie namespace"
            helperText="Leave blank for all namespaces (wildcard +)"
          >
            <Input
              name="homie_namespace"
              defaultValue={defaultValues.homie_namespace}
              placeholder="+"
            />
          </Field>
          <Fieldset.HelperText>* Required fields</Fieldset.HelperText>
        </Fieldset.Content>

        <Stack direction="row">
          <Button type="submit" alignSelf="flex-start">
            Submit
          </Button>
        </Stack>
      </Fieldset.Root>
    </form>
  );
}

function formDataToObject(formData: FormData) {
  const normalizeValues = (values: FormDataEntryValue[]) =>
    values.length > 1 ? [...values] : values[0];

  const formElemKeys = Array.from(formData.keys());

  return Object.fromEntries(
    // store array of values or single value for element key
    formElemKeys.map((key) => [key, normalizeValues(formData.getAll(key))])
  );
}
