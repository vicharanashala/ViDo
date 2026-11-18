import { TASK_IMAGE_RULES } from './taskImageCatalog';
import type { DoodleKind } from './taskImageCatalog';

export type { DoodleKind } from './taskImageCatalog';
export { DOODLE_LABELS, TASK_IMAGE_CATALOG } from './taskImageCatalog';

export function detectDoodle(title: string): DoodleKind | null {
  for (const rule of TASK_IMAGE_RULES) {
    if (rule.keywords.test(title)) return rule.kind;
  }
  return null;
}
