const plannerDays = {
  Monday: { summary: 'A balanced start to the week.', tasks: [['9:00', 'Plan the week', 'sage'], ['14:00', 'Review priorities', 'sand']] },
  Tuesday: { summary: 'Time set aside for focused work.', tasks: [['10:00', 'Focus time', 'clay'], ['15:30', 'Team check-in', 'blue']] },
  Wednesday: { summary: 'Space for the things outside work.', tasks: [['11:00', 'Home project', 'sand']] },
  Thursday: { summary: 'A moment to reflect and adjust.', tasks: [['9:30', 'Review progress', 'blue'], ['13:00', 'Finish a task', 'sage']] },
  Friday: { summary: 'A lighter day to wrap up.', tasks: [['10:00', 'Plan next steps', 'sage']] },
};

const dayButtons = document.querySelectorAll('.planner-days button');
dayButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const day = button.dataset.day;
    const schedule = plannerDays[day];
    dayButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('planner-title').textContent = day;
    document.getElementById('planner-summary').textContent = schedule.summary;
    const tasks = document.getElementById('planner-tasks');
    tasks.replaceChildren(...schedule.tasks.map(([time, title, color]) => {
      const row = document.createElement('div');
      row.className = `planner-task ${color}`;
      const timeElement = document.createElement('time');
      timeElement.textContent = time;
      const label = document.createElement('span');
      label.textContent = title;
      row.append(timeElement, label);
      return row;
    }));
  });
});

document.getElementById('copy-setup')?.addEventListener('click', async () => {
  const prompt = document.getElementById('setup-prompt');
  const result = document.getElementById('copy-result');
  try {
    await navigator.clipboard.writeText(prompt.textContent);
    result.textContent = 'Copied.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(prompt);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    result.textContent = 'Prompt selected. Use your keyboard to copy.';
  }
});
