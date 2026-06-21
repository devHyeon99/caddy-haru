export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontSize: 15,
        opacity: 0.7,
      }}
    >
      불러오는 중입니다...
    </div>
  );
}
