import type { CSSProperties } from "react";
import styles from "./game-fit.module.css";
import { MatchClient } from "@/components/match-client";

export default function GamePage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <main
      className={`${styles.page} game-page`}
      style={
        {
          "--kh-map-url": `url('${basePath}/images/maps/kraeuterhoehle-reference.png')`
        } as CSSProperties
      }
    >
      <MatchClient />
    </main>
  );
}
