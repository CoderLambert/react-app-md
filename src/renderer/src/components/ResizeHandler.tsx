import { PanelResizeHandle } from 'react-resizable-panels'

//github.com/bvaughn/react-resizable-panels/blob/main/packages/react-resizable-panels/README.md
export default function ResizeHandle({
  className = '',
  id,
  onClick
}: {
  className?: string
  id?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}): JSX.Element {
  return (
    <PanelResizeHandle className={['resize-handle-outer', className].join(' ')} id={id}>
      <div className="resize-handle-inner">
        <div className="drag-btn flex-center" onClick={onClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drag-icon"
          >
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </div>
      </div>
    </PanelResizeHandle>
  )
}
