import Link from "next/link";
import styles from "./game-fit.module.css";
import { BackButton } from "@/components/back-button";
import { FullscreenButton } from "@/components/fullscreen-button";
import { MatchClient } from "@/components/match-client";

export default function GamePage() {
  return (
    <main className={`${styles.page} game-page`}>
      <div className={styles.utilityNav}>
        <Link href="/" className="secondary-button">
          Startseite
        </Link>
        <FullscreenButton />
        <BackButton className="ghost-button" />
      </div>
      <MatchClient />
    </main>
  );
}
