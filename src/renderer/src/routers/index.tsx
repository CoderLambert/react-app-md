// import { Route, Routes } from 'react-router-dom'

import { Route, Routes } from 'react-router-dom'
import { MarkdownPage } from '@renderer/views/markdown/'
import { DashBoardLayout } from '@renderer/components/layouts/DashBoardLayout'
import DouBaoVision from '@renderer/views/doubao/index'
import twMerge from '@renderer/views/twMerge'
export const routeConfigs = [
  {
    path: '/',
    element: <DashBoardLayout></DashBoardLayout>,
    children: [
      {
        index: true, // This makes /markdown the default route within DashBoardLayout
        element: <MarkdownPage></MarkdownPage>
      },
      {
        path: '/markdown',
        element: <MarkdownPage></MarkdownPage>
      },
      {
        path: '/doubao-vision',
        element: <DouBaoVision></DouBaoVision>
      },
      {
        path: '/code',
        element: <>{twMerge()}</>
      }
    ]
  }
]

export function buildRoute(routeItem, index): JSX.Element {
  if (routeItem.children) {
    const children = routeItem.children.map((item, childrenIndex) =>
      buildRoute(item, childrenIndex)
    )
    return (
      <Route key={index} path={routeItem.path} element={routeItem.element}>
        {children}
      </Route>
    )
  } else {
    if (routeItem.index) {
      return <Route key={index} index={routeItem.index} element={routeItem.element}></Route>
    } else {
      return <Route key={index} path={routeItem.path} element={routeItem.element}></Route>
    }
  }
}

export function DashboardRoute(): JSX.Element {
  return <Routes>{routeConfigs.map((route, index) => buildRoute(route, index))}</Routes>
}
