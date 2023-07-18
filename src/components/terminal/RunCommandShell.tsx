import React, { useCallback, useState } from "react";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useSelector, useDispatch } from "react-redux";
import { updateCurrentTerminalCommand } from "../../states/global";
import { AppState } from "../../states/global";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import Search from "antd/es/input/Search";
import { notification } from "antd";

/*
  ____               ____                                          _ ____  _          _ _ 
 |  _ \ _   _ _ __  / ___|___  _ __ ___  _ __ ___   __ _ _ __   __| / ___|| |__   ___| | |
 | |_) | | | | '_ \| |   / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` \___ \| '_ \ / _ \ | |
 |  _ <| |_| | | | | |__| (_) | | | | | | | | | | | (_| | | | | (_| |___) | | | |  __/ | |
 |_| \_\\__,_|_| |_|\____\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|____/|_| |_|\___|_|_|
                                                                                          
*/
const RunCommandShell: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const [command, setCommand] = useState("");

  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const dispatch = useDispatch();

  const handleOnSearch = useCallback(
    (value: string) => {
      console.log("command is:\t", value);
      dispatch(updateCurrentTerminalCommand(value));
      setCommand("");
    },
    [updateCurrentTerminalCommand],
  );

  return (
    <>
      {contextHolder}
      <Search
        placeholder="Input command to run"
        enterButton="Run"
        value={command}
        onSearch={handleOnSearch}
        onChange={(e) => setCommand(e.target.value)}
        disabled={!isBackendConnected}
        allowClear
      />
    </>
  );
};

export default RunCommandShell;
