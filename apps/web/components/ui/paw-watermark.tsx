import { cn } from "@/lib/utils";

const PAW_PATH =
  "M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z";

interface PawWatermarkProps {
  size?: number;
  opacity?: number;
  rotate?: number;
  flip?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PawWatermark = ({
  size = 72,
  opacity = 0.045,
  rotate = 0,
  flip = false,
  strokeWidth = 1.25,
  className,
  style,
}: PawWatermarkProps) => {
  const transform =
    style?.transform ??
    ([rotate !== 0 && `rotate(${rotate}deg)`, flip && "scaleX(-1)"]
      .filter(Boolean)
      .join(" ") ||
      undefined);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="hsl(174 80% 45%)"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("absolute pointer-events-none select-none", className)}
      style={{ opacity, ...style, transform }}
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d={PAW_PATH} />
    </svg>
  );
};
