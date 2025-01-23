import { VscSearch, VscFiles } from 'react-icons/vsc'

export const menus = [
  {
    icon: VscFiles,
    name: '文件夹'
  },
  {
    icon: VscSearch,
    name: '搜索'
  }
]

export interface LeftSideBarPanelMenusProps {
  menu: string
  onClick: (name: string) => void
}

export function LeftSideBarPanelMenus({ menu, onClick }: LeftSideBarPanelMenusProps): JSX.Element {
  return (
    <>
      <div className="left-panel-menus flex gap-8 my-4 bg-white mx-6 p-2 rounded-md justify-center">
        {/* 动态渲染 menus 数组中的菜单项 */}
        {menus.map((item, index) => {
          const IconComponent = item.icon // 获取图标组件
          const isActive = menu === item.name
          return (
            <IconComponent
              key={index} // 使用 index 作为 key
              size={20}
              onClick={() => onClick(item.name)}
              className={` hover:cursor-pointer  ${isActive ? 'text-sky-300' : ''}`} // 添加样式
              title={item.name} // 添加 title 属性
            />
          )
        })}
      </div>
    </>
  )
}
