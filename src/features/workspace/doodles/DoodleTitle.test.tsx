import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DoodleTitle } from './DoodleTitle';

describe('DoodleTitle', () => {
  it('renders a doodle instead of letters for recognised tasks', () => {
    render(<DoodleTitle title="Making laundry" />);

    expect(screen.getByRole('img', { name: /making laundry/i })).toBeInTheDocument();
    expect(screen.queryByText('Making laundry')).not.toBeInTheDocument();
  });

  it('falls back to text for unrecognised tasks', () => {
    render(<DoodleTitle title="Review Q4 budget" />);

    expect(screen.getByText('Review Q4 budget')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /review q4 budget/i })).not.toBeInTheDocument();
  });
});
