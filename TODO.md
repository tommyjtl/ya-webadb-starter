# TODO

[[_TOC_]]

## General To-dos


- [ ] display error message when error occurs
- [ ] separated shell
  - [x] `Terminal`
  - [ ] `FileManagerShell`
  - [ ] `OutAndErrShell`
- [ ] notification center

### Less important

- [ ] localization setup (zh_CN / zh_TW / zh_HK / zh_MC / en_US)
- [ ] store common commands in a file

## Unsolved issues

- [ ] upload and run causes `read-only file system` error
```
Error: Read-only file system
    at Object.<anonymous> (response.js:20:1)
    at struct.js:185:1
    at async adbSyncReadResponse (response.js:26:1)
    at async pipeFileData (push.js:25:1)
    at async adbSyncPushV1 (push.js:45:1)
    at async AdbSync.write (sync.js:106:1)
    at async upload (fileManager.tsx:309:1)
    at async RunPythonCode.tsx:91:1
    at async RunPythonCode.tsx:161:1
```
```
/bin/sh: can't create /root/user_latest_code.err: Read-only file system
root@CocoPi:/#
```