'use client';

import { Icon, LayoutGrid, type LucideProps } from 'lucide-react';
import { bagHand, dress, jacket, shirtT, trousers } from '@lucide/lab';

type LabIconNode = React.ComponentProps<typeof Icon>['iconNode'];

function LabIcon({
  iconNode,
  className,
  strokeWidth = 1.75,
  ...rest
}: { iconNode: LabIconNode } & LucideProps) {
  return (
    <Icon
      iconNode={iconNode}
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden
      {...rest}
    />
  );
}

export function AllCategoryIcon(props: LucideProps) {
  return <LayoutGrid aria-hidden {...props} />;
}

export function TopsIcon(props: LucideProps) {
  return <LabIcon iconNode={shirtT} {...props} />;
}

export function BottomsIcon(props: LucideProps) {
  return <LabIcon iconNode={trousers} {...props} />;
}

export function DressIcon(props: LucideProps) {
  return <LabIcon iconNode={dress} {...props} />;
}

export function OuterwearIcon(props: LucideProps) {
  return <LabIcon iconNode={jacket} {...props} />;
}

export function AccessoriesIcon(props: LucideProps) {
  return <LabIcon iconNode={bagHand} {...props} />;
}

export const CATEGORY_ICONS = {
  all: AllCategoryIcon,
  tops: TopsIcon,
  bottoms: BottomsIcon,
  dresses: DressIcon,
  outerwear: OuterwearIcon,
  accessories: AccessoriesIcon,
} as const;
