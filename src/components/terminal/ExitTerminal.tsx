import React, { useCallback } from "react";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useDispatch } from "react-redux";
import { updateCurrentTerminalCommand } from "../../states/global";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Button, notification } from "antd";

/*
  _____      _ _  _____                   _             _ 
 | ____|_  _(_) ||_   _|__ _ __ _ __ ___ (_)_ __   __ _| |
 |  _| \ \/ / | __|| |/ _ \ '__| '_ ` _ \| | '_ \ / _` | |
 | |___ >  <| | |_ | |  __/ |  | | | | | | | | | | (_| | |
 |_____/_/\_\_|\__||_|\___|_|  |_| |_| |_|_|_| |_|\__,_|_|
                                                          
*/
const ExitTerminal: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  const dispatch = useDispatch();

  const handleExitTerminal = useCallback(() => {
    dispatch(updateCurrentTerminalCommand("exit"));
  }, [updateCurrentTerminalCommand]);

  return (
    <>
      {contextHolder}
      <Button onClick={handleExitTerminal}>Exit Terminal</Button>
    </>
  );
};

export default ExitTerminal;
