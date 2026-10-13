export interface ItemIconOverrides {
  iconVariant?: string;
}

export interface ItemIconTransformOptions {
  flipHorizontal?: boolean;
  rotation?: 90 | 180 | 270;
  rotate180?: boolean;
}

export function resolveItemIcon(
  itemType: { icon: string },
  item: ItemIconOverrides,
): string {
  return item.iconVariant ?? itemType.icon;
}

/** Apply local icon transforms before the legacy whole-world rotation. */
export function itemIconTransform({
  flipHorizontal = false,
  rotation,
  rotate180 = false,
}: ItemIconTransformOptions): string | undefined {
  const transforms = [
    rotate180 ? 'rotate(180deg)' : undefined,
    rotation == null ? undefined : `rotate(${rotation}deg)`,
    flipHorizontal ? 'scaleX(-1)' : undefined,
  ].filter((transform): transform is string => transform != null);
  return transforms.length > 0 ? transforms.join(' ') : undefined;
}
