/*
Migrated from @yume-chan/ya-webadb/demos/app
*/

import {
  WrapReadableStream,
  WritableStream,
  type ReadableStream,
} from "@yume-chan/stream-extra";

export function createFileStream(file: File) {
  // `@types/node` typing messed things up
  // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/58079
  // TODO: demo: remove the wrapper after switching to native stream implementation.
  return new WrapReadableStream<Uint8Array>(
    file.stream() as unknown as ReadableStream<Uint8Array>,
  );
}
