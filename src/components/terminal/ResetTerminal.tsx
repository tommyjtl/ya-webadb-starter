import React, { useCallback } from "react";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useDispatch } from "react-redux";
import { updateResetCommand } from "../../states/global";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Button, notification, Typography } from "antd";

/*
  ____                _  _____                   _             _ 
 |  _ \ ___  ___  ___| ||_   _|__ _ __ _ __ ___ (_)_ __   __ _| |
 | |_) / _ \/ __|/ _ \ __|| |/ _ \ '__| '_ ` _ \| | '_ \ / _` | |
 |  _ <  __/\__ \  __/ |_ | |  __/ |  | | | | | | | | | | (_| | |
 |_| \_\___||___/\___|\__||_|\___|_|  |_| |_| |_|_|_| |_|\__,_|_|
                                                                 
*/
const ResetTerminal: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();

  const dispatch = useDispatch();

  const handleResetTerminal = useCallback(() => {
    dispatch(updateResetCommand(true));
  }, [updateResetCommand]);

  return (
    <>
      {contextHolder}
      <Button onClick={handleResetTerminal}>Reset Terminal</Button>
    </>
  );
};

export default ResetTerminal;
