// @deno-types="@types/react";
import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useEffect,
  use,
} from "react";

import {
  EnvironmentConfig,
  useEnvironmentConfig,
} from "../state/environmentConfigs.ts";
import mqtt from "mqtt";
import { Store } from "./Store.ts";
import { parseMqttEvent } from "#/lib/homie-event.ts";

// @ts-expect-error HMR
if (import.meta.hot) {
  // @ts-expect-error HMR
  import.meta.hot.accept(() => {
    // TODO: Better HMR handling
    window.location.reload();
  });
}

type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "unknown";

class EnvironmentManager {
  environment: EnvironmentConfig;
  connectionState: ConnectionState = "disconnected";

  #store = new Store();
  #client: mqtt.MqttClient;
  #subscribers = new Set<VoidFunction>();
  #isSubscribedToStateStateTopic: boolean = false;
  #subscriptionCountByDevice: Map<string, number> = new Map();
  #unsubscriptionTimeoutIdByDevice: Map<string, number> = new Map();
  #suspensePromisesByDeviceId = new Map<string, Promise<void>>();

  constructor(environment: EnvironmentConfig) {
    this.environment = environment;

    this.#client = mqtt.connect(environment.broker_url, {
      username: environment.username,
      clientId: "homie-dashboard",
      password: environment.password,
      // manualConnect: true,
    });

    this.#client.on("message", this.#onMqttMessage);
    this.#client.on("connect", this.#handleConnectionChange);
    this.#client.on("reconnect", this.#handleConnectionChange);
    this.#client.on("close", this.#handleConnectionChange);

    this.#handleConnectionChange();
  }

  get devices() {
    return this.#store.devices;
  }

  subscribe(fn: () => void) {
    if (!this.#isSubscribedToStateStateTopic) {
      this.#client.subscribe(
        `${this.environment.homie_namespace ?? "+"}/5/+/$state`
      );

      this.#isSubscribedToStateStateTopic = true;
    }

    this.#subscribers.add(fn);

    return () => {
      this.#subscribers.delete(fn);
    };
  }

  subscribeToDevice(deviceId: string): VoidFunction {
    const subscriptionCount =
      (this.#subscriptionCountByDevice.get(deviceId) ?? 0) + 1;

    if (subscriptionCount === 1) {
      clearTimeout(this.#unsubscriptionTimeoutIdByDevice.get(deviceId));

      this.#client.subscribe(
        `${this.environment.homie_namespace ?? "+"}/5/${deviceId}/#`
      );
    }

    this.#subscriptionCountByDevice.set(deviceId, subscriptionCount);

    return () => {
      const subscriptionCount =
        this.#subscriptionCountByDevice.get(deviceId)! - 1;

      this.#subscriptionCountByDevice.set(deviceId, subscriptionCount);

      if (subscriptionCount === 0) {
        clearTimeout(this.#unsubscriptionTimeoutIdByDevice.get(deviceId));

        const timeoutId = setTimeout(() => {
          if (this.#subscriptionCountByDevice.get(deviceId) === 0) {
            this.#client.unsubscribe(
              `${this.environment.homie_namespace ?? "+"}/5/${deviceId}/#`
            );

            this.#subscriptionCountByDevice.delete(deviceId);
          }
        }, 1000);

        this.#unsubscriptionTimeoutIdByDevice.set(deviceId, timeoutId);
      }
    };
  }

  getDeviceSuspensePromise(deviceId: string): Promise<void> {
    if (this.#suspensePromisesByDeviceId.has(deviceId)) {
      return this.#suspensePromisesByDeviceId.get(deviceId)!;
    }

    const promise = new Promise<void>((resolve) => {
      if (this.devices.get(deviceId)?.hasLoadedInitialDescription ?? false) {
        resolve();
        return;
      }

      const unsubscribeFromDevice = this.subscribeToDevice(deviceId);

      const unsubscribe = this.subscribe(() => {
        if (this.devices.get(deviceId)?.hasLoadedInitialDescription ?? false) {
          unsubscribe();

          // This just unregisters the subscription required for the promise to resolve.
          // A mounted component might still hold a subscription.
          unsubscribeFromDevice();
          resolve();
        }
      });
    });

    this.#suspensePromisesByDeviceId.set(deviceId, promise);

    return promise;
  }

  setProperty(path: string, value: string) {
    this.#client.publish(`homie/5/${path}/set`, value, {
      qos: 0,
      retain: false,
    });
  }

  /**
   * Notify all subscribers that anything has changed.
   * We don't have to be granular about what changed
   * because we rely on referential equality for updates
   */
  #notify() {
    this.#subscribers.forEach((fn) => fn());
  }

  #handleConnectionChange = () => {
    this.connectionState = this.#client.connected
      ? "connected"
      : this.#client.reconnecting
      ? "reconnecting"
      : this.#client.disconnected
      ? "disconnected"
      : "unknown";

    this.#notify();
  };

  #onMqttMessage = (topic: string, message: Uint8Array) => {
    const homieEvent = parseMqttEvent(topic, message);

    if (homieEvent == null) {
      return;
    }

    const devicesBefore = this.#store.devices;
    this.#store.updateFromHomieEvent(homieEvent);

    if (devicesBefore !== this.#store.devices) {
      this.#notify();
    }
  };
}

const EnvironmentContext = createContext<EnvironmentManager | null>(null);

const managersByEnvironment = new Map<string, EnvironmentManager>();

export type EnvironmentProviderProps = {
  environmentId: string;
  children: React.ReactNode;
};

/**
 * Provide the devices from a specific environment to the tree subtree of children.
 *
 * @param {EnvironmentProviderProps} props The props for the EnvironmentProvider.
 * @returns {React.ReactElement} The EnvironmentProvider component.
 */
export function EnvironmentProvider({
  children,
  environmentId,
}: EnvironmentProviderProps) {
  const environment = useEnvironmentConfig(environmentId);

  if (environment == null) {
    throw new Error(
      `Environment with ID ${environmentId} does not exist in the store`
    );
  }

  const environmentManager =
    managersByEnvironment.get(environmentId) ??
    new EnvironmentManager(environment);

  managersByEnvironment.set(environmentId, environmentManager);

  return (
    <EnvironmentContext value={environmentManager}>
      {children}
    </EnvironmentContext>
  );
}

/**
 * Get the devices from the current environment.
 *
 * At this point only the state prop of the devices is guaranteed to be present.
 * The primary use case for this hook is to get a list of devices.
 * use the useDevice hook to get all properties of a specific device.
 *
 * @returns {Device[]} The devices from the current environment.
 * @throws {Error} Throws an error if used outside of an EnvironmentProvider.
 */
export function useDevices() {
  const environmentManager = useContext(EnvironmentContext);

  const devices = useSyncExternalStore(
    (fn) => {
      if (environmentManager == null) {
        return () => {};
      }

      return environmentManager.subscribe(fn);
    },
    () => environmentManager?.devices
  );

  if (environmentManager == null) {
    throw new Error("useDevices must be used within an EnvironmentProvider");
  }

  return devices;
}

/**
 * Get a specific device from the current environment.
 *
 * @param deviceId  The ID of the device to get.
 * @returns The device with the given ID.
 * @throws Throws an error if used outside of an EnvironmentProvider.
 */
export function useDevice(deviceId: string) {
  const environmentManager = useContext(EnvironmentContext);

  if (environmentManager == null) {
    throw new Error("useDevice must be used within an EnvironmentProvider");
  }

  const devices = useDevices();

  useDeviceSubscriptionRegistrate(deviceId);

  const setProperty = useCallback(
    (nodeId: string, propertyId: string, value: string) => {
      environmentManager?.setProperty(
        `${deviceId}/${nodeId}/${propertyId}`,
        value
      );
    },
    [environmentManager, deviceId]
  );

  use(environmentManager.getDeviceSuspensePromise(deviceId));

  const device = deviceId != null ? devices?.get(deviceId) : null;

  return { device, setProperty };
}

function useDeviceSubscriptionRegistrate(deviceId: string) {
  const environmentManager = useContext(EnvironmentContext);

  useEffect(() => {
    return environmentManager?.subscribeToDevice(deviceId);
  }, [deviceId]);
}

/**
 * Get the connection state of the current environment.
 *
 * @returns The connection state of the current environment.
 * @throws Throws an error if used outside of an EnvironmentProvider.
 */
export function useConnectionState() {
  const environmentManager = useContext(EnvironmentContext);

  return useSyncExternalStore(
    (fn) => {
      if (environmentManager == null) {
        return () => {};
      }

      return environmentManager.subscribe(fn);
    },
    () => {
      if (environmentManager == null) {
        return "disconnected";
      }

      return environmentManager.connectionState;
    }
  );
}

export function useEnvironment() {
  const environmentManager = useContext(EnvironmentContext);

  if (environmentManager == null) {
    throw new Error(
      "useEnvironment must be used within an EnvironmentProvider"
    );
  }

  return environmentManager.environment;
}
