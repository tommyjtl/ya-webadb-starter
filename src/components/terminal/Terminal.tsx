import React, { useEffect, useCallback } from "react";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useDispatch, useSelector } from "react-redux";
import {
  updateCurrentTerminalCommand,
  updateResetCommand,
  updateSetTerminalFit,
} from "../../states/global";
import { AppState } from "../../states/global";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Card, notification } from "antd";

/*
 __  ___                         _     
 \ \/ / |_ ___ _ __ _ __ ___    (_)___ 
  \  /| __/ _ \ '__| '_ ` _ \   | / __|
  /  \| ||  __/ |  | | | | | |_ | \__ \
 /_/\_\\__\___|_|  |_| |_| |_(_)/ |___/
                              |__/     
*/
import "xterm/css/xterm.css";
import { AdbTerminal } from "../../utils/terminal";

// Declare the global variable for the terminal
let terminal: AdbTerminal | undefined;

// Initialize the terminal if the window is defined
if (typeof window !== "undefined") {
  terminal = new AdbTerminal();
}

/*
  _____                   _             _ 
 |_   _|__ _ __ _ __ ___ (_)_ __   __ _| |
   | |/ _ \ '__| '_ ` _ \| | '_ \ / _` | |
   | |  __/ |  | | | | | | | | | | (_| | |
   |_|\___|_|  |_| |_| |_|_|_| |_|\__,_|_|
                                          
*/
interface TerminalProps {
  height: number;
  width?: number;
  needCardWrapper?: boolean;
  style?: React.CSSProperties;
}

const Terminal: React.FC<TerminalProps> = (props) => {
  const [api, contextHolder] = notification.useNotification();

  const currentDevice = useSelector((state: AppState) => state.currentDevice);
  const currentTerminalCommand = useSelector(
    (state: AppState) => state.currentTerminalCommand,
  );
  const isBackendConnected = useSelector(
    (state: AppState) => state.isBackendConnected,
  );
  const resetTerminal = useSelector((state: AppState) => state.resetTerminal);
  const setTerminalFit = useSelector((state: AppState) => state.setTerminalFit);

  const dispatch = useDispatch();

  const handleContainerRefTerminal = useCallback(
    (container: HTMLDivElement | null) => {
      if (container) {
        terminal!.setContainer(container);
        console.log("setting container", container);
      }
    },
    [],
  );

  // unable to store immutable object in the global state
  // so we handle the command here when received from other components
  useEffect(() => {
    if (currentTerminalCommand !== "") {
      console.log("currentTerminalCommand", currentTerminalCommand);

      if (terminal) {
        terminal.sendCommand(currentTerminalCommand + "\n");
      } else {
        console.log("terminal is undefined");
      }

      // reset the currentTerminalCommand
      dispatch(updateCurrentTerminalCommand(""));
    }
  }, [currentTerminalCommand]);

  // reset the terminal when the reset command is received
  useEffect(() => {
    if (resetTerminal) {
      console.log("resetTerminal", resetTerminal);

      if (terminal) {
        terminal.reset();
      } else {
        console.log("terminal is undefined");
      }

      dispatch(updateResetCommand(false));
    }
  }, [resetTerminal]);

  // reset the fit of the terminal
  useEffect(() => {
    if (setTerminalFit) {
      console.log("setTerminalFit", setTerminalFit);

      if (terminal) {
        terminal.fit();
      } else {
        console.log("terminal is undefined");
      }

      dispatch(updateSetTerminalFit(false));
    }
  }, [setTerminalFit]);

  // reset the terminal when the backend is disconnected
  useEffect(() => {
    if (!isBackendConnected) {
      if (terminal) {
        terminal.reset();
      }
    }
  }, [isBackendConnected]);

  // handles the terminal connection
  useEffect(() => {
    if (!terminal) {
      return;
    }

    if (!currentDevice) {
      terminal.socket = undefined;
      return;
    }

    if (!terminal.socket) {
      currentDevice.subprocess.shell().then(
        (shell) => {
          terminal!.socket = shell;
        },
        (e) => {
          console.log("error from Terminal.tsx");
          console.log(e);
        },
      );
      console.log("terminal", terminal);
      terminal.setDispatch(dispatch);
      terminal.fit();
    }
  }, [terminal, currentDevice]);

  return (
    <>
      {contextHolder}
      {props.needCardWrapper ? (
        <Card
          style={{
            backgroundColor: "#000000",
            // overflow: "auto",
            // append the style from the parent component
            ...props.style,
          }}
        >
          <div
            ref={handleContainerRefTerminal}
            style={{
              height: props.height,
              width: props.width,
            }}
          />
        </Card>
      ) : (
        <div
          ref={handleContainerRefTerminal}
          style={{
            height: props.height,
            width: props.width,
            // append the style from the parent component
            ...props.style,
          }}
        />
      )}
    </>
  );
};

export default Terminal;
