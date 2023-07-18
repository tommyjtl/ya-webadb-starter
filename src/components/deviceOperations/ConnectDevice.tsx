import React, { useCallback } from "react";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useDispatch, useSelector } from "react-redux";
import {
  updateCredentialStore,
  updateIsBackendConnecting,
  updateIsBackendConnected,
  appendLog,
  updateCurrentDevice,
  updateBrowserSerialConnectionHistory,
} from "../../states/global";
import { AppState } from "../../states/global";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Button } from "antd";
import { notification } from "antd";

/*
 __        __   _       _    ____  ____  
 \ \      / /__| |__   / \  |  _ \| __ ) 
  \ \ /\ / / _ \ '_ \ / _ \ | | | |  _ \ 
   \ V  V /  __/ |_) / ___ \| |_| | |_) |
    \_/\_/ \___|_.__/_/   \_\____/|____/ 
                                         
*/
import {
  Adb,
  AdbDaemonTransport,
  AdbPacketData,
  AdbPacketInit,
} from "@yume-chan/adb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import {
  Consumable,
  InspectStream,
  ReadableStream,
  WritableStream,
  pipeFrom,
} from "@yume-chan/stream-extra";

/*
   ____                                             _       
  / ___|___  _ __ ___  _ __   ___  _ __   ___ _ __ | |_ ___ 
 | |   / _ \| '_ ` _ \| '_ \ / _ \| '_ \ / _ \ '_ \| __/ __|
 | |__| (_) | | | | | | |_) | (_) | | | |  __/ | | | |_\__ \
  \____\___/|_| |_| |_| .__/ \___/|_| |_|\___|_| |_|\__|___/
                      |_|                                   
*/
import openNotification from "../../utils/notifications";

/*
   ____                            _   ____             _          
  / ___|___  _ __  _ __   ___  ___| |_|  _ \  _____   _(_) ___ ___ 
 | |   / _ \| '_ \| '_ \ / _ \/ __| __| | | |/ _ \ \ / / |/ __/ _ \
 | |__| (_) | | | | | | |  __/ (__| |_| |_| |  __/\ V /| | (_|  __/
  \____\___/|_| |_|_| |_|\___|\___|\__|____/ \___| \_/ |_|\___\___|

*/
interface DeviceConnectionProps {
  style?: React.CSSProperties;
}

const ConnectDevice: React.FC<DeviceConnectionProps> = (props) => {
  const [api, contextHolder] = notification.useNotification();

  // Define the state variables
  const currentBackend = useSelector((state: AppState) => state.currentBackend);
  const currentDevice = useSelector((state: AppState) => state.currentDevice);
  const credentialStore = useSelector(
    (state: AppState) => state.credentialStore,
  );
  const isBackendConnecting = useSelector(
    (state: AppState) => state.isBackendConnecting,
  );
  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const dispatch = useDispatch();

  // Define the handleConnect function
  const handleConnect = useCallback(async () => {
    if (!currentBackend) {
      console.log("no backend selected");
      openNotification(
        api,
        "warning",
        "bottomRight",
        "No backend selected",
        "Please select a backend first",
      );
      return;
    }

    console.log("Make sure to enable USB debugging on your device!");
    openNotification(
      api,
      "warning",
      "bottomRight",
      "Make sure to allow USB debugging on your device!",
      "Otherwise, you will not be able to connect to your device",
    );
    dispatch(updateIsBackendConnecting(true));

    let readable: ReadableStream<AdbPacketData>;
    let writable: WritableStream<Consumable<AdbPacketInit>>;
    // construting the streams
    try {
      const streams = await currentBackend.connect();

      // Use `InspectStream`s to intercept and log packets
      readable = streams.readable.pipeThrough(
        new InspectStream((packet) => {
          dispatch(appendLog({ direction: "in", ...packet }));
        }),
      );

      writable = pipeFrom(
        streams.writable,
        new InspectStream((packet: Consumable<AdbPacketInit>) => {
          dispatch(appendLog({ direction: "out", ...packet.value }));
        }),
      );
    } catch (e: any) {
      console.log("error connecting", e);
      openNotification(
        api,
        "error",
        "bottomRight",
        "Error connecting to device",
        e,
      );
      dispatch(updateIsBackendConnecting(false));
      return;
    }

    async function dispose() {
      // Adb won't close the streams,
      // so manually close them.
      try {
        readable.cancel();
      } catch (e: any) {
        // ignore error
        console.log("error closing readable", e);
        openNotification(
          api,
          "error",
          "bottomRight",
          "Error disposing the connection",
          "Error closing the readable stream: " + e,
        );
        // throw e;
      } finally {
        // do we need to reset the device?
        // GLOBAL_STATE.setDevice(undefined, undefined);
        dispatch(updateCurrentDevice(undefined));
        dispatch(updateIsBackendConnected(false));
      }

      try {
        await writable.close();
      } catch (e) {
        // ignore error
        console.log("error closing writable", e);
        openNotification(
          api,
          "error",
          "bottomRight",
          "Error disposing the connection",
          "Error closing the writable stream",
        );
      } finally {
        // do we need to reset the device?
        // GLOBAL_STATE.setDevice(undefined, undefined);
        dispatch(updateCurrentDevice(undefined));
        dispatch(updateIsBackendConnected(false));
      }
    }

    // constructing the device
    try {
      const CredentialStore = new AdbWebCredentialStore();

      // console.log("credential store", credentialStore);
      dispatch(updateCredentialStore(CredentialStore));

      const device = new Adb(
        await AdbDaemonTransport.authenticate({
          serial: currentBackend.serial,
          connection: { readable, writable },
          credentialStore: CredentialStore,
        }),
      );

      device.disconnected.then(
        async () => {
          console.log("[handleConnect] Disconnected");
          // openNotification(api, 'success', 'bottomRight',
          //   'Disconnected from device',
          //   'from `device.disconnected.then()`',
          // );
          await dispose();
        },
        async (e) => {
          console.log("[handleConnect] Disconnecting failed", e);
          openNotification(
            api,
            "error",
            "bottomRight",
            "Error disconnecting from device",
            e,
          );
          await dispose();
        },
      );

      dispatch(updateCurrentDevice(device));
      dispatch(updateIsBackendConnecting(false));
      dispatch(updateIsBackendConnected(true));
      dispatch(updateBrowserSerialConnectionHistory(currentBackend.serial));
    } catch (e: any) {
      console.log("error connecting", e);
      openNotification(
        api,
        "error",
        "bottomRight",
        "Error connecting to device",
        e,
      );
      await dispose();
    } finally {
      console.log("Connected");
      openNotification(
        api,
        "success",
        "bottomRight",
        `Connected to device: ${currentBackend.serial}`,
        "Successfully connected to device",
      );
    }
  }, [
    currentBackend,
    currentDevice,
    isBackendConnected,
    isBackendConnecting,
    credentialStore,
    updateIsBackendConnected,
  ]);

  return (
    <>
      {contextHolder}
      {!isBackendConnected && !isBackendConnecting ? (
        <Button
          style={props.style}
          type="primary"
          onClick={handleConnect}
          disabled={isBackendConnected || isBackendConnecting}
          // block // uncomment this to make the button full width
        >
          Connect
        </Button>
      ) : (
        <></>
      )}
    </>
  );
};

export default ConnectDevice;
