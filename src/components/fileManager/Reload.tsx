import React, { useCallback, useEffect } from "react";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Button, notification } from "antd";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useSelector, useDispatch } from "react-redux";
import {
  FileManagerItemType,
  updateCurrentFileList,
  updateIsLoadingPath,
  updateSetToReloadPath,
} from "../../states/global";
import { AppState } from "../../states/global";

/*
  _   _ _   _ _ _ _   _           
 | | | | |_(_) (_) |_(_) ___  ___ 
 | | | | __| | | | __| |/ _ \/ __|
 | |_| | |_| | | | |_| |  __/\__ \
  \___/ \__|_|_|_|\__|_|\___||___/
                                  
*/
import { filterAndSortItems } from "../../utils/fileManager";
import openNotificationWithIcon from "../../utils/notifications";

/*
  _____ _ _      __  __                                   ____      _                 _ 
 |  ___(_) | ___|  \/  | __ _ _ __   __ _  __ _  ___ _ __|  _ \ ___| | ___   __ _  __| |
 | |_  | | |/ _ \ |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__| |_) / _ \ |/ _ \ / _` |/ _` |
 |  _| | | |  __/ |  | | (_| | | | | (_| | (_| |  __/ |  |  _ <  __/ | (_) | (_| | (_| |
 |_|   |_|_|\___|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|  |_| \_\___|_|\___/ \__,_|\__,_|
                                          |___/                                         
*/
const FileManagerReload: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  // const currentBackend = useSelector((state: AppState) => state.currentBackend);
  const currentDevice = useSelector((state: AppState) => state.currentDevice);
  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const currentDeviceLoadingPath = useSelector(
    (state: AppState) => state.currentDeviceLoadingPath,
  );
  const setToReloadPath = useSelector(
    (state: AppState) => state.setToReloadPath,
  );
  const dispatch = useDispatch();

  // whenever currentDeviceLoadingPath changes, reload files
  useEffect(() => {
    if (currentDeviceLoadingPath !== "" && isBackendConnected) {
      console.log("[FileManager] currentDeviceLoadingPath changed");
      handleLoadFiles();
    }
  }, [currentDeviceLoadingPath, isBackendConnected]);

  // whenever setToReloadPath changes, reload files
  useEffect(() => {
    if (setToReloadPath) {
      console.log("[FileManager] setToLoadingPath changed");
      dispatch(updateSetToReloadPath(false));

      // reload files after 200ms
      setTimeout(() => {
        handleLoadFiles();
      }, 200);
    }
  }, [setToReloadPath]);

  const handleLoadFiles = useCallback(async () => {
    if (!isBackendConnected) {
      console.log("[FileManager] currentDevice is undefined");
      openNotificationWithIcon(
        api,
        "error",
        "bottomRight",
        "Please connect to the device first",
        "",
      );
      return;
    }

    dispatch(updateIsLoadingPath(true));

    const deviceSync = currentDevice?.sync();
    if (deviceSync) {
      console.log("[FileManager] currentDeviceSync", deviceSync);
    }

    try {
      let currentLs: FileManagerItemType[] = [];
      let ii = 0;

      const ls = (await deviceSync!).opendir(currentDeviceLoadingPath);
      for await (const entry of ls) {
        const item: FileManagerItemType = {
          key: ii,
          name: entry.name,
          size: entry.size,
          mode: entry.mode,
          mtime: entry.mtime,
          permission: entry.permission,
          type: entry.type,
          // extension: entry.name.split(".").pop(),?
          path: currentDeviceLoadingPath,
        };
        // console.log("entry.mtime", entry.mtime);
        ii += 1;
        currentLs.push(item);
      }

      // currentLs = filterAndSortItems(currentLs, [
      //   ".",
      //   "..",
      //   "__pycache__",
      //   "System Volume Information",
      // ]);

      dispatch(updateCurrentFileList(currentLs));
      // console.table(currentLs);
      // openNotificationWithIcon(
      //   api,
      //   "success",
      //   "bottomRight",
      //   "Files loaded",
      //   "Loaded files from " + currentDeviceLoadingPath,
      // );
    } catch (err) {
      console.log("[FileManager] Error", err);
      openNotificationWithIcon(api, "error", "bottomRight", "Error", "");
    } finally {
      dispatch(updateIsLoadingPath(false));
    }
  }, [isBackendConnected, currentDeviceLoadingPath]);

  return (
    <>
      {contextHolder}
      <Button onClick={handleLoadFiles} size="small">
        Reload
      </Button>
    </>
  );
};

export default FileManagerReload;
