import React, { useCallback } from "react";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Input, notification } from "antd";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useSelector, useDispatch } from "react-redux";
import {
  updateReadFileContent,
} from "../../states/global";
import { AppState } from "../../states/global";

/*
  _____ _ _      __  __                                   ____                _ _____ _ _      
 |  ___(_) | ___|  \/  | __ _ _ __   __ _  __ _  ___ _ __|  _ \ ___  __ _  __| |  ___(_) | ___ 
 | |_  | | |/ _ \ |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__| |_) / _ \/ _` |/ _` | |_  | | |/ _ \
 |  _| | | |  __/ |  | | (_| | | | | (_| | (_| |  __/ |  |  _ <  __/ (_| | (_| |  _| | | |  __/
 |_|   |_|_|\___|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|  |_| \_\___|\__,_|\__,_|_|   |_|_|\___|
                                          |___/                                                
*/
const FileManagerReadFile: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  const isReadingFile = useSelector((state: AppState) => state.isReadingFile);
  const readFileContent = useSelector(
    (state: AppState) => state.readFileContent,
  );

  const dispatch = useDispatch();

  const handleTextAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // console.log("[RunPythonCode] handleFileNameChange", e.target.value);
      dispatch(updateReadFileContent(e.target.value));
    },
    [],
  );

  // useEffect(() => {
  //   // console.log("readFileContent", readFileContent);
  // }, [readFileContent, isReadingFile]);

  return (
    <>
      {contextHolder}
      <Input.TextArea
        rows={15}
        style={{
          width: "100%",
          fontFamily: "monospace",
          resize: "none",
        }}
        value={readFileContent}
        onChange={(e) => handleTextAreaChange(e)}
      ></Input.TextArea>
    </>
  );
};

export default FileManagerReadFile;
