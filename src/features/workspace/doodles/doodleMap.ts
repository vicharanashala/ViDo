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
  | 'run'
  | 'exercise'
  | 'reading'
  | 'plants'
  | 'car'
  | 'bill'
  | 'heatpump'
  | 'washer'
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
  { kind: 'run', pattern: /\b(run|jog|jogging|walk|walking|5km|10km|marathon)\b/i },
  { kind: 'exercise', pattern: /\b(gym|yoga|workout|exercise|lift|lifting|weights|training)\b/i },
  { kind: 'reading', pattern: /\b(read|book|study|article)\b/i },
  { kind: 'heatpump', pattern: /\b(heat pump|hvac|air conditioning|air conditioner|furnace|boiler)\b/i },
  { kind: 'washer', pattern: /\b(rubber washer|hose washer|hose connector|garden hose|faucet|tap|leak(ing)? hose)\b/i },
  { kind: 'repair', pattern: /\b(fix|repair|replace|maintenance|gutter)\b/i },
  { kind: 'plants', pattern: /\b(plants?|garden|water(ing)? (the )?plants?|roof)\b/i },
  { kind: 'car', pattern: /\b(vehicle|car|registration|driving|licence|license)\b/i },
  {
    kind: 'bill',
    pattern: /\b(bill|invoice|pay|insurance|tax|subscription)\b/i,
  },
  { kind: 'travel', pattern: /\b(travel|flight|trip|thanksgiving|vacation|holiday)\b/i },
];

export const DOODLE_LABELS: Record<DoodleKind, { label: string; description: string }> = {
  laundry: { label: 'Laundry', description: 'Laundry basket.' },
  groceries: { label: 'Groceries', description: 'Shopping cart.' },
  dishes: { label: 'Dishes', description: 'Plate with cutlery.' },
  dentist: { label: 'Dentist', description: 'Dentist illustration.' },
  doctor: { label: 'Doctor', description: 'Stethoscope.' },
  medicine: { label: 'Medicine', description: 'Pill.' },
  cleaning: { label: 'Cleaning', description: 'Broom.' },
  cooking: { label: 'Cooking', description: 'Cooking pan.' },
  call: { label: 'Call', description: 'Telephone.' },
  meeting: { label: 'Meeting', description: 'People.' },
  run: { label: 'Run / walk', description: 'Person running.' },
  exercise: { label: 'Exercise', description: 'Person lifting weights.' },
  reading: { label: 'Reading', description: 'Open book.' },
  plants: { label: 'Plants', description: 'Potted plant.' },
  car: { label: 'Car / registration', description: 'Car.' },
  bill: { label: 'Bill', description: 'Receipt.' },
  heatpump: { label: 'Heat pump / HVAC', description: 'Heat pump unit.' },
  washer: { label: 'Rubber washer / hose', description: 'Rubber washer and hose connector.' },
  repair: { label: 'Repair', description: 'Wrench.' },
  travel: { label: 'Travel', description: 'Airplane.' },
};

export function detectDoodle(title: string): DoodleKind | null {
  for (const rule of RULES) {
    if (rule.pattern.test(title)) return rule.kind;
  }
  return null;
}
