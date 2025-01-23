import { VscFile, VscFolder, VscRobot } from 'react-icons/vsc'
import SideBarMenu from './SideBarMenu'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SideBarMenuConfig = [
  {
    tip: '文件',
    path: '/markdown',
    icon: <VscFolder size={21} />
  },
  {
    tip: '豆包视觉',
    path: '/doubao-vision',
    icon: <VscRobot size={21} />
  },
  {
    tip: '代码片段',
    path: '/code',
    icon: <VscFile size={21} />
  }
]

export function SideBar(): JSX.Element {
  const [currentMenu, setCurrentMenu] = useState(0)
  const navigate = useNavigate()

  return (
    <div className="pt-4 flex flex-col w-16 h-screen p-[10px] border-r border-gray-300 gap-4">
      {SideBarMenuConfig.map((item, index) => (
        <SideBarMenu
          tip={item.tip}
          isActive={currentMenu === index}
          key={index}
          onClick={() => {
            setCurrentMenu(index)
            navigate(item.path)
          }}
        >
          {item.icon}
        </SideBarMenu>
      ))}
    </div>
  )
}
