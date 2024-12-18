import {
  DeviceDescriptionEvent,
  DeviceStateEvent,
  HomieEvent,
  PropertyTargetEvent,
  PropertyValueEvent,
} from "#/lib/homie-event.ts";
import {
  StringProperty as StringPropertyDescription,
  FloatProperty as FloatPropertyDescription,
  IntegerProperty as IntegerPropertyDescription,
  EnumProperty as EnumPropertyDescription,
  ColorProperty as ColorPropertyDescription,
  BooleanProperty as BooleanPropertyDescription,
  DateTimeProperty as DateTimePropertyDescription,
  DurationProperty as DurationPropertyDescription,
  JSONProperty as JSONPropertyDescription,
  DeviceDescription,
  NodeAttributes,
} from "./homieTypes.ts";

import { produce, enableMapSet } from "immer";

enableMapSet();

type StringProperty = StringPropertyDescription & {
  value?: string;
  target?: string;
};

type FloatProperty = FloatPropertyDescription & {
  value?: number;
  target?: number;
};

type IntegerProperty = IntegerPropertyDescription & {
  value?: number;
  target?: number;
};

export type EnumProperty = EnumPropertyDescription & {
  value?: string;
  target?: string;
};

type ColorProperty = ColorPropertyDescription & {
  value?: string;
  target?: string;
};

type BooleanProperty = BooleanPropertyDescription & {
  value?: boolean;
  target?: boolean;
};

type DateTimeProperty = DateTimePropertyDescription & {
  value?: Date;
  target?: Date;
};

type DurationProperty = DurationPropertyDescription & {
  value?: string;
  target?: string;
};

type JSONProperty = JSONPropertyDescription & {
  value?: string;
  target?: string;
};

export type Property =
  | StringProperty
  | FloatProperty
  | IntegerProperty
  | EnumProperty
  | ColorProperty
  | BooleanProperty
  | DateTimeProperty
  | DurationProperty
  | JSONProperty;

export type Node = Pick<NodeAttributes, "name" | "type"> & {
  properties: Map<string, Property>;
};

export type Device = Pick<
  DeviceDescription,
  | "name"
  | "type"
  | "children"
  | "root"
  | "parent"
  | "extensions"
  | "homie"
  | "version"
> & {
  state: "init" | "ready" | "disconnected" | "sleeping" | "lost";
  errors: string[];
  nodes: Map<string, Node>;
  hasLoadedInitialDescription: boolean;
};

export class Store {
  devices: Map<string, Device> = new Map();

  updateFromHomieEvent(event: HomieEvent) {
    switch (event.type) {
      case "ERROR":
        break;
      case "DEVICE_STATE":
        this.#updateFromDeviceStateEvent(event);
        break;
      case "HOMIE_5_DEVICE_DESCRIPTION":
        this.#updateFromDeviceDescriptionEvent(event);
        break;
      case "PROPERTY_TARGET":
      case "PROPERTY_VALUE":
        this.#updateFromPropertyValueOrTargetEvent(event);
        break;
    }
  }

  #updateFromDeviceStateEvent(event: DeviceStateEvent) {
    this.devices = produce(this.devices, (draft) => {
      const draftDevice = draft.get(event.deviceId) ?? createBareDevice();

      if (event.value === "lost") {
        this.#recursivelySetStateToLost(draft, event.deviceId);
      } else {
        draftDevice.state = event.value;
      }

      draft.set(event.deviceId, draftDevice);
    });
  }

  #recursivelySetStateToLost(devices: Map<string, Device>, deviceId: string) {
    const device = devices.get(deviceId);

    if (device) {
      device.state = "lost";
      devices.set(deviceId, device);

      for (const [childId] of device.children ?? []) {
        this.#recursivelySetStateToLost(devices, childId);
      }
    }
  }

  #updateFromDeviceDescriptionEvent(event: DeviceDescriptionEvent) {
    this.devices = produce(this.devices, (draft) => {
      const draftDevice = draft.get(event.deviceId) ?? createBareDevice();

      draftDevice.name = event.value.name;
      draftDevice.type = event.value.type;
      draftDevice.children = event.value.children;
      draftDevice.root = event.value.root;
      draftDevice.parent = event.value.parent;
      draftDevice.extensions = event.value.extensions;
      draftDevice.homie = event.value.homie;
      draftDevice.version = event.value.version;
      draftDevice.hasLoadedInitialDescription = true;

      draftDevice.nodes ??= new Map();

      for (const [nodeId, nodeAttributes] of Object.entries(
        event.value.nodes ?? {}
      )) {
        const draftNode = draftDevice.nodes.get(nodeId) ?? createBareNode();

        draftNode.name = nodeAttributes.name;
        draftNode.type = nodeAttributes.type;
        draftNode.properties ??= new Map();

        for (const [propertyId, property] of Object.entries(
          nodeAttributes.properties
        )) {
          const draftProperty =
            draftNode.properties.get(propertyId) ?? createBareProperty();

          draftProperty.name = property.name;
          draftProperty.datatype = property.datatype;
          draftProperty.format = property.format;
          draftProperty.settable = property.settable;
          draftProperty.retained = property.retained;

          draftNode.properties.set(propertyId, draftProperty);
        }

        draftDevice.nodes.set(nodeId, draftNode);
      }

      draft.set(event.deviceId, draftDevice);
    });
  }

  #updateFromPropertyValueOrTargetEvent(
    event: PropertyTargetEvent | PropertyValueEvent
  ) {
    this.devices = produce(this.devices, (draft) => {
      const draftDevice = draft.get(event.deviceId) ?? createBareDevice();
      const draftNode = draftDevice.nodes.get(event.nodeId) ?? createBareNode();
      const draftProperty =
        draftNode.properties.get(event.propertyId) ?? createBareProperty();

      if (event.type === "PROPERTY_TARGET") {
        draftProperty.target = event.value;
      } else {
        draftProperty.value = event.value;
      }

      draftNode.properties.set(event.propertyId, draftProperty);
      draftDevice.nodes.set(event.nodeId, draftNode);
      draft.set(event.deviceId, draftDevice);

      return draft;
    });
  }

  // TODO
  restoreFromStorage() {}
  // TODO
  persistToStorage() {}
}

function createBareDevice(): Device {
  return {
    homie: "5.0",
    version: 0,
    name: "",
    type: "",
    children: [],
    root: "",
    state: "init",
    nodes: new Map(),
    errors: [],
    hasLoadedInitialDescription: false,
  };
}

function createBareNode(): Node {
  return {
    name: "",
    type: "",
    properties: new Map(),
  };
}

function createBareProperty(): Property {
  return {
    datatype: "boolean",
  };
}
