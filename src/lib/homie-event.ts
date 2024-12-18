import { DeviceDescription, DeviceState } from "#/lib/homieTypes.ts";

export type DeviceStateEvent = {
  type: "DEVICE_STATE";
  deviceId: string;
  value: DeviceState;
};

export type DeviceDescriptionEvent = {
  type: "HOMIE_5_DEVICE_DESCRIPTION";
  deviceId: string;
  value: DeviceDescription;
};

export type PropertySetEvent = {
  type: "PROPERTY_SET";
  deviceId: string;
  nodeId: string;
  propertyId: string;
  value: string;
};

export type PropertyTargetEvent = {
  type: "PROPERTY_TARGET";
  deviceId: string;
  nodeId: string;
  propertyId: string;
  value: string;
};

export type PropertyValueEvent = {
  type: "PROPERTY_VALUE";
  deviceId: string;
  nodeId: string;
  propertyId: string;
  value: string;
};

export type HomieErrorEvent = {
  type: "ERROR";
  message: string;
};

export type HomieEvent =
  | DeviceStateEvent
  | DeviceDescriptionEvent
  | PropertySetEvent
  | PropertyTargetEvent
  | PropertyValueEvent
  | HomieErrorEvent;

const validDeviceStates = ["init", "ready", "disconnected", "sleeping", "lost"];

export function parseMqttEvent(
  topic: string,
  payload: Uint8Array
): HomieEvent | null {
  const [
    _homieRoot,
    _homieVersion,
    deviceId,
    nodeIdOrAttr,
    propertyId,
    setOrTarget,
  ] = topic.split("/");

  const message = payload.toString();

  if (nodeIdOrAttr === "$state") {
    if (!validDeviceStates.includes(message)) {
      return {
        type: "ERROR",
        message: `Invalid device state: ${message}`,
      };
    }

    return {
      type: "DEVICE_STATE",
      deviceId,
      value: message as DeviceState,
    };
  }

  if (nodeIdOrAttr === "$description") {
    let description: DeviceDescription | undefined;

    // TODO: More thorough validation of description
    try {
      description = JSON.parse(message) as DeviceDescription;
    } catch (_) {
      return {
        type: "ERROR",
        message: `Invalid JSON: ${message}`,
      };
    }

    return {
      type: "HOMIE_5_DEVICE_DESCRIPTION",
      deviceId,
      value: description,
    };
  }

  if (setOrTarget === "set") {
    return {
      type: "PROPERTY_SET",
      deviceId,
      nodeId: nodeIdOrAttr,
      propertyId,
      value: message.toString(),
    };
  }

  if (setOrTarget === "$target") {
    return {
      type: "PROPERTY_TARGET",
      deviceId,
      nodeId: nodeIdOrAttr,
      propertyId,
      value: message.toString(),
    };
  }

  if (propertyId && setOrTarget == null) {
    return {
      type: "PROPERTY_VALUE",
      deviceId,
      nodeId: nodeIdOrAttr,
      propertyId,
      value: message.toString(),
    };
  }

  return null;
}
