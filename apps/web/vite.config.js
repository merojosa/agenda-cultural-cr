import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
	plugins: [sveltekit(), rawFonts(['.ttf'])]
});

function rawFonts(ext) {
	return {
	  name: 'vite-plugin-raw-fonts',
	  transform(_, id) {
		if (ext.some(e => id.endsWith(e))) {
		  const buffer = fs.readFileSync(id);
		  return {code: `export default ${JSON.stringify(buffer)}`, map: null};
		}
	  }
	};
  }
