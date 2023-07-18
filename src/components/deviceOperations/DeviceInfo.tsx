import React, { useEffect, useState } from "react";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Typography, Card, List, notification } from "antd";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useSelector } from "react-redux";
import { AppState } from "../../states/global";

// Extract the Text component from Typography
const { Text } = Typography;

/*
  ____             _            ___        __       
 |  _ \  _____   _(_) ___ ___  |_ _|_ __  / _| ___  
 | | | |/ _ \ \ / / |/ __/ _ \  | || '_ \| |_ / _ \ 
 | |_| |  __/\ V /| | (_|  __/  | || | | |  _| (_) |
 |____/ \___| \_/ |_|\___\___| |___|_| |_|_|  \___/ 
                                                    
*/
interface DeviceInfoListType {
  title: string;
  value: string;
}
interface DeviceInfoProps {
  style?: React.CSSProperties;
}

const DeviceInfo: React.FC<DeviceInfoProps> = (props) => {
  const [api, contextHolder] = notification.useNotification();

  const backendInfo = useSelector((state: AppState) => state.backendInfo);

  // tableData is a list of objects with title and value
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoListType[]>([]);

  useEffect(() => {
    console.log(backendInfo);
    if (backendInfo) {
      // convert backendInfo to tableData
      setDeviceInfo([
        {
          title: "Name",
          value: backendInfo.name,
        },
        {
          title: "Serial",
          value: backendInfo.serial,
        },
        {
          title: "Manufacturer",
          value: backendInfo.manufacturerName,
        },
      ]);
    }
  }, [backendInfo]);

  return (
    <>
      <Card size="small" title="Device Information" style={props.style}>
        <List
          size="small"
          itemLayout="horizontal"
          dataSource={deviceInfo}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={<Text>{item.title}</Text>}
                description={item.value}
              />
            </List.Item>
          )}
        />
      </Card>
    </>
  );
};

export default DeviceInfo;
