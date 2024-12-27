import { useState } from 'react'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

const Tooltip = ({ text, children }: TooltipProps): JSX.Element => {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(true)}
    >
      {/* Tooltip Content */}
      {children}

      {/* Tooltip Text */}
      {isVisible && (
        <div className="absolute z-10 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg bottom-full left-1/2 transform -translate-x-1/2">
          {text}
          {/* Tooltip Arrow */}
          <div className="absolute w-3 h-3 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  )
}

export default Tooltip
