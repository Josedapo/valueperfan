import Image from "next/image";

export default function PlatformIcon({
  platform,
  size = 16,
  className = "",
}: {
  platform: "instagram" | "tiktok";
  size?: number;
  className?: string;
}) {
  const src =
    platform === "instagram"
      ? "/images/icon-instagram.png"
      : "/images/icon-tiktok.png";
  const alt = platform === "instagram" ? "Instagram" : "TikTok";

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
    />
  );
}
