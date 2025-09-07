import { fireEvent, render, screen } from '@testing-library/react';
import { ClientButton } from '../src';

describe('ClientButton (next)', () => {
  it('renders children', () => {
    render(<ClientButton>Next</ClientButton>);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('handles click', () => {
    const onClick = vi.fn();
    render(<ClientButton onClick={onClick}>Go</ClientButton>);
    fireEvent.click(screen.getByText('Go'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
