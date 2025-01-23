import {TreeDataNode, TreeProps} from 'antd'
import React from "react";
import {DirTree} from '@renderer/components/Markdown/DirTree'

export interface IMdTreePanelProps {
  dirTreeInfo: TreeDataNode[],
  treeBoxRef: React.RefObject<HTMLDivElement>,
  openDir: () => Promise<void>,
  onTreeNodeSelect: TreeProps['onSelect']
}

export function MdTreePanel({
                               dirTreeInfo,
                               treeBoxRef,
                               openDir, onTreeNodeSelect
                             }: IMdTreePanelProps) {
  return (
    <>
      <div className="left-side-header px-6 py-2 w-full flex-col flex-center">
        <button className="btn btn-outline btn-sm  min-w-[100px]" onClick={openDir}>
          打开文件夹
        </button>
      </div>

      <div
        style={{height: 'calc(100% - 100px)'}}
        className="mx-6 my-2 scrollbar-none overflow-scroll"
        ref={treeBoxRef}
      >
        {dirTreeInfo.length > 0 && (
          <DirTree onSelect={onTreeNodeSelect} dirTreeInfo={dirTreeInfo}/>
        )}
      </div>
    </>
  )
}

