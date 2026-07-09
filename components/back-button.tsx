"use client";

type BackButtonProps = {
  className?: string;
  fallbackHref?: string;
  label?: string;
};

export function BackButton({
  className,
  fallbackHref = "/",
  label = "Zurueck"
}: BackButtonProps) {
  function handleBack() {
    if (typeof window === "undefined") {
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = fallbackHref;
  }

  return (
    <button type="button" className={className} onClick={handleBack}>
      {label}
    </button>
  );
}
