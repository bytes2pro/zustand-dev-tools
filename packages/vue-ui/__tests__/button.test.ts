import { render, screen } from '@testing-library/vue';
import { VButton } from '../src';

describe('VButton (vue)', () => {
  it('renders slot', async () => {
    render(VButton, { slots: { default: 'Hello' } });
    expect(await screen.findByText('Hello')).toBeTruthy();
  });
});
