export type ToolCategory =
  | 'shaders-gradients'
  | 'patterns-textures'
  | 'colors-palettes'
  | 'svg-charts';

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  category: ToolCategory;
  categoryName: string;
  description: string;
  iconName: string;
  badge?: 'Popular' | 'New' | 'Pro' | 'Free';
  tags: string[];
}
