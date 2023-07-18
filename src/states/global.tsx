/*
 * This file defines the global states of the app
 */
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  Adb,
  AdbDaemonDevice,
  AdbPacketData,
  LinuxFileType,
} from "@yume-chan/adb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

export type PacketLogItemDirection = "in" | "out";
export interface PacketLogItem extends AdbPacketData {
  direction: PacketLogItemDirection;

  timestamp?: Date;
  commandString?: string;
  arg0String?: string;
  arg1String?: string;
  payloadString?: string;
}

// Define the backend info type
export interface BackendInfoType {
  name: string;
  serial: string;
  manufacturerName: string;
}

// Define the file manager item type
export interface FileManagerItemType {
  key: React.Key; // unique key
  name: string; // file name
  size: BigInt; // file size
  mode: number; // file mode
  mtime: BigInt; // file modification time
  permission: number; // file permission
  type: LinuxFileType; // file type
  path: string; // file path
}

// Define the initial state interface
export interface AppState {
  // packet logs
  logs: PacketLogItem[];

  // device credential store & browser supported
  credentialStore: AdbWebCredentialStore;
  browserSupported: boolean;

  // backend relevant
  currentBackend: AdbDaemonDevice | undefined;
  backendInfo: BackendInfoType;
  isBackendConnecting: boolean;
  isBackendConnected: boolean;

  // device relevant
  currentDevice: Adb | undefined;
  usbDeviceList: AdbDaemonDevice[];
  browserSerialConnectionHistory: string[];

  // terminal relevant
  currentTerminalCommand: string;
  resetTerminal: boolean;
  isCommandRunning: boolean;
  setTerminalFit: boolean;

  // file manager shell relevant
  currentFileManagerShellCommand: string;
  resetFileManagerShell: boolean;
  isFileManagerShellRunning: boolean;
  setFileManagerShellFit: boolean;

  // outanderr terminal relevant
  currentOutAndErrShellCommand: string;
  resetOutAndErrShell: boolean;
  isOutAndErrShellRunning: boolean;
  setOutAndErrShellFit: boolean;

  // file manager general relevant
  isLoadingPath: boolean;
  setToReloadPath: boolean;
  defaultDeviceLoadingPath: string;
  currentDeviceLoadingPath: string;
  currentFileList: FileManagerItemType[];
  isDeviceUploadingFile: boolean;

  // file manager file reading relevant
  isReadingFile: boolean;
  readFileContent: string;

  // file manager file uploading relevant
  setToUploadFile: boolean;
  currentUploadingFileName: string;
  currentUploadingFile: File | undefined;
}

// Define the initial state
const initialState: AppState = {
  // packet logs
  logs: [],

  // device credential store & browser supported
  credentialStore: new AdbWebCredentialStore(),
  browserSupported: false,

  // backend relevant
  currentBackend: undefined,
  backendInfo: {
    name: "None",
    serial: "None",
    manufacturerName: "None",
  } as BackendInfoType,
  isBackendConnecting: false,
  isBackendConnected: false,

  // device relevant
  currentDevice: undefined,
  usbDeviceList: [],
  browserSerialConnectionHistory: ["", ""], // stores only 2 device serials

  // terminal relevant
  currentTerminalCommand: "",
  resetTerminal: false,
  isCommandRunning: false,
  setTerminalFit: false,

  // file manager shell relevant
  currentFileManagerShellCommand: "",
  resetFileManagerShell: false,
  isFileManagerShellRunning: false,
  setFileManagerShellFit: false,

  // outanderr terminal relevant
  currentOutAndErrShellCommand: "",
  resetOutAndErrShell: false,
  isOutAndErrShellRunning: false,
  setOutAndErrShellFit: false,

  // file manager general relevant
  isLoadingPath: false,
  setToReloadPath: false,
  defaultDeviceLoadingPath: "/",
  currentDeviceLoadingPath: "/",
  currentFileList: [],
  isDeviceUploadingFile: false,

  // file manager file reading relevant
  isReadingFile: false,
  readFileContent: "",

  // file manager file uploading relevant
  setToUploadFile: false,
  currentUploadingFileName: "",
  currentUploadingFile: undefined,
};

// Create a slice with reducers and actions
const appSlice = createSlice({
  name: "webadbStates",
  initialState,
  reducers: {
    // appendLog(), has two input parameters: direction and packet
    // direction: PacketLogItemDirection, packet: AdbPacketData
    appendLog(state, action: PayloadAction<PacketLogItem>) {
      const { direction, ...packet } = action.payload;
      state.logs.push({
        ...packet,
        direction,
        timestamp: new Date(),
        payload: packet.payload.slice(),
      } as PacketLogItem);
    },

    // device credential store & browser supported
    updateCredentialStore(state, action: PayloadAction<AdbWebCredentialStore>) {
      state.credentialStore = action.payload;
    },
    updateBrowserSupported(state, action: PayloadAction<boolean>) {
      state.browserSupported = action.payload;
    },

    // backend relevant
    updateCurrentBackend(
      state,
      action: PayloadAction<AdbDaemonDevice | undefined>,
    ) {
      state.currentBackend = action.payload;
    },
    updateBackendInfo(state, action: PayloadAction<BackendInfoType>) {
      state.backendInfo = action.payload;
    },
    updateIsBackendConnecting(state, action: PayloadAction<boolean>) {
      state.isBackendConnecting = action.payload;
    },
    updateIsBackendConnected(state, action: PayloadAction<boolean>) {
      state.isBackendConnected = action.payload;
    },

    // device relevant
    updateCurrentDevice(state, action: PayloadAction<Adb | undefined>) {
      state.currentDevice = action.payload;
    },
    updateUsbDeviceList(state, action: PayloadAction<AdbDaemonDevice[]>) {
      state.usbDeviceList = action.payload;
    },
    updateBrowserSerialConnectionHistory(state, action: PayloadAction<string>) {
      // update the first index of the array,
      // push the original first index to the second index
      state.browserSerialConnectionHistory[1] =
        state.browserSerialConnectionHistory[0];
      state.browserSerialConnectionHistory[0] = action.payload;
    },

    // terminal relevant
    updateCurrentTerminalCommand(state, action: PayloadAction<string>) {
      state.currentTerminalCommand = action.payload;
    },
    updateResetCommand(state, action: PayloadAction<boolean>) {
      state.resetTerminal = action.payload;
    },
    updateIsCommandRunning(state, action: PayloadAction<boolean>) {
      state.isCommandRunning = action.payload;
    },
    updateSetTerminalFit(state, action: PayloadAction<boolean>) {
      state.setTerminalFit = action.payload;
    },

    // file manager shell relevant
    updateCurrentFileManagerShellCommand(state, action: PayloadAction<string>) {
      state.currentFileManagerShellCommand = action.payload;
    },
    updateResetFileManagerShell(state, action: PayloadAction<boolean>) {
      state.resetFileManagerShell = action.payload;
    },
    updateIsFileManagerShellRunning(state, action: PayloadAction<boolean>) {
      state.isFileManagerShellRunning = action.payload;
    },
    updateSetFileManagerShellFit(state, action: PayloadAction<boolean>) {
      state.setFileManagerShellFit = action.payload;
    },

    // outanderr terminal relevant
    updateCurrentOutAndErrShellCommand(state, action: PayloadAction<string>) {
      state.currentOutAndErrShellCommand = action.payload;
    },
    updateResetOutAndErrShell(state, action: PayloadAction<boolean>) {
      state.resetOutAndErrShell = action.payload;
    },
    updateIsOutAndErrShellRunning(state, action: PayloadAction<boolean>) {
      state.isOutAndErrShellRunning = action.payload;
    },
    updateSetOutAndErrShellFit(state, action: PayloadAction<boolean>) {
      state.setOutAndErrShellFit = action.payload;
    },

    // file manager general relevant
    updateIsLoadingPath(state, action: PayloadAction<boolean>) {
      state.isLoadingPath = action.payload;
    },
    updateSetToReloadPath(state, action: PayloadAction<boolean>) {
      state.setToReloadPath = action.payload;
    },
    updateCurrentDeviceLoadingPath(state, action: PayloadAction<string>) {
      state.currentDeviceLoadingPath = action.payload;
    },
    updateCurrentFileList(state, action: PayloadAction<FileManagerItemType[]>) {
      state.currentFileList = action.payload;
    },
    updateIsDeviceUploadingFile(state, action: PayloadAction<boolean>) {
      state.isDeviceUploadingFile = action.payload;
    },

    // file manager file reading relevant
    updateIsReadingFile(state, action: PayloadAction<boolean>) {
      state.isReadingFile = action.payload;
    },
    updateReadFileContent(state, action: PayloadAction<string>) {
      state.readFileContent = action.payload;
    },

    // file manager file uploading relevant
    updateSetToUploadFile(state, action: PayloadAction<boolean>) {
      state.setToUploadFile = action.payload;
    },
    updateCurrentUploadingFileName(state, action: PayloadAction<string>) {
      state.currentUploadingFileName = action.payload;
    },
    updateCurrentUploadingFile(state, action: PayloadAction<File>) {
      state.currentUploadingFile = action.payload;
    },
  },
});

// Export actions from the slice
export const {
  // packet logs
  appendLog,

  // device credential store & browser supported
  updateCredentialStore,
  updateBrowserSupported,

  // backend relevant
  updateCurrentBackend,
  updateBackendInfo,
  updateIsBackendConnecting,
  updateIsBackendConnected,

  // device relevant
  updateCurrentDevice,
  updateUsbDeviceList,
  updateBrowserSerialConnectionHistory,

  // terminal relevant
  updateCurrentTerminalCommand,
  updateResetCommand,
  updateIsCommandRunning,
  updateSetTerminalFit,

  // file manager shell relevant
  updateCurrentFileManagerShellCommand,
  updateResetFileManagerShell,
  updateIsFileManagerShellRunning,
  updateSetFileManagerShellFit,

  // outanderr terminal relevant
  updateCurrentOutAndErrShellCommand,
  updateResetOutAndErrShell,
  updateIsOutAndErrShellRunning,
  updateSetOutAndErrShellFit,

  // file manager general relevant
  updateIsLoadingPath,
  updateSetToReloadPath,
  updateCurrentDeviceLoadingPath,
  updateCurrentFileList,
  updateIsDeviceUploadingFile,

  // file manager file reading relevant
  updateIsReadingFile,
  updateReadFileContent,

  // file manager file uploading relevant
  updateSetToUploadFile,
  updateCurrentUploadingFileName,
  updateCurrentUploadingFile,
} = appSlice.actions;

// Create the Redux store
export const store = configureStore({
  reducer: appSlice.reducer,
  // reducerPath: {
  //   'app': appSlice.reducer,
  // },

  // Working with Non-Serializable Data
  // - https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
  // - https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // https://github.com/maxmantz/redux-oidc/issues/169#issuecomment-693474948
      // add non-serializable states to here if needed
      serializableCheck: {
        ignoredActions: [
          "updateCredentialStore",
          "webadbStates/updateCredentialStore",
          "updateCurrentBackend",
          "webadbStates/updateCurrentBackend",
          "updateCurrentDevice",
          "webadbStates/updateCurrentDevice",
          "appendLog",
          "webadbStates/appendLog",
          "updateUsbDeviceList",
          "webadbStates/updateUsbDeviceList",
          "updateCurrentDeviceSync",
          "webadbStates/updateCurrentDeviceSync",
          "updateCurrentFileList",
          "webadbStates/updateCurrentFileList",
        ],
        ignoredPaths: [
          "credentialStore",
          "webadbStates.credentialStore",
          "currentBackend",
          "webadbStates.currentBackend",
          "currentDevice",
          "webadbStates.currentDevice",
          "logs",
          "webadbStates.logs",
          "usbDeviceList",
          "webadbStates.usbDeviceList",
          "currentDeviceSync",
          "webadbStates.currentDeviceSync",
          "currentFileList",
          "webadbStates.currentFileList",
        ],
      },
      // the following line should not be used in production
      // serializableCheck: false,
    }),
});
