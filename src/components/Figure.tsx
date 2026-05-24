import Image from 'next/image';

export function Figure({
  src,
  alt,
  caption,
  width = 640,
  height = 360,
  invertOnDark = false,
}: {
  src: string;
  alt: string;
  caption?: React.ReactNode;
  width?: number;
  height?: number;
  invertOnDark?: boolean;
}) {
  return (
    <figure className="my-8">
      <div
        className={`mx-auto overflow-hidden rounded-md-lg border border-md-outline-variant bg-white p-3 ${
          invertOnDark ? 'dark:bg-md-surface-container-high' : ''
        }`}
        style={{ maxWidth: width }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`mx-auto h-auto w-full ${
            invertOnDark ? 'dark:invert dark:hue-rotate-180' : ''
          }`}
          unoptimized
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-xs text-md-on-surface-variant">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
