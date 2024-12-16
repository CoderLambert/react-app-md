import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
// import remarkGithub from 'remark-github'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import rehypeShiki from '@shikijs/rehype'
import mdRaw from './assets/test-markdown.md?raw'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationFocus,
  transformerNotationErrorLevel
} from '@shikijs/transformers'
import 'katex/dist/katex.css'
import 'github-markdown-css/github-markdown.css'
import { useState } from 'react'
import { addCopyButton } from 'shiki-transformer-copy-button'

import '@renderer/assets/shiki-custom.css'
const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(remarkMath)
  .use(rehypeKatex)
  .use(rehypeShiki, {
    inline: 'tailing-curly-colon',
    transformers: [
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerNotationWordHighlight(),
      transformerNotationFocus(),
      transformerNotationErrorLevel(),
      addCopyButton({
        toggle: 2000
      })

      // transformerColorizedBrackets()
    ],
    themes: {
      light: 'material-theme-lighter',
      dark: 'vitesse-dark'
    }
  })
  .use(rehypeStringify)
  .process(mdRaw)

console.log(String(file))

export default function App(): JSX.Element {
  const [copyStatus, setCopyStatus] = useState('Copy')

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleCopy = () => {
    navigator.clipboard.writeText(mdRaw).then(() => {
      setCopyStatus('Copied!')
      setTimeout(() => setCopyStatus('Copy'), 2000)
    })
  }

  return (
    <div>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: String(file) }} />
      <button onClick={handleCopy} style={{ marginTop: '10px' }}>
        {copyStatus}
      </button>
    </div>
  )
}
