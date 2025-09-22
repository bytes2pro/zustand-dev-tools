/** @type {import('postcss-load-config').Config} */
import tailwindPlugin from '@tailwindcss/postcss';
const removeTailwindLayers = () => ({
  postcssPlugin: 'remove-tailwind-layers',
  AtRule: {
    layer: (atRule) => {
      // unwrap all @layer at-rules to plain CSS to avoid consumer-side Tailwind warnings
      if (atRule.nodes) atRule.replaceWith(atRule.nodes);
      else atRule.remove();
    },
  },
});
removeTailwindLayers.postcss = true;

const config = {
  plugins: [tailwindPlugin, removeTailwindLayers()],
};

export default config;
