import React, { useCallback, useEffect, useState } from "react";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Typography, notification } from "antd";
import Table from "antd/es/table";
import type { ColumnsType } from "antd/es/table";

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
} from "../../states/global";
import { AppState } from "../../states/global";

/*
  _   _ _   _ _ _ _   _           
 | | | | |_(_) (_) |_(_) ___  ___ 
 | | | | __| | | | __| |/ _ \/ __|
 | |_| | |_| | | | |_| |  __/\__ \
  \___/ \__|_|_|_|\__|_|\___||___/
                                  
*/
import {
  formatBytes,
  formatTime,
  renderFileIcon,
  renderFileName,
} from "../../utils/fileManager";

/*
 __        __   _       _    ____  ____  
 \ \      / /__| |__   / \  |  _ \| __ ) 
  \ \ /\ / / _ \ '_ \ / _ \ | | | |  _ \ 
   \ V  V /  __/ |_) / ___ \| |_| | |_) |
    \_/\_/ \___|_.__/_/   \_\____/|____/ 
                                         
*/
import { AdbSync } from "@yume-chan/adb";

// Extract the Text component from Typography
const { Text } = Typography;

/*
  _____ _ _      __  __                                  _____     _     _      
 |  ___(_) | ___|  \/  | __ _ _ __   __ _  __ _  ___ _ _|_   _|_ _| |__ | | ___ 
 | |_  | | |/ _ \ |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|| |/ _` | '_ \| |/ _ \
 |  _| | | |  __/ |  | | (_| | | | | (_| | (_| |  __/ |   | | (_| | |_) | |  __/
 |_|   |_|_|\___|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   |_|\__,_|_.__/|_|\___|
                                          |___/                                 
*/
const FileManagerTable: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  const currentBackend = useSelector((state: AppState) => state.currentBackend);
  const currentDevice = useSelector((state: AppState) => state.currentDevice);
  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const currentFileList = useSelector(
    (state: AppState) => state.currentFileList,
  );
  const isLoadingPath = useSelector((state: AppState) => state.isLoadingPath);

  const dispatch = useDispatch();

  const [currentSync, setCurrentSync] = useState<AdbSync>();

  useEffect(() => {
    const fetchData = async () => {
      if (isBackendConnected) {
        const deviceSync = await currentDevice?.sync();
        if (deviceSync) {
          console.log("[FileManager] currentDeviceSync", deviceSync);
          setCurrentSync(deviceSync);
        }
      }
    };

    fetchData();
  }, [isBackendConnected]);

  let fileManagerColumns: ColumnsType<FileManagerItemType> = [
    {
      title: "",
      dataIndex: "icon",
      width: "6%",
      render: (value: number, record: FileManagerItemType) => {
        return renderFileIcon(record);
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      width: "40%",
      render: (value: string, record: FileManagerItemType) => {
        return renderFileName(value, record, dispatch, currentSync!);
      },
    },
    {
      title: "Size",
      dataIndex: "size",
      width: "15%",
      render: (value: BigInt, record: FileManagerItemType) => (
        <Text
        // style={
        //   !record.isPythonFile && record.type !== 4 ? { opacity: 0.3 } : {}
        // }
        >
          {formatBytes(value, 2)}
        </Text>
      ),
    },
    {
      title: "Last Modified Time",
      dataIndex: "mtime",
      width: "auto",
      render: (value: BigInt, record: FileManagerItemType) => (
        <Text
        // style={
        //   !record.isPythonFile && record.type !== 4 ? { opacity: 0.3 } : {}
        // }
        >
          {formatTime(value)}
        </Text>
      ),
    },
  ];

  useEffect(() => {
    if (!isBackendConnected) {
      console.log("[FileManager] disconnected from backend");
      // reset table data
      dispatch(updateCurrentFileList([]));
    }
  }, [isBackendConnected]);

  useEffect(() => {
    console.log("isLoadingPath", isLoadingPath);
  }, [isLoadingPath]);

  return (
    <>
      <Table
        style={{
          marginTop: 10,
          height: "250px",
        }}
        size="small"
        pagination={false}
        scroll={{ y: 250 }}
        columns={fileManagerColumns}
        dataSource={currentFileList}
        loading={isLoadingPath}
        // rowSelection={rowSelection}
      />
    </>
  );
};

export default FileManagerTable;
