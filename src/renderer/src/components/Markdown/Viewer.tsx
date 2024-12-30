import 'katex/dist/katex.css'
import 'github-markdown-css/github-markdown-light.css'
import { useBuildFile } from './hooks/useMDText'
import { useEffect, useState } from 'react'
import '@renderer/assets/styles/markdown/preview.scss'
import mediumZoom from 'medium-zoom'
import 'medium-zoom/dist/style.css'

export default function MDViewer({
  mdRaw,
  baseDir
}: {
  mdRaw: string
  baseDir: string
}): JSX.Element {
  const [file, setFile] = useState<string>('')

  useEffect(() => {
    const fetchAndSetFile = async (): Promise<void> => {
      try {
        const result = await useBuildFile(mdRaw, { baseDir })
        setFile(String(result))
      } catch (error) {
        console.error('Failed to build file:', error)
        setFile('') // 或者可以设置一个错误状态
      }
    }

    fetchAndSetFile()

    document.querySelector('.main-box')?.scroll({
      left: 0,
      top: 0,
      behavior: 'smooth'
    })
  }, [mdRaw, baseDir])

  useEffect(() => {
    const zoom = mediumZoom('[data-zoomable]', {
      scrollOffset: 0,
      background: 'rgba(4, 4, 4, .8)'
    })
    // 清理函数
    return (): void => {
      zoom.detach()
    }
  })

  if (!file) {
    return <div className="w-full flex justify-center items-center">Loading...</div>
  }
  return (
    <div
      className="markdown-body max-w-clamp mx-auto my-0 p-8 rounded-lg"
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  )
}
