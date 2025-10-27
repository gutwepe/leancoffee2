import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        insight: {
          primary: '#7A005C',
          secondary: '#4E003B',
          light: '#EED6E6'
        }
      }
    }
  },
  plugins: []
};

export default config;
