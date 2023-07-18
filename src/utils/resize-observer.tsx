/*
Migrated from @yume-chan/ya-webadb/demos/app
*/

import { useEffect, useState } from "react";
import { useStableCallback, withDisplayName } from "./terminal";

export interface Size {
  width: number;
  height: number;
}

export interface ResizeObserverProps {
  onResize: (size: Size) => void;
}

const classes: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  visibility: "hidden",
};

export const ResizeObserver = withDisplayName("ResizeObserver")(({
  onResize,
}: ResizeObserverProps): JSX.Element | null => {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

  const handleResize = useStableCallback(() => {
    const { width, height } = iframe!.getBoundingClientRect();
    onResize({ width, height });
  });

  useEffect(() => {
    if (iframe) {
      void iframe.offsetLeft;
      iframe.contentWindow!.addEventListener("resize", handleResize);
      handleResize();
    }
  }, [iframe, handleResize]);

  return <iframe ref={setIframe} style={classes} />;
});
