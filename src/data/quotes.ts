export const DAILY_QUOTES = [
  'Small steps still count. Begin where it feels lightest.',
  'One thing at a time is still a direction.',
  'You do not have to finish everything to have a good day.',
  'Slow is a pace too.',
  'Leave something for tomorrow and call it care.',
  'The work you did while tired still counts.',
  'A tidy list is not the same as a lived day.',
  'Start before you feel ready. Adjust as you go.',
  'Rest is part of the work, not a break from it.',
  'Not everything needs to be urgent to matter.',
  'You are allowed to do the easy one first.',
  'Progress hides in ordinary afternoons.',
  'Make the next step small enough to take.',
  'The plan can change. The direction can stay.',
  'Some days are for maintaining, not building.',
  'What you leave undone says something too.',
  'Attention is the real currency.',
  'Finish one thing fully before opening another.',
  'A calm day is still a productive day.',
  'You are not behind. You are here.',
  'Fewer things, done gently.',
  'The best task list is the one you can trust.',
  'Nothing is wasted if you learned where the time went.',
  'Begin again as often as you need.',
  'Leave room for the day to surprise you.',
  'You can care about the work and still stop at six.',
  'The smallest honest step beats the perfect plan.',
  'Some progress is invisible until later.',
  'Keep the promise you made to yourself, gently.',
  'Today does not have to be impressive to be enough.',
  'Do the next kind thing for your future self.',
];

/** One quote per calendar day, the same for everyone on that date. */
export function dailyQuote(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const dayIndex = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  const index = ((dayIndex % DAILY_QUOTES.length) + DAILY_QUOTES.length) % DAILY_QUOTES.length;
  return DAILY_QUOTES[index];
}
