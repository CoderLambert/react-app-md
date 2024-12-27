import { Outlet } from 'react-router-dom'

export function DashBoardLayout(): JSX.Element {
  return (
    <div className="dash-board  w-full h-full">
      <Outlet />
    </div>
  )
}
