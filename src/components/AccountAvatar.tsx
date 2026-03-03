"use client";

import Image from "next/image";
import { useState } from "react";

const DEFAULT_AVATAR = "/images/default-avatar.svg";

export default function AccountAvatar({
  src,
  name,
  size = 40,
}: {
  src: string;
  name: string;
  size?: number;
}) {
  const [imgSrc, setImgSrc] = useState(
    src && src.startsWith("http") ? src : DEFAULT_AVATAR
  );

  return (
    <Image
      src={imgSrc}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover"
      onError={() => setImgSrc(DEFAULT_AVATAR)}
    />
  );
}
