export interface ItemIconOverrides {
  iconVariant?: string;
}

export interface ItemIconTransformOptions {
  flipHorizontal?: boolean;
  rotate180?: boolean;
}

export function resolveItemIcon(
  itemType: { icon: string },
  item: ItemIconOverrides,
): string {
  return item.iconVariant ?? itemType.icon;
}

/** Apply an item's horizontal mirror first, then the legacy whole-world rotation. */
export function itemIconTransform({
  flipHorizontal = false,
  rotate180 = false,
}: ItemIconTransformOptions): string | undefined {
  const transforms = [
    rotate180 ? 'rotate(180deg)' : undefined,
    flipHorizontal ? 'scaleX(-1)' : undefined,
  ].filter((transform): transform is string => transform != null);
  return transforms.length > 0 ? transforms.join(' ') : undefined;
}
