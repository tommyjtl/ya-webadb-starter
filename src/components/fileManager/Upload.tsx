import React, { useCallback } from "react";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Button, Space, Input, notification } from "antd";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useSelector, useDispatch } from "react-redux";
import {
  updateSetToUploadFile,
  updateSetToReloadPath,
  updateIsDeviceUploadingFile,
} from "../../states/global";
import { AppState } from "../../states/global";

/*
  _   _ _   _ _ _ _   _           
 | | | | |_(_) (_) |_(_) ___  ___ 
 | | | | __| | | | __| |/ _ \/ __|
 | |_| | |_| | | | |_| |  __/\__ \
  \___/ \__|_|_|_|\__|_|\___||___/
                                  
*/
import openNotificationWithIcon from "../../utils/notifications";
import { upload } from "../../utils/fileManager";

/*
  _____ _ _      __  __                                   _   _       _                 _ 
 |  ___(_) | ___|  \/  | __ _ _ __   __ _  __ _  ___ _ __| | | |_ __ | | ___   __ _  __| |
 | |_  | | |/ _ \ |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__| | | | '_ \| |/ _ \ / _` |/ _` |
 |  _| | | |  __/ |  | | (_| | | | | (_| | (_| |  __/ |  | |_| | |_) | | (_) | (_| | (_| |
 |_|   |_|_|\___|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   \___/| .__/|_|\___/ \__,_|\__,_|
                                          |___/                |_|                        
*/
const FileManagerUpload: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  // const currentBackend = useSelector((state: AppState) => state.currentBackend);
  const currentDevice = useSelector((state: AppState) => state.currentDevice);
  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const defaultDeviceLoadingPath = useSelector(
    (state: AppState) => state.defaultDeviceLoadingPath,
  );
  const readFileContent = useSelector(
    (state: AppState) => state.readFileContent,
  );
  const isDeviceUploadingFile = useSelector(
    (state: AppState) => state.isDeviceUploadingFile,
  );
  const dispatch = useDispatch();

  const handleUploadFile = useCallback(async () => {
    if (!isBackendConnected) {
      console.log(
        "[FileManager] currentDevice is undefined",
        "handleUploadFile",
      );
      openNotificationWithIcon(
        api,
        "error",
        "bottomRight",
        "Please connect to the device first",
        "",
      );
      return;
    }

    try {
      console.log("[RunPythonCode] handleRunPythonCode", readFileContent);
      dispatch(updateIsDeviceUploadingFile(true));

      const deviceSync = currentDevice?.sync();
      if (!deviceSync) {
        return;
      }
      console.log("[FileManager] currentDeviceSync", deviceSync);
      const file = new File([readFileContent], "user_latest_code.py", {
        type: "text/plain",
      });

      dispatch(updateSetToUploadFile(true));
      await upload(file, defaultDeviceLoadingPath, await deviceSync);
    } catch (e: any) {
      openNotificationWithIcon(
        api,
        "error",
        "bottomRight",
        "Failed to upload file",
        e,
      );
    } finally {
      dispatch(updateSetToUploadFile(false));
      dispatch(updateSetToReloadPath(true));
      dispatch(updateIsDeviceUploadingFile(false));
      openNotificationWithIcon(
        api,
        "success",
        "bottomRight",
        "Successfully uploaded file",
        "Uploaded to /mnt/UDISK/user_latest_code.py",
      );
    }
  }, [
    isBackendConnected,
    readFileContent,
    currentDevice,
    defaultDeviceLoadingPath,
  ]);

  const handleFileNameChange = useCallback((e: any) => {
    console.log("[RunPythonCode] handleFileNameChange", e.target.value);
  }, []);

  return (
    <>
      {contextHolder}
      <Space.Compact>
        <Input
          placeholder="Enter a file name"
          onChange={handleFileNameChange}
        ></Input>
        <Button
          type="default"
          onClick={handleUploadFile}
          disabled={!isBackendConnected || isDeviceUploadingFile}
        >
          Upload
        </Button>
      </Space.Compact>
    </>
  );
};

export default FileManagerUpload;
