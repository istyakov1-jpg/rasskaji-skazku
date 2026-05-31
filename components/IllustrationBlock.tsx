'use client';

import Image from 'next/image';

interface Props {
  imageUrl: string;
}

export default function IllustrationBlock({ imageUrl }: Props) {
  return (
    <div className="fairy-card overflow-hidden p-0">
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden">
        <Image
          src={imageUrl}
          alt="Иллюстрация к сказке"
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </div>
  );
}