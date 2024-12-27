import 'katex/dist/katex.css'
import 'github-markdown-css/github-markdown-light.css'
import { useBuildFile } from './hooks/useMDText'
import { useEffect, useState } from 'react'

export default function MDViewer({
  mdRaw,
  baseDir
}: {
  mdRaw: string
  baseDir: string
}): JSX.Element {
  const [file, setFile] = useState<string>('')

  useEffect(() => {
    const fetchFile = async (): Promise<void> => {
      const result = await useBuildFile(mdRaw, { baseDir: baseDir })
      setFile(String(result))
    }
    fetchFile()
  }, [mdRaw, baseDir])

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
