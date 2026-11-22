// A plain house in white on azulejo blue, for the app icons. No brand.
export function House({ size, rounded }: { size: number; rounded: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1f4fa3",
        borderRadius: rounded ? size * 0.22 : 0,
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Uma casa"
      >
        <path d="M3 11 12 3.5 21 11" />
        <path d="M5.5 9v11h13V9" />
        <path d="M10 20v-5.5h4V20" />
      </svg>
    </div>
  );
}
