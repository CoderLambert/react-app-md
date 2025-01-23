import {useState} from "react";

export interface IMdSearchPanelProps {
  rootPath: string,
}

// 搜索根路径
// 文件类型
// 关键词
// 正则标志

// 依赖 node-rg vscode-rg
export function MdSearchPanel({
                                rootPath,
                              }: IMdSearchPanelProps) {

  // @ts-ignore
  const [fileTypePattern, setFileTypePattern] = useState('')

  // @ts-ignore
  const [searchWordPattern, setSearchWordPattern] = useState('')
  // @ts-ignore
  const [regFlag, setRegFlag] = useState('')
  return (
    <>
      <div className="left-side-header px-6 py-2 w-full flex-col flex-center">
        <div className="content">
          {rootPath} - {fileTypePattern} - {searchWordPattern} - {regFlag}
        </div>
      </div>

      <div
        style={{height: 'calc(100% - 100px)'}}
        className="mx-6 my-2 scrollbar-none overflow-scroll"
      >
      </div>
    </>
  )
}

