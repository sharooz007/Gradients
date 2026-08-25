export type ToolCategory =
  | 'shaders-gradients'
  | 'patterns-textures'
  | 'svg-shapes'
  | 'colors-palettes'
  | 'converters-utilities';

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  category: ToolCategory;
  categoryName: string;
  description: string;
  iconName: string;
  badge?: 'Popular' | 'Pro' | 'New' | 'Free';
  tags: string[];
}
