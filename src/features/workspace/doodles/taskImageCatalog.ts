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
  | 'walking'
  | 'run'
  | 'exercise'
  | 'cricket'
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'badminton'
  | 'volleyball'
  | 'swimming'
  | 'cycling'
  | 'hockey'
  | 'baseball'
  | 'tabletennis'
  | 'boxing'
  | 'golf'
  | 'sport'
  | 'reading'
  | 'writing'
  | 'plants'
  | 'car'
  | 'bill'
  | 'heatpump'
  | 'washer'
  | 'project'
  | 'repair'
  | 'travel';

export type TaskImageCategory = 'sport' | 'learning' | 'home' | 'health' | 'work' | 'life';

export interface TaskImageEntry {
  kind: DoodleKind;
  category: TaskImageCategory;
  keywords: RegExp;
  label: string;
  description: string;
}

export const TASK_IMAGE_CATALOG: TaskImageEntry[] = [
  {
    kind: 'laundry',
    category: 'home',
    keywords: /\b(laundry|wash(ing)? clothes|fold(ing)? clothes|iron(ing)?)\b/i,
    label: 'Laundry',
    description: 'Basket with clothes.',
  },
  {
    kind: 'groceries',
    category: 'home',
    keywords: /\b(grocer(y|ies)|buy food|supermarket|shopping|market)\b/i,
    label: 'Groceries',
    description: 'Shopping cart.',
  },
  {
    kind: 'dishes',
    category: 'home',
    keywords: /\b(dish(es)?|wash(ing)? dishes|utensils?|wash(ing)? utensils?|sink)\b/i,
    label: 'Dishes',
    description: 'Basket with plates and cups.',
  },
  {
    kind: 'writing',
    category: 'learning',
    keywords:
      /\b(write|writing|draft|drafts|journal|journals|notes?|notebook|pen|pencil|essay|essays|thesis|blog)\b/i,
    label: 'Writing',
    description: 'Paper and pencil.',
  },
  {
    kind: 'reading',
    category: 'learning',
    keywords: /\b(read|reading|book|books|novel|novels|article|articles|library)\b/i,
    label: 'Reading',
    description: 'Open book.',
  },
  {
    kind: 'dentist',
    category: 'health',
    keywords: /\b(dentist|dental|teeth|tooth|orthodont)\b/i,
    label: 'Dentist',
    description: 'Tooth and dental care.',
  },
  {
    kind: 'doctor',
    category: 'health',
    keywords: /\b(doctor|clinic|checkup|check-up|appointment|hospital|physician|health)\b/i,
    label: 'Doctor',
    description: 'Doctor with stethoscope.',
  },
  {
    kind: 'medicine',
    category: 'health',
    keywords: /\b(medicine|medicines|pill|pills|pharmacy|prescription)\b/i,
    label: 'Medicine',
    description: 'Medicine bottle and pills.',
  },
  {
    kind: 'cleaning',
    category: 'home',
    keywords: /\b(clean(ing)?|vacuum|sweep|mop|tidy|dust)\b/i,
    label: 'Cleaning',
    description: 'Cleaning supplies.',
  },
  {
    kind: 'cooking',
    category: 'home',
    keywords: /\b(cook(ing)?|meal prep|dinner|lunch|breakfast|bake)\b/i,
    label: 'Cooking',
    description: 'Cooking pot.',
  },
  {
    kind: 'walking',
    category: 'sport',
    keywords: /\b(walk|walking)\b/i,
    label: 'Walking',
    description: 'Person walking.',
  },
  {
    kind: 'run',
    category: 'sport',
    keywords: /\b(run|jog|jogging|5km|10km|marathon)\b/i,
    label: 'Running',
    description: 'Person running.',
  },
  {
    kind: 'exercise',
    category: 'sport',
    keywords: /\b(gym|yoga|workout|exercise|lift|lifting|weights|training)\b/i,
    label: 'Exercise',
    description: 'Person lifting weights.',
  },
  {
    kind: 'cricket',
    category: 'sport',
    keywords: /\b(cricket|wicket|wickets|batting|bowling)\b/i,
    label: 'Cricket',
    description: 'Cricket bat and ball.',
  },
  {
    kind: 'football',
    category: 'sport',
    keywords: /\b(football|soccer)\b/i,
    label: 'Football',
    description: 'Football.',
  },
  {
    kind: 'basketball',
    category: 'sport',
    keywords: /\b(basketball)\b/i,
    label: 'Basketball',
    description: 'Basketball.',
  },
  {
    kind: 'tabletennis',
    category: 'sport',
    keywords: /\b(table tennis|ping pong|ping-pong)\b/i,
    label: 'Table tennis',
    description: 'Paddle and ball.',
  },
  {
    kind: 'tennis',
    category: 'sport',
    keywords: /\b(tennis)\b/i,
    label: 'Tennis',
    description: 'Tennis racket and ball.',
  },
  {
    kind: 'badminton',
    category: 'sport',
    keywords: /\b(badminton|shuttlecock)\b/i,
    label: 'Badminton',
    description: 'Shuttlecock and racket.',
  },
  {
    kind: 'volleyball',
    category: 'sport',
    keywords: /\b(volleyball)\b/i,
    label: 'Volleyball',
    description: 'Volleyball.',
  },
  {
    kind: 'swimming',
    category: 'sport',
    keywords: /\b(swim|swimming|swimmer)\b/i,
    label: 'Swimming',
    description: 'Swimmer in the water.',
  },
  {
    kind: 'cycling',
    category: 'sport',
    keywords: /\b(cycle|cycling|bike|biking|bicycle)\b/i,
    label: 'Cycling',
    description: 'Person on a bicycle.',
  },
  {
    kind: 'hockey',
    category: 'sport',
    keywords: /\b(hockey|puck)\b/i,
    label: 'Hockey',
    description: 'Hockey stick and puck.',
  },
  {
    kind: 'baseball',
    category: 'sport',
    keywords: /\b(baseball|softball)\b/i,
    label: 'Baseball',
    description: 'Baseball and bat.',
  },
  {
    kind: 'boxing',
    category: 'sport',
    keywords: /\b(boxing|boxer|punching bag)\b/i,
    label: 'Boxing',
    description: 'Boxing glove.',
  },
  {
    kind: 'golf',
    category: 'sport',
    keywords: /\b(golf|golfing)\b/i,
    label: 'Golf',
    description: 'Golf flag and hole.',
  },
  {
    kind: 'sport',
    category: 'sport',
    keywords: /\b(sport|sports|athletics|tournament|league)\b/i,
    label: 'Sport',
    description: 'Sports medal for other sports.',
  },
  {
    kind: 'meeting',
    category: 'work',
    keywords: /\b(meeting|stand[- ]?up|sprint planning|demo prep|sync|retro|1:1)\b/i,
    label: 'Meeting',
    description: 'People at a meeting table.',
  },
  {
    kind: 'heatpump',
    category: 'home',
    keywords: /\b(heat pump|hvac|air conditioning|air conditioner|furnace|boiler)\b/i,
    label: 'Heat pump',
    description: 'Heat pump photo.',
  },
  {
    kind: 'washer',
    category: 'home',
    keywords: /\b(rubber washer|hose washer|hose connector|garden hose|faucet|tap|leak(ing)? hose)\b/i,
    label: 'Hose repair',
    description: 'Rubber washer photo.',
  },
  {
    kind: 'project',
    category: 'work',
    keywords:
      /\b(project|working on|work on|deliverable|proposal|client work|architecture|spec|discovery|migration|study|studying|assignment|homework|exam|course|lecture|class|revision|research|report|presentation|planning|plan|audit|publish|newsletter|email|review|budget|expense|analysis)\b/i,
    label: 'Project / desk work',
    description: 'Person at a desk with a laptop, paper, and pen.',
  },
  {
    kind: 'repair',
    category: 'home',
    keywords: /\b(fix|repair|replace|maintenance|gutter)\b/i,
    label: 'Repair',
    description: 'Repair tools.',
  },
  {
    kind: 'plants',
    category: 'home',
    keywords: /\b(plants?|garden|water(ing)? (the )?plants?|roof)\b/i,
    label: 'Plants',
    description: 'Potted plant.',
  },
  {
    kind: 'car',
    category: 'home',
    keywords: /\b(vehicle|car|registration|driving|licence|license)\b/i,
    label: 'Car',
    description: 'Car.',
  },
  {
    kind: 'bill',
    category: 'life',
    keywords: /\b(bill|invoice|pay|insurance|tax|subscription)\b/i,
    label: 'Bill',
    description: 'Receipt and payment.',
  },
  {
    kind: 'call',
    category: 'life',
    keywords: /\b(call|phone|ring)\b/i,
    label: 'Call',
    description: 'Phone handset.',
  },
  {
    kind: 'travel',
    category: 'life',
    keywords: /\b(travel|flight|trip|thanksgiving|vacation|holiday)\b/i,
    label: 'Travel',
    description: 'Airplane.',
  },
];

export const TASK_IMAGE_RULES = TASK_IMAGE_CATALOG;

export const DOODLE_LABELS = TASK_IMAGE_CATALOG.reduce(
  (labels, entry) => {
    labels[entry.kind] = { label: entry.label, description: entry.description };
    return labels;
  },
  {} as Record<DoodleKind, { label: string; description: string }>,
);
