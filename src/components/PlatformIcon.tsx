import Image from "next/image";
import { platformLabel, type Platform } from "../lib/platform";

export default function PlatformIcon({
  platform,
  size = 16,
  className = "",
}: {
  platform: Platform;
  size?: number;
  className?: string;
}) {
  const src =
    platform === "instagram"
      ? "/images/icon-instagram.png"
      : "/images/icon-tiktok.png";

  return (
    <Image
      src={src}
      alt={platformLabel(platform)}
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
    />
  );
}
