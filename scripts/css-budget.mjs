import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = new URL('../src/css/components/', import.meta.url)
const LIMITS = { important: 45, doubled: 0, lines: 2844 }

const files = readdirSync(DIR).filter((name) => name.endsWith('.scss')).sort()
const rows = files.map((name) => {
  const source = readFileSync(new URL(name, DIR), 'utf8')
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, "$1")
  return {
    file: join('src/css/components', name),
    important: (code.match(/!\s*important/g) ?? []).length,
    doubled: (code.match(/\.(q-[\w-]+)\.\1(?![\w-])/g) ?? []).length,
    lines: source.split('\n').length - (source.endsWith('\n') ? 1 : 0),
  }
})

const total = rows.reduce(
  (sum, row) => ({ important: sum.important + row.important, doubled: sum.doubled + row.doubled, lines: sum.lines + row.lines }),
  { important: 0, doubled: 0, lines: 0 },
)

const width = Math.max(...rows.map((row) => row.file.length), 'total'.length)
const line = (file, important, doubled, lines) =>
  `${file.padEnd(width)}  ${String(important).padStart(10)}  ${String(doubled).padStart(7)}  ${String(lines).padStart(6)}`

console.log(line('file', '!important', 'doubled', 'lines'))
for (const row of rows) console.log(line(row.file, row.important, row.doubled, row.lines))
console.log(line('total', total.important, total.doubled, total.lines))
console.log(line('limit', LIMITS.important, LIMITS.doubled, LIMITS.lines))

const failures = Object.keys(LIMITS).filter((key) => total[key] > LIMITS[key])
for (const key of failures) console.error(`css budget exceeded: ${key} ${total[key]} > ${LIMITS[key]}`)
process.exit(failures.length ? 1 : 0)
