import { SideBar } from '@renderer/components/layouts/SideBar'
import { DashboardRoute } from '@renderer/routers'
import { Outlet } from 'react-router-dom'

export default function App(): JSX.Element {
  return (
    <div className="app w-full overflow-hidden h-screen flex flex-row">
      <SideBar />
      <div className="main w-full flex-1">
        <DashboardRoute></DashboardRoute>
        <Outlet />
      </div>
    </div>
  )
}
