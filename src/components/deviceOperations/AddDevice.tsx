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
  updateBrowserSupported,
  updateCurrentBackend,
  updateUsbDeviceList,
  updateBackendInfo,
} from "../../states/global";
import { AppState } from "../../states/global";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Button, notification } from "antd";

/*
 __        __   _       _    ____  ____  
 \ \      / /__| |__   / \  |  _ \| __ ) 
  \ \ /\ / / _ \ '_ \ / _ \ | | | |  _ \ 
   \ V  V /  __/ |_) / ___ \| |_| | |_) |
    \_/\_/ \___|_.__/_/   \_\____/|____/ 
                                         
*/
import { AdbDaemonDevice } from "@yume-chan/adb";
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";

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
     _       _     _ ____             _          
    / \   __| | __| |  _ \  _____   _(_) ___ ___ 
   / _ \ / _` |/ _` | | | |/ _ \ \ / / |/ __/ _ \
  / ___ \ (_| | (_| | |_| |  __/\ V /| | (_|  __/
 /_/   \_\__,_|\__,_|____/ \___| \_/ |_|\___\___|
                                                 
*/
interface AddDeviceProps {
  style?: React.CSSProperties;
}

const AddDevice: React.FC<AddDeviceProps> = (props) => {
  const [api, contextHolder] = notification.useNotification();

  // Define the state variables
  const currentBackend = useSelector((state: AppState) => state.currentBackend);
  const usbDeviceList = useSelector((state: AppState) => state.usbDeviceList);
  const browserSupported = useSelector(
    (state: AppState) => state.browserSupported,
  );
  const backendInfo = useSelector((state: AppState) => state.backendInfo);
  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );

  // Define the dispatch function
  const dispatch = useDispatch();

  // Define the handleAddDevice() function
  const handleAddDevice = useCallback(async () => {
    /*
      handleAddDevice() is called when the user clicks the Add button.
      It does 2 things:
      - Checks if the user has granted permission to access the device
        - if so, it updates the currentBackend state to the backend
        - if not, it resets the currentBackend state to undefined
      - Adds the current device to usbDeviceList
    */
    // Checks if the browser supports WebUSB
    if (!AdbDaemonWebUsbDeviceManager.BROWSER) {
      // browser not supported
      dispatch(updateBrowserSupported(false));
      return;
    }
    dispatch(updateBrowserSupported(true));

    // Checks if the user has granted permission to access the device
    const backend = await AdbDaemonWebUsbDeviceManager.BROWSER.requestDevice();
    if (!backend) {
      // no device chosen by user
      dispatch(updateCurrentBackend(undefined));
      return;
    }
    dispatch(updateCurrentBackend(backend));
    dispatch(
      updateBackendInfo({
        name: backend.name || "None", // Device Name
        serial: backend.serial || "None", // Device Serial
        manufacturerName: backend.raw.manufacturerName || "None", // Device Manufacturer
      }),
    );
    openNotification(
      api,
      "success",
      "bottomRight",
      `Device added`,
      `Device information:\n\n
      - name: ${backend.serial}\n\n
      - manufacturerName: ${backend.raw.manufacturerName}\n`,
    );

    // Add the current device to usbDeviceList
    const devices: AdbDaemonDevice[] =
      await AdbDaemonWebUsbDeviceManager.BROWSER!.getDevices();
    dispatch(updateUsbDeviceList(devices));
  }, [usbDeviceList, browserSupported, currentBackend, backendInfo]);

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        onClick={handleAddDevice}
        style={props.style}
        disabled={isBackendConnected}
        // block // uncomment this line to make the button full width
      >
        Add
      </Button>
    </>
  );
};

export default AddDevice;
