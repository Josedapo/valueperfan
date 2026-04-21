"use client";

import Image from "next/image";
import { useState } from "react";
import brokenAvatars from "../data/broken-avatars.json";

const DEFAULT_AVATAR = "/images/default-avatar.svg";
const BROKEN_IDS = new Set(brokenAvatars.ids);

function isBroken(src: string): boolean {
  const match = src.match(/\/clubs\/([^/?&#]+)/);
  return match ? BROKEN_IDS.has(match[1]) : false;
}

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
    src && src.startsWith("http") && !isBroken(src) ? src : DEFAULT_AVATAR
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
