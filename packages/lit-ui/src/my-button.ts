import { LitElement, css, html } from 'lit';

export class MyButton extends LitElement {
  static properties = {
    variant: { type: String },
  };

  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' = 'primary';

  static styles = css`
    :host {
      display: inline-block;
    }
  `;

  render() {
    const base =
      'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-3 py-2';
    const variants: Record<string, string> = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    };
    return html`<button class="${base} ${variants[this.variant] ?? variants.primary}">
      <slot></slot>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-button': MyButton;
  }
}

customElements.define('my-button', MyButton);
