import { PluggableList, unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import gemoji from 'remark-gemoji'
// import remarkGithub from 'remark-github'
import remarkReferenceLinks from 'remark-reference-links'
import admonitions from 'remark-github-beta-blockquote-admonitions'

// import remarkTextr from 'remark-textr'
import rehypeMermaid from 'rehype-mermaid'
import rehypeKatex from 'rehype-katex'
// import toc from '@jsdevtools/rehype-toc'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'

import rehypeStringify from 'rehype-stringify'
import { transformerCopyButton } from '@rehype-pretty/transformers'
// import {
//   transformerNotationDiff,
//   transformerNotationHighlight,
//   transformerNotationWordHighlight,
//   transformerNotationFocus,
//   transformerNotationErrorLevel
// } from '@shikijs/transformers'

import { VFile } from 'remark-github/lib'

import rehypeImageAbsolutePath from '@renderer/plugins/rehype-img-links-path'
import rehypeMediumZoom from '@renderer/plugins/rehype-medium-zoom'

const cache = new Map<string, Promise<VFile>>()

export function useBuildFile(mdText: string, options: { baseDir: string }): Promise<VFile> {
  const cacheKey = `${mdText}-${options.baseDir}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }
  //[remarkGithub, {
  //  repository: 'user/project'
  //  }],
  const remarkPlugins: PluggableList = [remarkGfm, admonitions, gemoji, remarkReferenceLinks]

  const rehypePlugins: PluggableList = [
    [rehypeImageAbsolutePath, { absolutePath: options.baseDir }],
    rehypeSlug,
    rehypeKatex,
    rehypeMediumZoom,
    rehypeMermaid,
    [
      rehypePrettyCode,
      {
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
          // transformerNotationErrorLevel(),

          transformerCopyButton({
            visibility: 'hover',
            feedbackDuration: 3_000
          })
        ]
      }
    ],
    rehypeAutolinkHeadings
    // [toc, { position: 'beforeend' }]
  ]

  const processor = unified()
    .use(remarkParse)
    .use(remarkMath, {
      singleDollarTextMath: true,
      inlineMathDoubleDollar: false,
      blockMathSingleDollar: false
    })
    .use(remarkPlugins)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePlugins)
    .use(rehypeStringify, {
      allowDangerousHtml: true,
      closeSelfClosing: true
    })

  const promise = processor.process(mdText)
  cache.set(cacheKey, promise)
  return promise
}
