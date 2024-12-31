import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'

import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { test } from 'vitest'

test('md to html', () => {
  const mdText = `
# Markdown table test

<table>
  <tr>
    <td>GitHub beta blockquote-based</td>
    <td>MkDocs</td>
    <td>HTML</td>
  </tr>
  <tr>
    <td>1
    </td>
    <td>2</td>
    <td>3</td>
  </tr>
</table>
`
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, {
      allowDangerousHtml: true
    })
  processor.process(mdText).then((file) => {
    console.log(String(file)) // 检查输出的 HTML
  })
})

test('Toc ==>', () => {
  const mdText = `
# Pluto

Pluto is a dwarf planet in the Kuiper belt.

## toc

## Contents

## History

### Discovery

In the 1840s, Urbain Le Verrier used Newtonian mechanics to predict the
position of…

### Name and symbol

The name Pluto is for the Roman god of the underworld, from a Greek epithet for
Hades…

### Planet X disproved

Once Pluto was found, its faintness and lack of a viewable disc cast doubt…

## Orbit

Pluto’s orbital period is about 248 years…
`

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkToc, {
      maxDepth: 3 // 目录的最大深度
    }) // 自动生成目录
    .use(remarkRehype)
    .use(rehypeStringify)
  processor.process(mdText).then((file) => {
    console.log(String(file)) // 检查输出的 HTML
  })
})
