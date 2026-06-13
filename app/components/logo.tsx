import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 120, className }: LogoProps) {
  return (
    <Image
      src="/nyapui-radio.png"
      alt="Nyapui Radio"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
