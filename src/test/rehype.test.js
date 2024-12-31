import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'

import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { test } from 'vitest'

import toc from '@jsdevtools/rehype-toc'

test('toc', () => {
  const mdText = `# Pluto

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

Pluto’s orbital period is about 248 years…`

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(toc, {
      maxDepth: 3
    })
    .use(rehypeStringify)

  processor.process(mdText).then((file) => {
    console.log(String(file))
  })
})
