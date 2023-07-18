import { Button, Space, Typography, Popover, Row, Col } from "antd";

import {
  FileOutlined,
  FolderOpenTwoTone,
  DeleteOutlined,
  EllipsisOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import {
  FileManagerItemType,
  updateIsReadingFile,
  updateReadFileContent,
  updateSetToReloadPath,
  // file manager shell relevant
  updateCurrentDeviceLoadingPath,
  updateCurrentFileManagerShellCommand,
} from "../states/global";

import { AdbSync, LinuxFileType } from "@yume-chan/adb";
import {
  WrapConsumableStream,
  Consumable,
  InspectStream,
} from "@yume-chan/stream-extra";

import { createFileStream } from "./file";

export function renderFileName(
  value: string,
  record: FileManagerItemType,
  dispatch: any,
  sync: AdbSync,
) {
  const notCompatible = record.type !== 4;

  if (notCompatible) {
    return (
      <Button size="small" type="text" disabled={true}>
        {
          // if the file name is too long, show the first 30 characters and add "..."
          value.length > 25 ? value.slice(0, 25) + "..." : value
        }
      </Button>
    );
  }

  return (
    <>
      <Row>
        <Col span={20}>
          <Button
            size="small"
            type="text"
            onClick={() =>
              record.type === 4
                ? directoryOnClick(value, record, dispatch)
                : fileOnClick(value, record, dispatch, sync)
            }
          >
            {
              // if the file name is too long, show the first 30 characters and add "..."
              value.length > 25 ? value.slice(0, 25) + "..." : value
            }
          </Button>
        </Col>
        <Col style={{ textAlign: "right" }} span={4}>
          <Popover
            content={renderPopover(record, dispatch)}
            title={value}
            trigger="hover"
            mouseEnterDelay={0.2}
            mouseLeaveDelay={0.2}
            placement="right"
          >
            <Button
              style={{
                opacity: 0.6,
                marginLeft: 5,
              }}
              icon={<EllipsisOutlined />}
              size="small"
              type="default"
            ></Button>
          </Popover>
        </Col>
      </Row>
    </>
  );
}

function renderPopover(record: FileManagerItemType, dispatch: any) {
  const content = (
    <div>
      <Space direction="vertical">
        {/* <Button
          icon={<EditOutlined />}
          size="small"
          type="default"
          onClick={(e) => handleRenameFile(record, dispatch)}
        >
          Rename
        </Button> */}
        <Button
          icon={<CopyOutlined />}
          size="small"
          type="default"
          onClick={(e) => handleDuplicateFile(record, dispatch)}
          disabled={record.type === 4}
        >
          Duplicate
        </Button>
        <Button
          icon={<DeleteOutlined />}
          size="small"
          type="default"
          onClick={(e) => handleDeleteFile(record, dispatch)}
          disabled={record.type === 4}
          danger
        >
          Delete
        </Button>
      </Space>
    </div>
  );

  return content;
}

function handleDuplicateFile(record: FileManagerItemType, dispatch: any) {
  // duplicate the file by adding "_copy" to the file name (without the extension)
  // for example, if the file name is "test.py", the duplicated file name will be "test_copy.py"
  const duplicate_file_command = `cp ${record.path}/${record.name} ${
    record.path
  }/${record.name.slice(0, record.name.length - 3)}_copy.py`;

  console.log("clicked: duplicating file:", duplicate_file_command);
  dispatch(updateCurrentFileManagerShellCommand("\x1a"));
  dispatch(updateCurrentFileManagerShellCommand(duplicate_file_command));
  dispatch(updateSetToReloadPath(true));
}

// function handleRenameFile(record: FileManagerItemType, dispatch: any) {
//   const rename_file_command = `mv ${record.name} ${record.name}_renamed`;
//   console.log("clicked: renaming file:", rename_file_command);
// }

function handleDeleteFile(record: FileManagerItemType, dispatch: any) {
  if (record.type !== 4) {
    const delete_file_command = `rm ${record.path}/${record.name}`;
    console.log("clicked file:", delete_file_command);
    dispatch(updateCurrentFileManagerShellCommand("\x1a"));
    dispatch(updateCurrentFileManagerShellCommand(delete_file_command));
    dispatch(updateSetToReloadPath(true));
  } else {
    console.log("you can't delete a directory here");
    return;
  }
}

function directoryOnClick(
  value: string,
  record: FileManagerItemType,
  dispatch: any,
) {
  console.log("clicked a directory:", value);
  // update the current path to the new path by appending the directory name
  const newPath = record.path + "/" + value;
  dispatch(updateCurrentDeviceLoadingPath(newPath));
}

async function fileOnClick(
  value: string,
  record: FileManagerItemType,
  dispatch: any,
  sync: AdbSync,
) {
  console.log("clicked a file:", value);
  console.log("sync:", sync);
  console.log("record.path:", record.path + "/" + record.name);

  dispatch(updateIsReadingFile(true));

  const readFileContent =
    (await getFileContent(sync, record.path, record.name)) ?? "";
  // console.log("readFileContent:", readFileContent);

  dispatch(updateIsReadingFile(false));

  dispatch(updateReadFileContent(readFileContent));
}

// render a file icon or a directory icon
export function renderFileIcon(record: FileManagerItemType) {
  // shows a directory icon if text is "4", otherwise shows a file icon
  // console.log("record: ", record);

  const fileType = record.type;
  // const isPythonFile = record.isPythonFile;

  if (fileType === 4) {
    // if it's a directory
    return (
      <Space
        direction="vertical"
        style={{ width: "100%", textAlign: "center", paddingLeft: "4px" }}
      >
        <FolderOpenTwoTone style={{ opacity: 0.6 }} />
      </Space>
    );
  } else {
    // otherwise it's a file
    return (
      <Space
        direction="vertical"
        style={{
          width: "100%",
          textAlign: "center",
          paddingLeft: "4px",
        }}
      >
        <FileOutlined style={{ opacity: 0.25 }} />
      </Space>
    );
  }
}

// ---------------------------------------------------------

export function filterAndSortItems(
  fileManagerItems: FileManagerItemType[],
  excludedNames: string[],
): FileManagerItemType[] {
  // Filter out items with excluded names and hidden files
  const filteredItems = fileManagerItems.filter(
    (item) => !excludedNames.includes(item.name) && !item.name.startsWith("."),
  );

  // Sort the remaining items based on their type and file name ending with ".py"
  const sortedItems = filteredItems.sort((a, b) => {
    const typeOrder = {
      [LinuxFileType.Directory]: 0,
      [LinuxFileType.File]: 1,
      [LinuxFileType.Link]: 2,
    };

    const typeA = typeOrder[a.type];
    const typeB = typeOrder[b.type];

    // Sort by type first
    if (typeA !== typeB) {
      return typeA - typeB;
    }

    // For items with file type as "File"
    if (a.type === LinuxFileType.File) {
      const isPythonFileA = a.name.endsWith(".py");
      const isPythonFileB = b.name.endsWith(".py");

      // Sort by file extension ".py" first
      if (isPythonFileA !== isPythonFileB) {
        return isPythonFileA ? -1 : 1;
      }
    }

    // Sort by name as the last resort
    return a.name.localeCompare(b.name);
  });

  return sortedItems;
}

// upload file

export async function upload(
  file: File,
  path: string,
  sync: AdbSync,
  // dispatch: any,
): Promise<void> {
  try {
    const itemPath = resolvePath(path!, file.name);
    console.log("uploading file:", file.name, "to path:", itemPath);

    await sync.write({
      filename: itemPath,
      file: createFileStream(file)
        .pipeThrough(new WrapConsumableStream())
        .pipeThrough(new ProgressStream(() => {})),
      type: LinuxFileType.File,
      permission: 0o666,
      mtime: file.lastModified / 1000,
    });
  } catch (e: any) {
    // Handle any error that occurs during file upload
    console.log(e);
    throw e;
  } finally {
    sync.dispose();
    console.log("upload finished");
  }
}

// read the file content
export async function getFileContent(
  sync: any,
  filePath: string,
  fileName: string,
): Promise<string | undefined> {
  try {
    const fileStream = await getFileStream(sync, filePath, fileName);
    const reader = fileStream.getReader();
    const decoder = new TextDecoder();
    let content = "";

    const readChunk = async (): Promise<void> => {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      const chunk = decoder.decode(value);
      content += chunk;
      return readChunk();
    };

    await readChunk();

    return content;
  } catch (e: any) {
    // Handle any error that occurs during file retrieval
    console.log(e);
    return undefined;
  }
}

function getFileStream(sync: AdbSync, basePath: string, name: string) {
  return sync.read(resolvePath(basePath, name));
}

// Utility functions

function resolvePath(basePath: string, name: string): string {
  if (basePath === "/") {
    return `/${name}`;
  }

  const baseParts = basePath.split("/").filter(Boolean);
  const nameParts = name.split("/").filter(Boolean);
  const resolvedParts = [...baseParts, ...nameParts];

  const resolvedPath = `/${resolvedParts.join("/")}`;
  return resolvedPath;
}

function getBasename(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  const lastPart = parts[parts.length - 1];
  return lastPart;
}

// a function that converts raw storage size to human readable format (KB, MB, GB, etc.)
export function formatBytes(bytes: BigInt, decimals = 2): string {
  if (bytes === BigInt(0)) return "0 B";
  else if (bytes === BigInt(1)) return "1 Byte";
  const k = BigInt(1024);
  const dm = decimals < 0 ? BigInt(0) : BigInt(decimals);
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Number(
    Math.floor(Number(Math.log(Number(bytes)) / Math.log(Number(k)))),
  );
  return (
    parseFloat((Number(bytes) / Number(k ** BigInt(i))).toFixed(Number(dm))) +
    " " +
    sizes[i]
  );
}

// a function that converts timestamp to human readable format (YYYY-MM-DD HH:MM:SS)
export function formatTime(timestamp: BigInt): string {
  // console.log("timestamp", timestamp);

  const milliseconds = Number(timestamp) * 1000; // Convert nanoseconds to milliseconds
  const date = new Date(Number(milliseconds));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are zero indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
}

/**
 * Because of internal buffer of upstream/downstream streams,
 * the progress value won't be 100% accurate. But it's usually good enough.
 */
export class ProgressStream extends InspectStream<Consumable<Uint8Array>> {
  public constructor(onProgress: (value: number) => void) {
    let progress = 0;
    super((chunk) => {
      progress += chunk.value.byteLength;
      onProgress(progress);
    });
  }
}
