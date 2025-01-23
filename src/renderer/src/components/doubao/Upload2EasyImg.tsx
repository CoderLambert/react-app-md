import { Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

const Upload2EasyImg = ({
  onUploadSuccessCallback
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUploadSuccessCallback: (result: any, file: File) => void
}): JSX.Element => {
  // const [messageApi] = message.useMessage()

  const handleCustomRequest = async (options): Promise<void> => {
    const { file, onSuccess, onError } = options

    try {
      // 这里替换为你的上传逻辑
      // 例如使用 fetch 或 axios 发送文件到服务器
      const token = '6c67bc4e2bd8d54edd3c044fe5b5c6cf'
      // messageApi.open({
      //   type: 'loading',
      //   content: '文件上传中...',
      //   duration: 0
      // })
      const formData = new FormData()
      formData.append('image', file)
      formData.append('token', token)
      const response = await fetch('http://img.lizhi.life/api/index.php', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      // console.log(result)
      // 上传成功
      // clearInterval(interval)
      onSuccess(result, file) // 通知 Upload 组件上传成功

      if (onUploadSuccessCallback) {
        onUploadSuccessCallback(result, file)
      }
      // messageApi.destroy()
      message.success(`${file.name} 上传成功`)
    } catch (error) {
      // clearInterval(interval)
      onError(error) // 通知 Upload 组件上传失败
      // messageApi.destroy()
      message.error(`${file.name} 上传失败`)
    }
  }

  return (
    <Upload showUploadList={false} customRequest={handleCustomRequest}>
      <Button type="dashed" icon={<UploadOutlined />}></Button>
    </Upload>
  )
}

export default Upload2EasyImg
