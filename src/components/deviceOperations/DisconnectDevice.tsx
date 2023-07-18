import React, { useCallback } from "react";

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
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useDispatch, useSelector } from "react-redux";
import {
  updateIsBackendConnected,
  updateCurrentDevice,
} from "../../states/global";
import { AppState } from "../../states/global";

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
  ____  _                                     _   ____             _          
 |  _ \(_)___  ___ ___  _ __  _ __   ___  ___| |_|  _ \  _____   _(_) ___ ___ 
 | | | | / __|/ __/ _ \| '_ \| '_ \ / _ \/ __| __| | | |/ _ \ \ / / |/ __/ _ \
 | |_| | \__ \ (_| (_) | | | | | | |  __/ (__| |_| |_| |  __/\ V /| | (_|  __/
 |____/|_|___/\___\___/|_| |_|_| |_|\___|\___|\__|____/ \___| \_/ |_|\___\___|
                                                                              
*/
interface DeviceConnectionProps {
  style?: React.CSSProperties;
}

const DisconnectDevice: React.FC<DeviceConnectionProps> = (props) => {
  const [api, contextHolder] = notification.useNotification();

  // Define the state variables
  const currentBackend = useSelector((state: AppState) => state.currentBackend);
  const currentDevice = useSelector((state: AppState) => state.currentDevice);
  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const isBackendConnecting = useSelector(
    (state: AppState) => state.isBackendConnecting,
  );
  const dispatch = useDispatch();

  const handleDisconnect = useCallback(async () => {
    if (!currentDevice) {
      console.log("no device connected");
      openNotification(
        api,
        "warning",
        "bottomRight",
        "No device connected",
        "Please connect to a device first",
      );
      return;
    }

    try {
      await currentDevice!.close();
    } catch (e: any) {
      console.log("error disconnecting", e);
      openNotification(
        api,
        "error",
        "bottomRight",
        "Error disconnecting from device",
        e,
      );
    } finally {
      dispatch(updateCurrentDevice(undefined));
      dispatch(updateIsBackendConnected(false));

      console.log("Disconnected");
      openNotification(
        api,
        "success",
        "bottomRight",
        "Disconnected from device",
        "Successfully disconnected from device",
      );
    }
  }, [currentDevice, currentBackend, isBackendConnected]);

  return (
    <>
      {contextHolder}
      {isBackendConnected || isBackendConnecting ? (
        <Button
          style={props.style}
          type="default"
          onClick={handleDisconnect}
          disabled={!isBackendConnected}
          danger
          // block // uncomment this to make the button full width
        >
          Disconnect
        </Button>
      ) : null}
    </>
  );
};

export default DisconnectDevice;
