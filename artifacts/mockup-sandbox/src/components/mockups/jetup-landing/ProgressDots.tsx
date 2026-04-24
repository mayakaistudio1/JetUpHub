type ProgressDotsProps = {
  total: number;
  current: number;
  color: string;
};

export function ProgressDots({ total, current, color }: ProgressDotsProps) {
  return (
    <div
      data-testid="progress-dots"
      style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 5,
            width: i === current ? 22 : 5,
            borderRadius: 3,
            background: i <= current ? color : "rgba(255,255,255,0.15)",
            transition: "all 0.35s ease",
            boxShadow: i === current ? `0 0 8px ${color}80` : "none",
          }}
        />
      ))}
    </div>
  );
}
