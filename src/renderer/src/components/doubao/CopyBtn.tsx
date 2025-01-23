import { useState } from 'react'
import { TbCopy } from 'react-icons/tb'
import { HiMiniCheck } from 'react-icons/hi2'

export function CopyBtn({ textToCopy }: { textToCopy: string }): JSX.Element {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500) // 重置复制状态
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <>
      {isCopied ? (
        <div className="flex gap-2 p-2 hover:bg-gray-100 hover:cursor-pointer rounded-md">
          <HiMiniCheck size={22} className="text-green-400"></HiMiniCheck>
          {/* <span>已复制！</span> */}
        </div>
      ) : (
        <div className="flex gap-2 p-2 hover:bg-gray-100 rounded-md hover:cursor-pointer">
          <TbCopy size={22} title="复制" onClick={handleCopy} className="hover:text-gray-500 " />
        </div>
      )}
    </>
  )
}
