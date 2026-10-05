# CV

[resume.json](resume.json) follows the [JSON Resume schema](https://jsonresume.org/schema/); text may hold `[text](url)` links. [build.mjs](build.mjs) renders it into [index.html](index.html) with [style.css](style.css) inlined. Roles with highlights go under Work, roles with a summary alone under Earlier experience.

Run `npm run build` to regenerate `index.html` and [resume.pdf](resume.pdf). Edit `resume.json` and `style.css`, never `index.html`.
