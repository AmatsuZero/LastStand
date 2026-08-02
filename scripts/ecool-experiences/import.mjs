import { createBrowserApi } from './browser-api.mjs';
import { importExperiences } from './importer.mjs';

/**
 * Run from the repository's browser-connected JavaScript session:
 *
 *   const { runExperienceImport } = await import(
 *     'file:///absolute/path/scripts/ecool-experiences/import.mjs'
 *   );
 *   await runExperienceImport({ tab, root: '/absolute/path/to/repository' });
 */
export function runExperienceImport({ tab, root, ...options }) {
  if (!tab) throw new TypeError('runExperienceImport 需要已登录 ECool 的 tab');
  return importExperiences({ api: createBrowserApi(tab), root, ...options });
}
