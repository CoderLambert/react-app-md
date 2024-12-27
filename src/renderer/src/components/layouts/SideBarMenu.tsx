export interface SideBarMenuProps {
  tip: string
  isActive: boolean
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
  children: React.ReactNode
}

const SideBarMenu = ({ tip, isActive, onClick, children }: SideBarMenuProps): JSX.Element => {
  const menuClass = `menu-box h-[44px] rounded w-[44px] flex-center hover:cursor-pointer ${
    isActive ? 'bg-slate-200' : 'bg-slate-50'
  }`

  return (
    <div className="tooltip tooltip-right" data-tip={tip} onClick={onClick}>
      <div className={menuClass}>{children}</div>
    </div>
  )
}

export default SideBarMenu
