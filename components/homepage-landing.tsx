import Link from "next/link";

const shellStyle = {
  minHeight: "100vh",
  position: "relative" as const,
  overflow: "hidden",
  backgroundColor: "#040907"
};

const imageStyle = {
  position: "absolute" as const,
  inset: 0,
  backgroundImage:
    'linear-gradient(180deg, rgba(6, 10, 8, 0.14), rgba(6, 10, 8, 0.3)), url("/images/home/homepage-reference.png")',
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover"
};

const shadeStyle = {
  position: "absolute" as const,
  inset: 0,
  background:
    "radial-gradient(circle at center, transparent 28%, rgba(3, 7, 5, 0.18) 58%, rgba(3, 7, 5, 0.66) 100%), linear-gradient(180deg, rgba(3, 7, 5, 0.12), rgba(3, 7, 5, 0.36))"
};

const contentStyle = {
  position: "relative" as const,
  zIndex: 1,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "flex-end" as const,
  alignItems: "center" as const,
  gap: "16px",
  padding: "24px 20px 72px"
};

const actionsStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "center" as const,
  gap: "16px"
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "220px",
  minHeight: "70px",
  padding: "16px 28px",
  borderRadius: "999px",
  border: "1px solid rgba(201, 164, 81, 0.72)",
  background: "linear-gradient(180deg, #d8b15b, #8a6528)",
  color: "#1a1306",
  fontWeight: 700,
  boxShadow: "0 12px 26px rgba(0, 0, 0, 0.3)",
  textDecoration: "none"
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: "rgba(7, 14, 10, 0.76)",
  color: "#f0e6c7",
  fontWeight: 400
};

export function HomepageLanding() {
  return (
    <main style={shellStyle}>
      <div style={imageStyle} aria-hidden="true" />
      <div style={shadeStyle} aria-hidden="true" />

      <div style={contentStyle}>
        <h1 className="sr-only">BubatzBande: Königreiche &amp; Chaos</h1>
        <div style={actionsStyle}>
          <Link href="/game" style={primaryButtonStyle}>
            Spiel starten
          </Link>
          <Link href="/cards" style={secondaryButtonStyle}>
            Kartenset ansehen
          </Link>
        </div>
      </div>
    </main>
  );
}
