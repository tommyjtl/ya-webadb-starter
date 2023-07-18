import React, { useCallback } from "react";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Select } from "antd";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useDispatch, useSelector } from "react-redux";
import {
  updateCurrentBackend,
  updateUsbDeviceList,
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
import { AdbDaemonDevice } from "@yume-chan/adb";
import {
  AdbDaemonWebUsbDevice,
  AdbDaemonWebUsbDeviceManager,
} from "@yume-chan/adb-daemon-webusb";

/*
  ____       _           _   ____             _          
 / ___|  ___| | ___  ___| |_|  _ \  _____   _(_) ___ ___ 
 \___ \ / _ \ |/ _ \/ __| __| | | |/ _ \ \ / / |/ __/ _ \
  ___) |  __/ |  __/ (__| |_| |_| |  __/\ V /| | (_|  __/
 |____/ \___|_|\___|\___|\__|____/ \___| \_/ |_|\___\___|
                                                         
*/
interface SelectDeviceProps {
  style?: React.CSSProperties;
}

const SelectDevice: React.FC<SelectDeviceProps> = (props) => {
  // Define the state variables
  const currentBackend = useSelector((state: AppState) => state.currentBackend);
  const currentDevice = useSelector((state: AppState) => state.currentDevice);
  const usbDeviceList = useSelector((state: AppState) => state.usbDeviceList);
  const backendInfo = useSelector((state: AppState) => state.backendInfo);

  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );

  const dispatch = useDispatch();

  const handleSelect = useCallback(
    async (value: string) => {
      const devices: AdbDaemonDevice[] =
        await AdbDaemonWebUsbDeviceManager.BROWSER!.getDevices();

      dispatch(updateUsbDeviceList(devices));
      // console.log("devices", devices);
      // console.log("value", value);

      const findBackend = devices.find((device) => device.serial === value);

      if (findBackend) {
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
      }
      return devices;
    },
    [usbDeviceList, currentBackend, currentDevice, backendInfo],
  );

  return (
    <Select
      style={props.style}
      showSearch
      popupMatchSelectWidth={true}
      placeholder="Backend list"
      optionFilterProp="children"
      value={currentBackend?.serial}
      filterOption={(input, option) => (option?.label ?? "").includes(input)}
      filterSort={(optionA, optionB) =>
        (optionA?.label ?? "")
          .toLowerCase()
          .localeCompare((optionB?.label ?? "").toLowerCase())
      }
      options={usbDeviceList.map((device) => {
        return {
          label: device.serial,
          value: device.serial,
        };
      })}
      onChange={handleSelect}
      disabled={isBackendConnected}
    />
  );
};

export default SelectDevice;
