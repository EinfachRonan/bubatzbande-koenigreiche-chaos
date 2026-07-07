import styles from "./game-fit.module.css";
import { MatchClient } from "@/components/match-client";

export default function GamePage() {
  return (
    <main className={`${styles.page} game-page`}>
      <MatchClient />
    </main>
  );
}
