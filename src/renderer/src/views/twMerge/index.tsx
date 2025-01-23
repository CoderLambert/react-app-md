import { Button } from '@renderer/components/ui/button'

export default function twMerge(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
      <Button intent="secondary" size="small">
        Click Me
      </Button>
      <Button intent="secondary" size="medium">
        Click Me
      </Button>
    </div>
  )
}
