export interface PathAssistantMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
}

export interface PathSuggestion {
  reply: string;
  steps: string[];
}

const BASE_STEPS: { match: RegExp; steps: string[] }[] = [
  {
    match: /\b(project|submission|assignment|thesis|report|proposal)\b/i,
    steps: [
      'Define what a finished submission looks like',
      'List the inputs, references, and approvals you need',
      'Write a rough first version without polishing',
      'Review the gaps, risks, and missing pieces',
      'Polish and submit the final version',
    ],
  },
  {
    match: /\b(write|writing|essay|article|blog|journal)\b/i,
    steps: [
      'Choose the one idea the piece should leave behind',
      'Collect three notes or examples',
      'Write a rough opening and outline',
      'Draft the middle without editing',
      'Read it once, tighten it, and finish',
    ],
  },
  {
    match: /\b(study|exam|course|lecture|revision)\b/i,
    steps: [
      'Write down the exact topic to cover',
      'Gather the notes and examples you need',
      'Study one small section without distractions',
      'Close the notes and explain it back to yourself',
      'Mark what still feels unclear and stop',
    ],
  },
  {
    match: /\b(walk|walking|run|jog|exercise|workout|gym|yoga)\b/i,
    steps: [
      'Put on what you need and fill some water',
      'Warm up gently for three minutes',
      'Do the main block at an easy pace',
      'Cool down and stretch',
      'Mark it done — the length matters less than showing up',
    ],
  },
  {
    match: /\b(trip|travel|flight|holiday|vacation)\b/i,
    steps: [
      'Confirm the dates and destination',
      'Book the travel and stay',
      'List what needs to be packed',
      'Pack the essentials',
      'Check the final details and leave',
    ],
  },
];

const DEFAULT_STEPS = [
  'Define what done looks like',
  'Gather what you need',
  'Take the first small step',
  'Review the result',
  'Finish and close the loop',
];

function baseSteps(taskTitle: string): string[] {
  return BASE_STEPS.find((entry) => entry.match.test(taskTitle))?.steps ?? DEFAULT_STEPS;
}

function adjustSteps(steps: string[], message: string): string[] {
  const text = message.toLowerCase();

  if (/(smaller|overwhelm|too much|stuck|hard to start|break it down)/.test(text)) {
    return [
      'Open the task and write one sentence about the finish line',
      ...steps.slice(0, 3).map((step) => `Do a 10-minute version of: ${step}`),
      'Stop and decide the next small move',
    ];
  }

  if (/(fewer|shorter|quick|simple|too many)/.test(text)) {
    return steps.slice(0, 3);
  }

  if (/(research|look up|find|resources|examples)/.test(text)) {
    return [
      'Write the question you are trying to answer',
      'Collect two or three useful references',
      ...steps,
    ];
  }

  if (/(deadline|time|schedule|calendar)/.test(text)) {
    return [...steps, 'Block one realistic work session before the deadline'];
  }

  if (/(first step|start|begin|where do i start)/.test(text)) {
    return [steps[0], 'Set a five-minute timer and do only that', ...steps.slice(1)];
  }

  return steps;
}

export function localPathSuggestion(
  taskTitle: string,
  messages: PathAssistantMessage[]
): PathSuggestion {
  const lastUser = [...messages].reverse().find((message) => message.role === 'user');
  const steps = lastUser ? adjustSteps(baseSteps(taskTitle), lastUser.text) : baseSteps(taskTitle);
  const reply = lastUser
    ? 'I adjusted the path. You can keep talking, or approve these steps when they feel workable.'
    : `Here is a first path for “${taskTitle}”. Tell me if you want it smaller, shorter, or more research-heavy.`;

  return { reply, steps };
}

export async function askPathAssistant(
  taskTitle: string,
  messages: PathAssistantMessage[]
): Promise<PathSuggestion> {
  const endpoint = import.meta.env.VITE_PATH_ASSISTANT_URL;

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle, messages }),
      });
      if (response.ok) {
        const data = (await response.json()) as Partial<PathSuggestion>;
        if (typeof data.reply === 'string' && Array.isArray(data.steps)) {
          return {
            reply: data.reply,
            steps: data.steps.filter((step): step is string => typeof step === 'string'),
          };
        }
      }
    } catch {
      return localPathSuggestion(taskTitle, messages);
    }
  }

  return localPathSuggestion(taskTitle, messages);
}
