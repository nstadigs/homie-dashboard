import { Store } from "./Store.ts";
import { assertStrictEquals, assert } from "jsr:@std/assert";

Deno.test("Event generating node changes", () => {
  const store = new Store();

  store.updateFromHomieEvent({
    type: "HOMIE_5_DEVICE_DESCRIPTION",
    deviceId: "test-device",
    value: {
      homie: "5.0",
      version: 1,
      name: "Test Device",
      nodes: {
        "test-node": {
          properties: {},
        },

        "test-node-2": {
          properties: {},
        },
      },
    },
  });

  const devicesBefore = store.devices;

  store.updateFromHomieEvent({
    type: "HOMIE_5_DEVICE_DESCRIPTION",
    deviceId: "test-device",
    value: {
      homie: "5.0",
      version: 1,
      name: "Test Device",
      nodes: {
        "test-node": {
          name: "New name",
          properties: {},
        },

        "test-node-2": {
          properties: {},
        },
      },
    },
  });

  assert(devicesBefore !== store.devices);
  const oldTestDevice = devicesBefore.get("test-device");
  const newTestDevice = store.devices.get("test-device");
  assert(oldTestDevice !== newTestDevice);

  const oldTestNode = oldTestDevice?.nodes.get("test-node");
  const newTestNode = newTestDevice?.nodes.get("test-node");
  assert(oldTestNode !== newTestNode);

  const oldTestNode2 = oldTestDevice?.nodes.get("test-node-2");
  const newTestNode2 = newTestDevice?.nodes.get("test-node-2");
  assert(oldTestNode2 === newTestNode2);
});

Deno.test("Event generating NO changes", () => {
  const store = new Store();

  store.updateFromHomieEvent({
    type: "HOMIE_5_DEVICE_DESCRIPTION",
    deviceId: "test-device",
    value: {
      homie: "5.0",
      version: 1,
      name: "Test Device",
      nodes: {
        "test-node": {
          properties: {},
        },
      },
    },
  });

  const devicesBefore = store.devices;

  store.updateFromHomieEvent({
    type: "HOMIE_5_DEVICE_DESCRIPTION",
    deviceId: "test-device",
    value: {
      homie: "5.0",
      version: 1,
      name: "Test Device",
      nodes: {
        "test-node": {
          properties: {},
        },
      },
    },
  });

  assertStrictEquals(devicesBefore, store.devices);
});
