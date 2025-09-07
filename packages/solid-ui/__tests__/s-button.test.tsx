import { render, screen } from '@solidjs/testing-library';
import { SButton } from '../src';

describe('SButton (solid)', () => {
  it.skip('renders children', () => {
    render(() => <SButton>Solid</SButton>);
    expect(screen.getByText('Solid')).toBeInTheDocument();
  });
});
