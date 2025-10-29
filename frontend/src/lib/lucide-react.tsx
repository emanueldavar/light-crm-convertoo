import { forwardRef } from 'react';
import type { SVGProps, ReactElement } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

type IconComponent = (props: IconProps) => JSX.Element;

function createIcon(path: ReactElement | ReactElement[], viewBox = '0 0 24 24') {
  const Component = forwardRef<SVGSVGElement, IconProps>(({ size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {path}
    </svg>
  ));
  Component.displayName = 'LucideIcon';
  return Component as IconComponent;
}

export const CircleHelp = createIcon([
  <circle key="circle" cx="12" cy="12" r="10" />, 
  <path key="path1" d="M9.09 9a3 3 0 0 1 5.83 1c0 1.5-1 2.17-2 2.67" />, 
  <path key="path2" d="M12 17h.01" />
]);

export const Flame = createIcon([
  <path key="path" d="M12 2c2 3 5 4.5 5 8.5a5 5 0 1 1-10 0C7 6.5 10 5 12 2Z" />,
  <path key="path2" d="M12 11a2 2 0 0 0-2 2c0 1.05.4 2.05 1.1 2.83" />
]);

export const AlertTriangle = createIcon([
  <path key="path1" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />, 
  <line key="line1" x1="12" x2="12" y1="9" y2="13" />, 
  <line key="line2" x1="12" x2="12.01" y1="17" y2="17" />
]);

export const ShieldAlert = createIcon([
  <path key="path1" d="M12 22c6-2 8-5 8-10V5l-8-3-8 3v7c0 5 2 8 8 10" />, 
  <path key="path2" d="M12 8v4" />, 
  <path key="path3" d="M12 16h.01" />
]);

export type { IconProps as LucideProps };
