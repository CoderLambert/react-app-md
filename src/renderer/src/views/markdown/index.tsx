import { useEffect, useRef, useState } from 'react'
import {
  getPanelElement,
  getPanelGroupElement,
  getResizeHandleElement,
  Panel,
  PanelGroup
} from 'react-resizable-panels'

import ResizeHandle from '@renderer/components/ResizeHandler'
import type { TreeProps } from 'antd'
import { transformedDirTreeInfo, DirTree } from './DirTree'
import MDViewer from '@renderer/components/Markdown/Viewer'

import { useMarkdownNoteStore } from '@renderer/store/useMarkdownNoteStore'

import { IFileNode } from '@common/types/md'

export function MarkdownPage(): JSX.Element {
  const refs = useRef<{
    groupElement: HTMLElement | null
    leftPanelElement: HTMLElement | null
    rightPanelElement: HTMLElement | null
    resizeHandleElement: HTMLElement | null
  }>({
    groupElement: null,
    leftPanelElement: null,
    rightPanelElement: null,
    resizeHandleElement: null
  })

  const [showFirstPanel, setShowFirstPanel] = useState(true)

  const {
    setRootDirPath,
    dirTreeInfo,
    setDirTreeInfo,
    noteDirPath,
    setNoteDirPath,
    fileText,
    setFileText
  } = useMarkdownNoteStore()

  function toggleFirstPanel(): void {
    setShowFirstPanel((v) => !v)
  }

  useEffect(() => {
    const groupElement = getPanelGroupElement('group')
    const leftPanelElement = getPanelElement('left-panel')
    const rightPanelElement = getPanelElement('main-panel')
    const resizeHandleElement = getResizeHandleElement('resize-handle')

    // If you want to, you can store them in a ref to pass around
    refs.current = {
      groupElement,
      leftPanelElement,
      rightPanelElement,
      resizeHandleElement
    }
    updateTreeDirInfo('D:/电子书/clean-arch/docs')
  }, [])

  async function openDir(): Promise<void> {
    const selectDir = await window.electron.ipcRenderer.invoke(
      'lz:open-dir-dialog',
      'openDir',
      'markdown'
    )
    updateTreeDirInfo(selectDir)
  }

  async function updateTreeDirInfo(selectDir: string): Promise<void> {
    setRootDirPath(selectDir)
    const res = await window.electron.ipcRenderer.invoke('lz:read-dir-with-ant-tree', selectDir, {
      excludeHidden: true,
      includeFileTypes: ['md', 'jpg']
    })
    setDirTreeInfo(transformedDirTreeInfo(res))
  }

  function getFolderPath(filePath: string): string {
    // 统一将反斜杠替换为正斜杠
    filePath = filePath.replace(/\\/g, '/')

    // 找到最后一个斜杠的位置
    const lastSlashIndex = filePath.lastIndexOf('/')

    // 如果没有斜杠，返回当前目录（'.'）
    if (lastSlashIndex === -1) {
      return '.'
    }

    // 截取文件夹路径
    const folderPath = filePath.substring(0, lastSlashIndex + 1)

    // 如果路径以斜杠结尾，直接返回
    if (folderPath.endsWith('/')) {
      return folderPath
    }

    // 否则，确保路径以斜杠结尾
    return folderPath + '/'
  }

  const onTreeNodeSelect: TreeProps['onSelect'] = async (_selectedKeys, info) => {
    const node = info.node as unknown as IFileNode // 类型断言
    if (node.type === 'file') {
      setNoteDirPath(getFolderPath(node.path))
      const fileText = await window.electron.ipcRenderer.invoke('lz:read-file-content', node.path)
      setFileText(fileText)
    }
  }

  return (
    <PanelGroup direction="horizontal" id="group">
      {showFirstPanel && (
        <>
          <Panel
            collapsible={true}
            id="left-panel"
            minSize={20}
            defaultSize={20}
            className="panel bg-blue-100 border-r border-[#dddddd] min-w-[100px]"
            order={1}
          >
            <div className="left-side-bar flex flex-col h-full">
              <div className="left-side-header gap-4 pt-4 px-2  w-full flex-col flex-center">
                <button
                  className="btn btn-outline btn-sm md:w-2/3 sm:w-full min-w-[100px]"
                  onClick={openDir}
                >
                  打开文件夹
                </button>
                <button className="btn btn-outline btn-sm md:w-2/3 sm:w-full min-w-[100px]">
                  打开文件
                </button>
              </div>

              <div
                style={{ height: 'calc(100% - 100px)' }}
                className="m-6 scrollbar-none overflow-scroll "
              >
                {dirTreeInfo.length > 0 && (
                  <DirTree onSelect={onTreeNodeSelect} dirTreeInfo={dirTreeInfo} />
                )}
              </div>
            </div>
          </Panel>
        </>
      )}
      <ResizeHandle onClick={toggleFirstPanel} id="resize-handle" />

      <Panel id="main-panel" minSize={40} className="panel bg-gray-100" order={2}>
        <div className="main-box flex-1 flex flex-col scrollbar-none pb-9 overflow-auto">
          <div className="header">
            <div onClick={toggleFirstPanel}></div>
          </div>

          <div className="flex-1 mt-4">
            {fileText && <MDViewer mdRaw={fileText} baseDir={noteDirPath}></MDViewer>}
          </div>
        </div>
      </Panel>
    </PanelGroup>
  )
}
