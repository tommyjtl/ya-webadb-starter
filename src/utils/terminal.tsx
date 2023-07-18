/*
Migrated from @yume-chan/ya-webadb/demos/app
*/

// cspell: ignore scrollback
import React, { memo, useEffect, useRef } from "react";

import { AdbSubprocessProtocol, encodeUtf8 } from "@yume-chan/adb";
import { AutoDisposable } from "@yume-chan/event";
import {
  AbortController,
  Consumable,
  WritableStream,
} from "@yume-chan/stream-extra";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebglAddon } from "xterm-addon-webgl";

export class AdbTerminal extends AutoDisposable {
  private element = document.createElement("div");
  private output: string[] = [];

  public terminal: Terminal = new Terminal({
    allowProposedApi: true,
    allowTransparency: true,
    cursorStyle: "block",
    cursorBlink: true,
    fontFamily:
      'Berkeley Mono, Consolas, monospace, "Source Han Sans SC", "Microsoft YaHei"',
    fontSize: 13,
    letterSpacing: 1,
    scrollback: 9000,
    smoothScrollDuration: 50,
    overviewRulerWidth: 20,
  });

  // public searchAddon = new SearchAddon();
  public terminalOutput: string = "";

  private readonly fitAddon = new FitAddon();
  // private fitAddon = new FitAddon();

  private _socket: AdbSubprocessProtocol | undefined;
  public _socketAbortController: AbortController | undefined;

  private dispatch: any;

  // constructor
  public constructor() {
    super();

    // this.element
    this.element.style.width = "100%";
    this.element.style.height = "100%";
    this.element.style.overflow = "hidden";

    // this terminal
    // this.terminal.loadAddon(this.searchAddon);
    this.terminal.loadAddon(this.fitAddon);
  }

  public setDispatch(dispatch: any) {
    this.dispatch = dispatch;
  }

  // rest of the class

  public clear() {
    this.terminal.clear();
    // this.terminal.paste("ls -l\n");
    // this.terminal.writeln("ls -l");
  }

  public reset() {
    this.terminal.reset();
    this.fit();
  }

  public exit() {
    this.terminal.paste("exit");
  }

  public sendCommand(command: string) {
    this.terminal.paste(command);
  }

  public get socket() {
    return this._socket;
  }

  public set socket(value) {
    if (this._socket) {
      // Remove event listeners
      this.dispose();
      this._socketAbortController?.abort();
    }

    this._socket = value;
    // let commandOutput = ""; // Variable to store the command output

    if (value) {
      this.terminal.clear();
      this.terminal.reset();

      this._socketAbortController = new AbortController();

      // Consume the stdout stream and handle each chunk separately
      value.stdout
        .pipeTo(
          new WritableStream<Uint8Array>({
            write: (chunk) => {
              this.terminal.write(chunk);

              // Decode the chunk to obtain the output text
              const outputText = new TextDecoder().decode(chunk);

              this.terminalOutput += outputText; // Concatenate the output to the variable
              console.log(outputText);
              this.output.push(outputText);

              // if (this.dispatch) {
              //   if (this.isCommandRunning()) {
              //     this.dispatch(updateIsCommandRunning(true));
              //   } else {
              //     this.dispatch(updateIsCommandRunning(false));
              //   }
              // }
            },
          }),
          {
            signal: this._socketAbortController.signal,
          },
        )
        .catch(() => {});

      const _writer = value.stdin.getWriter();

      this.addDisposable(
        this.terminal.onData((data) => {
          const buffer = encodeUtf8(data);
          const output = new Consumable(buffer);
          _writer.write(output);
        }),
      );

      this.fit();
    }
  }

  public getTerminalOutput() {
    return this.terminalOutput;
  }

  public getLastOfTerminalOutput() {
    return this.output[this.output.length - 1];
  }

  public isCommandRunning() {
    // if terminal is connected to a backend
    // console.log("this.terminal", this.terminal.);

    if (this.terminal !== undefined && this.output.length > 0) {
      // if the last string of terminal output contains the substring `root@CocoPi`
      // console.log(this.getLastOfTerminalOutput());
      return !this.getLastOfTerminalOutput().includes("root@CocoPi");
    }
    return false;
  }

  public isTerminalBusy() {}

  public setContainer(container: HTMLDivElement) {
    // container.remove();//
    if (container.firstChild) {
      container.removeChild(container.firstChild!);
    }
    container.appendChild(this.element);
    if (!this.terminal.element) {
      void this.element.offsetWidth;
      this.terminal.open(this.element);
      // WebGL addon requires terminal to be attached to DOM
      this.terminal.loadAddon(new WebglAddon());
      // WebGL renderer ignores `cursorBlink` set before it initialized
      this.terminal.options.cursorBlink = true;
      this.fit();
    } //
  }

  public fit() {
    this.fitAddon.fit();
    // Resize remote terminal
    const { rows, cols } = this.terminal;
    this._socket?.resize(rows, cols);
  }
}

export function withDisplayName(name: string) {
  return <P extends object>(Component: React.FunctionComponent<P>) => {
    Component.displayName = name;
    return memo(Component);
  };
}

export function forwardRef<T>(name: string) {
  return <P extends object>(
    Component: React.ForwardRefRenderFunction<T, P>,
  ) => {
    return withDisplayName(name)(React.forwardRef(Component));
  };
}

export function useStableCallback<TArgs extends any[], R>(
  callback: (...args: TArgs) => R,
): (...args: TArgs) => R {
  const ref = useRef<(...args: TArgs) => R>(callback);

  useEffect(() => {
    ref.current = callback;
  });

  const wrapper = useRef((...args: TArgs) => {
    return ref.current.apply(undefined, args);
  });

  return wrapper.current;
}
