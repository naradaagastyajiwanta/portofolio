import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={48} reverse duration={60} durationOnHover={25}>
        {logos.map((logo) => (
          <div
            key={`logo-${logo.alt}`}
            className="flex items-center justify-center h-10 md:h-12 w-auto px-2"
          >
            <img
              alt={logo.alt}
              className="h-full w-auto object-contain opacity-60 hover:opacity-100 transition-opacity filter dark:invert"
              height={logo.height || 40}
              loading="lazy"
              src={logo.src}
              width={logo.width || 120}
            />
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
