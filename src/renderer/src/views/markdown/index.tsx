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
import type { IFileNode } from '@common/types/md'

import { transformedDirTreeInfo } from '@renderer/components/Markdown/DirTree'
import MDViewer from '@renderer/components/Markdown/Viewer'

import { useMarkdownNoteStore } from '@renderer/store/useMarkdownNoteStore'

import { LeftSideBarPanelMenus } from '@renderer/components/layouts/LeftSideBarPanelMenus'
import { MdTreePanel } from '@renderer/components/layouts/MdTreePanel'
import { MdSearchPanel } from '@renderer/components/layouts/MdSearchPanel'

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
    rootDirPath,
    setRootDirPath,
    dirTreeInfo,
    setDirTreeInfo,
    noteDirPath,
    setNoteDirPath,
    fileText,
    setFileText,
    leftSideBarMenu,
    setLeftSideBarMenu
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
    if (treeBoxRef.current) {
      setTreeBoxHeight(treeBoxRef.current.offsetHeight)
    }
  }, [])

  const treeBoxRef = useRef<HTMLDivElement>(null)
  const [, setTreeBoxHeight] = useState(0)

  async function openDir(): Promise<void> {
    const selectDir = await window.electron.ipcRenderer.invoke(
      'lz:open-dir-dialog',
      'openDir',
      'markdown'
    )
    await updateTreeDirInfo(selectDir)
  }

  async function updateTreeDirInfo(selectDir: string): Promise<void> {
    setRootDirPath(selectDir)
    const res = await window.electron.ipcRenderer.invoke('lz:read-dir-with-ant-tree', selectDir, {
      excludeHidden: true,
      includeFileTypes: ['.md']
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
              <LeftSideBarPanelMenus
                menu={leftSideBarMenu}
                onClick={setLeftSideBarMenu}
              ></LeftSideBarPanelMenus>

              {leftSideBarMenu === '文件夹' && (
                // @ts-ignore
                <MdTreePanel
                  dirTreeInfo={dirTreeInfo}
                  treeBoxRef={treeBoxRef}
                  openDir={openDir}
                  onTreeNodeSelect={onTreeNodeSelect}
                >
                  {' '}
                </MdTreePanel>
              )}

              {leftSideBarMenu === '搜索' && <MdSearchPanel rootPath={rootDirPath}></MdSearchPanel>}
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
