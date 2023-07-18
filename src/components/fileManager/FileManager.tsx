import React from "react";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Col, Row, notification } from "antd";

/*
   ____                                             _       
  / ___|___  _ __ ___  _ __   ___  _ __   ___ _ __ | |_ ___ 
 | |   / _ \| '_ ` _ \| '_ \ / _ \| '_ \ / _ \ '_ \| __/ __|
 | |__| (_) | | | | | | |_) | (_) | | | |  __/ | | | |_\__ \
  \____\___/|_| |_| |_| .__/ \___/|_| |_|\___|_| |_|\__|___/
                      |_|                                   
*/
import FileManagerPath from "./Path";
import FileManagerReload from "./Reload";
import FileManagerTable from "./Table";

/*
  _____ _ _      __  __                                   
 |  ___(_) | ___|  \/  | __ _ _ __   __ _  __ _  ___ _ __ 
 | |_  | | |/ _ \ |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
 |  _| | | |  __/ |  | | (_| | | | | (_| | (_| |  __/ |   
 |_|   |_|_|\___|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   
                                          |___/           
*/
const FileManager: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  return (
    <div>
      {contextHolder}
      <Row>
        <Col span={12}>
          <FileManagerPath />
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <FileManagerReload />
        </Col>
      </Row>
      <FileManagerTable />
    </div>
  );
};

export default FileManager;
