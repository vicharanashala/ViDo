import { describe, expect, it } from 'vitest';
import { localPathSuggestion, type PathAssistantMessage } from './pathAssistant';

describe('path assistant', () => {
  it('drafts a project path', () => {
    const suggestion = localPathSuggestion('Project submission', []);
    expect(suggestion.steps.length).toBeGreaterThan(3);
    expect(suggestion.steps.join(' ')).toMatch(/finished|version|submit/i);
  });

  it('responds to a request for smaller steps', () => {
    const messages: PathAssistantMessage[] = [
      { id: '1', role: 'user', text: 'This feels too big. Make it smaller.' },
    ];
    const suggestion = localPathSuggestion('Project submission', messages);
    expect(suggestion.reply).toMatch(/adjusted/i);
    expect(suggestion.steps[0]).toMatch(/one sentence/i);
  });
});
