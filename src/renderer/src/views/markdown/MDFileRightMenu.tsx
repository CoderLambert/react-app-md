import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import React from 'react'

const items: MenuProps['items'] = [
  {
    label: '在文件资源管理器中展示',
    key: 'lz:open-file-explorer',
    extra: '⌘O'
  },
  {
    type: 'divider'
  },
  {
    label: '重命名',
    key: 'lz:rename-file',
    extra: '⌘N'
  },
  {
    label: '复制路径',
    key: 'lz:copy-path',
    extra: '⌘P'
  }
]

const MDFileRightMenu = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <Dropdown menu={{ items }} trigger={['contextMenu']}>
      {children}
    </Dropdown>
  )
}

export { MDFileRightMenu }
