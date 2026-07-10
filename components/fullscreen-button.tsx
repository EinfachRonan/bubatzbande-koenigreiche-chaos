"use client";

import { useEffect, useState } from "react";

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const syncState = () => {
      setIsSupported(Boolean(document.documentElement.requestFullscreen));
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    syncState();
    document.addEventListener("fullscreenchange", syncState);

    return () => {
      document.removeEventListener("fullscreenchange", syncState);
    };
  }, []);

  async function toggleFullscreen() {
    if (!document.documentElement.requestFullscreen) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  }

  if (!isSupported) {
    return null;
  }

  return (
    <button type="button" className="ghost-button" onClick={() => void toggleFullscreen()}>
      {isFullscreen ? "Vollbild aus" : "Vollbild"}
    </button>
  );
}
