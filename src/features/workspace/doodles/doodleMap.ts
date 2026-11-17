export type DoodleKind =
  | 'laundry'
  | 'groceries'
  | 'dishes'
  | 'cleaning'
  | 'cooking'
  | 'call'
  | 'meeting'
  | 'exercise'
  | 'reading'
  | 'plants'
  | 'bill'
  | 'repair'
  | 'health'
  | 'travel';

const RULES: { kind: DoodleKind; pattern: RegExp }[] = [
  { kind: 'laundry', pattern: /\b(laundry|wash(ing)? clothes|fold(ing)? clothes|iron(ing)?)\b/i },
  { kind: 'groceries', pattern: /\b(grocer(y|ies)|buy food|supermarket|shopping|market)\b/i },
  { kind: 'dishes', pattern: /\b(dish(es)?|wash(ing)? dishes|sink)\b/i },
  { kind: 'cleaning', pattern: /\b(clean(ing)?|vacuum|sweep|mop|tidy|dust)\b/i },
  { kind: 'cooking', pattern: /\b(cook(ing)?|meal prep|dinner|lunch|breakfast|bake)\b/i },
  {
    kind: 'meeting',
    pattern: /\b(meeting|stand[- ]?up|sprint planning|demo prep|sync|retro|1:1)\b/i,
  },
  { kind: 'call', pattern: /\b(call|phone|ring)\b/i },
  { kind: 'exercise', pattern: /\b(run|jog|walk|gym|yoga|workout|exercise|5km|10km)\b/i },
  { kind: 'reading', pattern: /\b(read|book|study|article)\b/i },
  { kind: 'repair', pattern: /\b(fix|repair|replace|leak|hose|maintenance|hvac|gutter)\b/i },
  { kind: 'plants', pattern: /\b(plants?|garden|water(ing)? (the )?plants?|roof)\b/i },
  { kind: 'bill', pattern: /\b(bill|invoice|pay|renew|insurance|registration|tax|subscription)\b/i },
  { kind: 'health', pattern: /\b(doctor|dentist|clinic|appointment|medicine|health|checkup)\b/i },
  { kind: 'travel', pattern: /\b(travel|flight|trip|thanksgiving|vacation|holiday)\b/i },
];

export function detectDoodle(title: string): DoodleKind | null {
  for (const rule of RULES) {
    if (rule.pattern.test(title)) return rule.kind;
  }
  return null;
}
