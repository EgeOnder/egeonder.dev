import type { ImageProps } from "next/image";
import Image from "next/image";

export function T3ChatIcon(props: Partial<ImageProps>) {
  return <Image height={50} width={50} {...props} src="/icons/t3-chat.png" alt="T3 Chat" className="aspect-square" />;
}
