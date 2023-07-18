import React, { useCallback, useEffect, useState, useRef } from "react";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { useDispatch, useSelector } from "react-redux";
import { updateBrowserSupported, updateUsbDeviceList } from "../states/global";
import { AppState } from "../states/global";

/*
     _          _   ____  
    / \   _ __ | |_|  _ \ 
   / _ \ | '_ \| __| | | |
  / ___ \| | | | |_| |_| |
 /_/   \_\_| |_|\__|____/ 
                           
*/
import { Layout, Space, Typography, Col, Row } from "antd";
import { notification } from "antd";

/*
 __        __   _       _    ____  ____  
 \ \      / /__| |__   / \  |  _ \| __ ) 
  \ \ /\ / / _ \ '_ \ / _ \ | | | |  _ \ 
   \ V  V /  __/ |_) / ___ \| |_| | |_) |
    \_/\_/ \___|_.__/_/   \_\____/|____/ 
                                         
*/
import { AdbDaemonDevice } from "@yume-chan/adb";
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";

/*
   ____                                             _       
  / ___|___  _ __ ___  _ __   ___  _ __   ___ _ __ | |_ ___ 
 | |   / _ \| '_ ` _ \| '_ \ / _ \| '_ \ / _ \ '_ \| __/ __|
 | |__| (_) | | | | | | |_) | (_) | | | |  __/ | | | |_\__ \
  \____\___/|_| |_| |_| .__/ \___/|_| |_|\___|_| |_|\__|___/
                      |_|                                   
*/
import AddDevice from "../components/deviceOperations/AddDevice";
import DeviceConnection from "../components/deviceOperations/DeviceConnection";
import SelectDevice from "../components/deviceOperations/SelectDevice";
import DeviceInfo from "../components/deviceOperations/DeviceInfo";
import Terminal from "../components/terminal/Terminal";
import ExitTerminal from "../components/terminal/ExitTerminal";
import ResetTerminal from "../components/terminal/ResetTerminal";
import RunCommandShell from "../components/terminal/RunCommandShell";
import FileManager from "../components/fileManager/FileManager";
import FileManagerReadFile from "../components/fileManager/ReadFile";
import Reboot from "../components/deviceOperations/Reboot";
import FileManagerUpload from "../components/fileManager/Upload";

const { Content } = Layout;
const { Text } = Typography;

// Define the content style of the page
const contentStyle: React.CSSProperties = {
  textAlign: "center",
  height: "100vh",
};

// Define the tab item interface
interface tabItem {
  label: React.ReactNode;
  key: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Home: React.FC = () => {
  // Define the notification api
  const [api, contextHolder] = notification.useNotification();

  // Define the mounted state
  // this state is used to check if the component is mounted or not
  const [mounted, setMounted] = useState(false);

  // Load the global states
  const currentBackend = useSelector((state: AppState) => state.currentBackend);
  const usbDeviceList = useSelector((state: AppState) => state.usbDeviceList);
  const browserSupported = useSelector(
    (state: AppState) => state.browserSupported,
  );
  // Define the dispatch function to be used to update the global states
  const dispatch = useDispatch();

  // handleUsbDeviceListUpdate() is used here when the this page is first mounted
  const handleUsbDeviceListUpdate = useCallback(async () => {
    // Add the current device to usbDeviceList
    const devices: AdbDaemonDevice[] =
      await AdbDaemonWebUsbDeviceManager.BROWSER!.getDevices();
    dispatch(updateUsbDeviceList(devices));
    console.log("devices", devices);
  }, [usbDeviceList]);

  useEffect(() => {
    console.log("Home component mounted/changed");

    if (!mounted) {
      // console.log("Home component first mounted");

      // Checks if the browser supports WebUSB, only at the first mount
      if (!AdbDaemonWebUsbDeviceManager.BROWSER) {
        // browser not supported
        dispatch(updateBrowserSupported(false));
        console.log("browser not supported");
        return;
      }

      handleUsbDeviceListUpdate();
      dispatch(updateBrowserSupported(true));
      setMounted(true);
    }

    return () => {
      console.log("Home component unmounted/changed");
    };
  }, [mounted]);

  // Define the bottom left area ref
  // We need this to get the height and width of the bottom left area
  // for the Terminal component
  const handleBottomLeftAreaRef = useRef<HTMLDivElement>(null);
  const [bottomLeftAreaHeight, setBottomLeftAreaHeight] = useState<number>(0);
  const [bottomLeftAreaWidth, setBottomLeftAreaWidth] = useState<number>(0);

  useEffect(() => {
    const handleBottomLeftAreaResize = () => {
      if (handleBottomLeftAreaRef.current) {
        const { height, width } =
          handleBottomLeftAreaRef.current.getBoundingClientRect();

        console.log("Bottom Left Area Height: ", height, "\tWidth: ", width);
        setBottomLeftAreaHeight(height);
        setBottomLeftAreaWidth(width);
      }
    };

    handleBottomLeftAreaResize(); // Initialize the height value on page load

    // Attach the resize event listener
    window.addEventListener("resize", handleBottomLeftAreaResize);

    return () => {
      // Cleanup: Remove the resize event listener when the component unmounts
      window.removeEventListener("resize", handleBottomLeftAreaResize);
    };
  }, [bottomLeftAreaHeight, bottomLeftAreaWidth]);

  return (
    <>
      {/* {contextHolder} */}
      <Space
        direction="vertical"
        style={{
          width: "100%",
        }}
      >
        <Layout
          style={{
            overflow: "auto",
          }}
        >
          <Content style={contentStyle}>
            <Row
              style={{
                marginTop: 30,
              }}
              gutter={20}
              // vertical gutter has bug:
              // https://github.com/ant-design/ant-design/issues/34342
            >
              <Col span={1}></Col>

              <Col span={11}>
                <Row>
                  <Col span={24}>
                    {/* <Space wrap> */}
                    <DeviceInfo
                      style={{
                        width: "100%",
                        textAlign: "left",
                      }}
                    />
                    {/* </Space> */}
                  </Col>

                  <Col
                    span={24}
                    style={{
                      marginTop: 20,
                      marginBottom: 15,
                    }}
                  >
                    <Space>
                      <Text>
                        Current Backend:
                        <Text code>
                          {currentBackend?.serial
                            ? currentBackend?.serial
                            : "None"}
                        </Text>
                      </Text>
                    </Space>
                  </Col>

                  <Col span={24}>
                    <Space>
                      <AddDevice />
                      <SelectDevice />
                      <DeviceConnection />
                      <Reboot />
                    </Space>
                  </Col>
                </Row>
              </Col>
              <Col span={11}>
                <FileManager />
              </Col>
              <Col span={1}></Col>
            </Row>

            <Row
              style={{
                marginTop: 30,
              }}
              gutter={20}
            >
              <Col span={1}></Col>
              <Col span={11} ref={handleBottomLeftAreaRef}>
                <Terminal
                  height={280}
                  width={bottomLeftAreaWidth - 70}
                  needCardWrapper={true}
                  style={{
                    width: bottomLeftAreaWidth - 20,
                  }}
                />
                <Space.Compact style={{ marginTop: 10 }}>
                  <ExitTerminal />
                  <ResetTerminal />
                  <RunCommandShell />
                </Space.Compact>
              </Col>
              <Col span={11}>
                <FileManagerReadFile />
                <Space.Compact style={{ marginTop: 20 }}>
                  <FileManagerUpload />
                </Space.Compact>
              </Col>
              <Col span={1}></Col>
            </Row>
          </Content>
        </Layout>
      </Space>
    </>
  );
};

export default Home;
