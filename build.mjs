// Renders resume.json into index.html, with style.css inlined
import { readFileSync, writeFileSync } from 'node:fs'

const r = JSON.parse(readFileSync(new URL('resume.json', import.meta.url)))
const css = readFileSync(new URL('style.css', import.meta.url), 'utf8')

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
// inline [text](url) links, the only markup resume.json uses
const md = s => esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
const link = (name, url) => url && !name.includes('](') ? `<a href="${esc(url)}">${md(name)}</a>` : md(name)
const date = d => d
  ? `<time datetime="${d}">${new Date(d).toLocaleString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</time>`
  : 'Present'

const svg = (body, attrs = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" ${attrs} aria-hidden="true">${body}</svg>`
const icons = {
  location: svg('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
  email: svg('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'),
  phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  url: svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
  github: svg('<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>'),
  x: svg('<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>', 'fill="currentColor" stroke="none"'),
  languages: svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>')
}

const list = items => items?.length ? `<ul>${items.map(h => `<li><p>${md(h)}</p></li>`).join('')}</ul>` : ''

// header of a job, school or project: title, then where and when
const article = (title, where, from, to, body) => `
<article>
  <header>
    <h4>${title}</h4>
    ${where || from ? `<div class="meta">
      <div><strong>${where}</strong></div>
      ${from ? `<div>${date(from)} – ${date(to)}</div>` : ''}
    </div>` : ''}
  </header>
  ${body}
</article>`

const section = (id, title, body, cls = 'stack') =>
  `<section id="${id}"><h3>${title}</h3><div class="${cls}">${body}</div></section>`

const job = w => article(esc(w.position), link(w.name, w.url), w.startDate, w.endDate,
  (w.summary ? `<p>${md(w.summary)}</p>` : '') + list(w.highlights))

const { basics: b } = r
const country = new Intl.DisplayNames(['en'], { type: 'region' }).of(b.location.countryCode)
const languages = r.languages.map(l => ['native', 'fluent'].includes(l.fluency) ? l.language : `${l.language} (${l.fluency})`).join(', ')
const contacts = [
  [icons.location, esc(`${b.location.city}, ${country}`)],
  [icons.email, `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>`],
  [icons.phone, `<a href="tel:${b.phone.replace(/[^+\d]/g, '')}">${esc(b.phone)}</a>`],
  [icons.url, `<a href="${esc(b.url)}">${esc(b.url.replace(/^https?:\/\//, ''))}</a>`],
  ...b.profiles.map(p => [icons[p.network.toLowerCase()], `<a href="${esc(p.url)}">${esc(p.username)}</a>`]),
  [icons.languages, esc(languages)]
]

// roles told by a summary alone are compressed into Earlier experience
const work = r.work.filter(w => w.highlights?.length), earlier = r.work.filter(w => !w.highlights?.length)

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(`${b.name} | ${b.label}`)}</title>
<meta name="author" content="${esc(b.name)}">
<meta name="description" content="${esc(b.summary)}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- generated from resume.json by build.mjs: edit those, not this file -->
<style>
${css}</style>
</head>
<body>
<header class="masthead">
  <div><h1>${esc(b.name)}</h1><h2>${esc(b.label)}</h2></div>
  <article><p>${md(b.summary)}</p></article>
  <ul class="icon-list">${contacts.map(([i, c]) => `<li>${i}${c}</li>`).join('')}</ul>
</header>
${section('work', 'Work', work.map(job).join(''))}
${section('projects', 'Open source', r.projects.map(p => article(link(p.name, p.url), '', null, null, `<p>${md(p.description)}</p>` + list(p.highlights))).join(''))}
${section('earlier', 'Earlier experience', earlier.map(job).join(''))}
${section('education', 'Education', r.education.map(e => article(esc(e.institution), esc(e.studyType), e.startDate, e.endDate,
  `<p>${esc([e.area, ...e.courses ?? []].join(' · '))}</p>`)).join(''))}
${section('skills', 'Skills', r.skills.map(s => `<div><h4>${esc(s.name)}</h4><ul class="tag-list">${s.keywords.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>`).join(''), 'grid-list')}
</body>
</html>
`

writeFileSync(new URL('index.html', import.meta.url), html)
