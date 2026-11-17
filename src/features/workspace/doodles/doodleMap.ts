export type DoodleKind =
  | 'laundry'
  | 'groceries'
  | 'dishes'
  | 'dentist'
  | 'doctor'
  | 'medicine'
  | 'cleaning'
  | 'cooking'
  | 'call'
  | 'meeting'
  | 'exercise'
  | 'reading'
  | 'plants'
  | 'bill'
  | 'repair'
  | 'travel';

const RULES: { kind: DoodleKind; pattern: RegExp }[] = [
  { kind: 'laundry', pattern: /\b(laundry|wash(ing)? clothes|fold(ing)? clothes|iron(ing)?)\b/i },
  { kind: 'groceries', pattern: /\b(grocer(y|ies)|buy food|supermarket|shopping|market)\b/i },
  { kind: 'dishes', pattern: /\b(dish(es)?|wash(ing)? dishes|sink)\b/i },
  { kind: 'dentist', pattern: /\b(dentist|dental|teeth|tooth|orthodont)\b/i },
  {
    kind: 'doctor',
    pattern: /\b(doctor|clinic|checkup|check-up|appointment|hospital|physician|health)\b/i,
  },
  { kind: 'medicine', pattern: /\b(medicine|medicines|pill|pills|pharmacy|prescription)\b/i },
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
  {
    kind: 'bill',
    pattern: /\b(bill|invoice|pay|insurance|registration|tax|subscription)\b/i,
  },
  { kind: 'travel', pattern: /\b(travel|flight|trip|thanksgiving|vacation|holiday)\b/i },
];

export const DOODLE_LABELS: Record<DoodleKind, { label: string; description: string }> = {
  laundry: { label: 'Laundry', description: 'Clothesline with a shirt, trousers, sock, and basket.' },
  groceries: { label: 'Groceries', description: 'Paper bag with vegetables.' },
  dishes: { label: 'Dishes', description: 'Plate, bubbles, and a fork.' },
  dentist: { label: 'Dentist', description: 'Tooth and toothbrush.' },
  doctor: { label: 'Doctor', description: 'Medical bag and stethoscope.' },
  medicine: { label: 'Medicine', description: 'Pill bottle and tablets.' },
  cleaning: { label: 'Cleaning', description: 'Broom and dustpan.' },
  cooking: { label: 'Cooking', description: 'Pot with steam and a spoon.' },
  call: { label: 'Call', description: 'Phone handset with signal waves.' },
  meeting: { label: 'Meeting', description: 'People around a table.' },
  exercise: { label: 'Exercise', description: 'Dumbbell.' },
  reading: { label: 'Reading', description: 'Open book.' },
  plants: { label: 'Plants', description: 'Watering can and potted plant.' },
  bill: { label: 'Bill', description: 'Envelope with an invoice and a coin.' },
  repair: { label: 'Repair', description: 'Wrench.' },
  travel: { label: 'Travel', description: 'Plane.' },
};

export function detectDoodle(title: string): DoodleKind | null {
  for (const rule of RULES) {
    if (rule.pattern.test(title)) return rule.kind;
  }
  return null;
}
