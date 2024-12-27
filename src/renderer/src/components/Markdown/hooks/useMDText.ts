import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeMermaid from 'rehype-mermaid'

import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
// import rehypeShiki from '@shikijs/rehype'
import rehypeImageAbsolutePath from './rehype-img-links-path.js'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import { transformerCopyButton } from '@rehype-pretty/transformers'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationFocus,
  transformerNotationErrorLevel
} from '@shikijs/transformers'

import { VFile } from 'remark-github/lib'

const cache = new Map<string, Promise<VFile>>()

export function useBuildFile(mdText: string, options: { baseDir: string }): Promise<VFile> {
  const cacheKey = `${mdText}-${options.baseDir}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeImageAbsolutePath, { absolutePath: options.baseDir })
    .use(rehypeSlug)
    .use(rehypeKatex)
    // 必须要放在 rehypeShiki\rehypePrettyCode 之前，否则会被因为之前插件渲染导致无法正确解析
    .use(rehypeMermaid)
    .use(rehypePrettyCode, {
      theme: {
        dark: 'material-theme-darker',
        light: 'material-theme-lighter'
      },
      keepBackground: false,

      transformers: [
        // TODO: 以下插件暂时无法使用，因为 shikijs 样式需要单独定义
        // transformerNotationDiff(),
        // transformerNotationHighlight(),
        // transformerNotationWordHighlight(),
        // transformerNotationFocus(),
        transformerNotationErrorLevel(),

        transformerCopyButton({
          visibility: 'always',
          feedbackDuration: 3_000
        })
      ]
    })

    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify)

  const promise = processor.process(mdText)
  cache.set(cacheKey, promise)
  return promise
}
