import React, { useEffect } from "react";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { notification } from "antd";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useDispatch, useSelector } from "react-redux";
import {
  updateIsBackendConnected,
  updateBrowserSerialConnectionHistory,
  updateUsbDeviceList,
  updateCurrentBackend,
  updateBackendInfo,
} from "../../states/global";
import { AppState } from "../../states/global";

/*
 __        __   _       _    ____  ____  
 \ \      / /__| |__   / \  |  _ \| __ ) 
  \ \ /\ / / _ \ '_ \ / _ \ | | | |  _ \ 
   \ V  V /  __/ |_) / ___ \| |_| | |_) |
    \_/\_/ \___|_.__/_/   \_\____/|____/ 
                                         
*/
import {
  AdbDaemonWebUsbDevice,
  AdbDaemonWebUsbDeviceManager,
  AdbDaemonWebUsbDeviceWatcher,
} from "@yume-chan/adb-daemon-webusb";

/*
   ____                                             _       
  / ___|___  _ __ ___  _ __   ___  _ __   ___ _ __ | |_ ___ 
 | |   / _ \| '_ ` _ \| '_ \ / _ \| '_ \ / _ \ '_ \| __/ __|
 | |__| (_) | | | | | | |_) | (_) | | | |  __/ | | | |_\__ \
  \____\___/|_| |_| |_| .__/ \___/|_| |_|\___|_| |_|\__|___/
                      |_|                                   
*/
import ConnectDevice from "./ConnectDevice";
import DisconnectDevice from "./DisconnectDevice";

/*
  ____             _           ____                            _   _             
 |  _ \  _____   _(_) ___ ___ / ___|___  _ __  _ __   ___  ___| |_(_) ___  _ __  
 | | | |/ _ \ \ / / |/ __/ _ \ |   / _ \| '_ \| '_ \ / _ \/ __| __| |/ _ \| '_ \ 
 | |_| |  __/\ V /| | (_|  __/ |__| (_) | | | | | | |  __/ (__| |_| | (_) | | | |
 |____/ \___| \_/ |_|\___\___|\____\___/|_| |_|_| |_|\___|\___|\__|_|\___/|_| |_|
                                                                                 
*/
interface DeviceConnectionProps {
  style?: React.CSSProperties;
}

// Define the component
const DeviceConnection: React.FC<DeviceConnectionProps> = (props) => {
  const [api, contextHolder] = notification.useNotification();

  // Define the state variables
  const currentBackend = useSelector((state: AppState) => state.currentBackend);
  const usbDeviceList = useSelector((state: AppState) => state.usbDeviceList);
  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const browserSerialConnectionHistory = useSelector(
    (state: AppState) => state.browserSerialConnectionHistory,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    // `watcher` is only trigger when the usb list changes
    // i.e., when you connect or disconnect a USB device
    const watcher = new AdbDaemonWebUsbDeviceWatcher(
      async (serial?: string) => {
        const list = await AdbDaemonWebUsbDeviceManager.BROWSER!.getDevices();
        // console.log("list", list, "serial", serial);

        // update the usbDeviceList with the current list
        dispatch(updateUsbDeviceList(list));

        // update the browserSerialConnectionHistory with current detected device serial
        dispatch(updateBrowserSerialConnectionHistory(serial ? serial : ""));

        // if a usb device connection is detected and the current backend is not connected
        // update the current backend selection
        if (serial && !isBackendConnected) {
          const findBackend = list.find((device) => device.serial === serial);
          dispatch(updateCurrentBackend(findBackend));

          // create a AdbDaemonWebUsbDevice out of findBackend
          if (findBackend instanceof AdbDaemonWebUsbDevice) {
            const adbDaemonWebUsbDevice: AdbDaemonWebUsbDevice = findBackend;
            console.log("adbDaemonWebUsbDevice", adbDaemonWebUsbDevice);
            dispatch(
              updateBackendInfo({
                name: adbDaemonWebUsbDevice?.name || "None", // Device Name
                serial: adbDaemonWebUsbDevice?.serial || "None", // Device Serial
                manufacturerName:
                  adbDaemonWebUsbDevice?.raw.manufacturerName || "None", // Device Serial
              }),
            );
          }

          return;
        }

        // if a usb device disconnection is detected
        // and that connection is happening on the current backend
        if (
          !serial &&
          currentBackend?.serial === browserSerialConnectionHistory[0]
        ) {
          console.log("triggered");
          dispatch(updateCurrentBackend(undefined));
          dispatch(updateIsBackendConnected(false));
          dispatch(
            updateBackendInfo({
              name: "None", // Device Name
              serial: "None", // Device Serial
              manufacturerName: "None", // Device Serial
            }),
          );
          return;
        }
      },
      globalThis.navigator.usb,
    );

    return () => {
      watcher.dispose();
    };
  }, [currentBackend, usbDeviceList, browserSerialConnectionHistory]);

  return (
    <>
      {contextHolder}
      <ConnectDevice style={props.style} />
      <DisconnectDevice style={props.style} />
    </>
  );
};

export default DeviceConnection;
