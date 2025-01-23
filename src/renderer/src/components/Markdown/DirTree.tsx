import { FileImageTwoTone, FileMarkdownTwoTone, FolderOpenTwoTone } from '@ant-design/icons'
import { IFileNode } from '@common/types/md'
import { TreeDataNode, ConfigProvider, Tree, TreeProps } from 'antd'
import { ReactNode } from 'react'

const getIcon = (item: IFileNode): JSX.Element => {
  if (item.type === 'directory') {
    return <FolderOpenTwoTone />
  }

  if (item.ext === 'md') {
    return <FileMarkdownTwoTone />
  } else {
    return <FileImageTwoTone />
  }
}

export const transformedDirTreeInfo = (nodes: IFileNode[]): TreeDataNode[] => {
  return nodes.map((item) => {
    return {
      ...item,
      title: item.name,
      key: item.path,
      icon: getIcon(item),
      children: item.children && transformedDirTreeInfo(item.children)
    }
  })
}

export function DirTree({
  dirTreeInfo,
  onSelect,
  height = 650
}: {
  dirTreeInfo: TreeDataNode[]

  onSelect?: TreeProps['onSelect']

  height?: number
}): JSX.Element {
  return (
    <>
      {dirTreeInfo && (
        <ConfigProvider
          theme={{
            components: {
              Tree: {
                directoryNodeSelectedBg: '#27c76c',
                indentSize: 4
              }
            }
          }}
        >
          <Tree
            onSelect={onSelect}
            className="p-4 box-border"
            showLine={true}
            showIcon={false}
            treeData={dirTreeInfo}
            defaultExpandAll={true}
            height={height}
            titleRender={(node) => {
              const title = typeof node.title === 'function' ? node.title(node) : node.title
              const icon = node.icon

              return (
                <div className="flex items-center" title={node.key as string}>
                  {icon as ReactNode}
                  <span className="ml-2">{title}</span>
                </div>
              )
            }}
          />
        </ConfigProvider>
      )}
    </>
  )
}
