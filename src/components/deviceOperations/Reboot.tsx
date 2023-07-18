import React, { useCallback } from "react";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentTerminalCommand } from "../../states/global";
import { AppState } from "../../states/global";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Button, notification } from "antd";

const Reboot: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const dispatch = useDispatch();

  const handleReboot = useCallback(() => {
    dispatch(updateCurrentTerminalCommand("reboot"));
  }, [updateCurrentTerminalCommand]);

  return (
    <>
      {contextHolder}
      <Button onClick={handleReboot} disabled={!isBackendConnected} danger>
        Reboot
      </Button>
    </>
  );
};

export default Reboot;
