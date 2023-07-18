import React, { useCallback, useEffect } from "react";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Breadcrumb, Tooltip, notification } from "antd";
import { HomeOutlined } from "@ant-design/icons";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useSelector, useDispatch } from "react-redux";
import {
  updateCurrentDeviceLoadingPath,
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
  _____ _ _      __  __                                   ____       _   _     
 |  ___(_) | ___|  \/  | __ _ _ __   __ _  __ _  ___ _ __|  _ \ __ _| |_| |__  
 | |_  | | |/ _ \ |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__| |_) / _` | __| '_ \ 
 |  _| | | |  __/ |  | | (_| | | | | (_| | (_| |  __/ |  |  __/ (_| | |_| | | |
 |_|   |_|_|\___|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|  |_|   \__,_|\__|_| |_|
                                          |___/                                
*/
const FileManagerPath: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const currentDeviceLoadingPath = useSelector(
    (state: AppState) => state.currentDeviceLoadingPath,
  );
  const defaultDeviceLoadingPath = useSelector(
    (state: AppState) => state.defaultDeviceLoadingPath,
  );

  const dispatch = useDispatch();

  const handleHomeOnClick = useCallback(() => {
    if (!isBackendConnected) {
      console.log("[FileManager] currentDevice is undefined");
      openNotification(
        api,
        "error",
        "bottomRight",
        "Please connect to the device first",
        "",
      );
      return;
    }
    dispatch(updateCurrentDeviceLoadingPath(defaultDeviceLoadingPath));
    console.log("switch to default path");
  }, [isBackendConnected]);

  const handleBreadcrumbOnClick = useCallback(
    (pathArray: string[], i: number) => {
      if (!isBackendConnected) {
        console.log(
          "[FileManager] device is not connected",
          isBackendConnected,
        );
        openNotification(
          api,
          "error",
          "bottomRight",
          "Please connect to the device first",
          "",
        );
        return;
      }
      // switch to the path
      const newPath = pathArray.slice(0, i + 1).join("/");
      dispatch(updateCurrentDeviceLoadingPath(newPath));
      console.log("switch to path", newPath);
    },
    [isBackendConnected],
  );

  const renderFilePath = useCallback(() => {
    // split the path into an array,
    // for example, /sdcard/Download/abc.txt will split into ["sdcard", "Download", "abc.txt"]
    const pathArray = currentDeviceLoadingPath.split("/");
    const renderedBreadcrumbs = [
      {
        href: "#",
        title: (
          <Tooltip
            title={defaultDeviceLoadingPath}
            // placement="bottom"
          >
            <HomeOutlined />
          </Tooltip>
        ),
        onClick: () => handleHomeOnClick(),
      },
    ];

    for (let i = 0; i < pathArray.length; i++) {
      if (pathArray[i] !== "") {
        renderedBreadcrumbs.push({
          href: "#",
          title: (
            <>
              <span>{pathArray[i]}</span>
            </>
          ),
          onClick: () => handleBreadcrumbOnClick(pathArray, i),
        });
      }
    }

    return renderedBreadcrumbs;
  }, [currentDeviceLoadingPath, isBackendConnected]);

  useEffect(() => {
    if (!isBackendConnected) {
      console.log("[FileManager] disconnected from backend");
      // reset the path to default
      dispatch(updateCurrentDeviceLoadingPath(defaultDeviceLoadingPath));
    }
  }, [isBackendConnected]);

  return (
    <>
      {contextHolder}
      <Breadcrumb items={renderFilePath()} />
    </>
  );
};

export default FileManagerPath;
