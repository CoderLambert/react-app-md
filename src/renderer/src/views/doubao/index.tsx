import { useState, useEffect, useRef } from 'react'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'
import { ArrowUpOutlined, CloseCircleFilled } from '@ant-design/icons'
import { Input, Divider, Button, Image, message } from 'antd'
import MDViewer from '@renderer/components/Markdown/Viewer'
import Upload2EasyImg from '@renderer/components/doubao/Upload2EasyImg'
import { CopyBtn } from '@renderer/components/doubao/CopyBtn'

import { GrRefresh } from 'react-icons/gr'

import { Message, UploadResponse } from './data'
import { douBaoVisionStream } from './api'
import { scrollToBottom } from '@renderer/utils/browserUtils'
// douBaoVision,
import './doubao.scss'

const { TextArea } = Input

export default function Index(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
  const [messageApi] = message.useMessage()
  const [messageLoading, setMessageLoading] = useState<boolean>(false)

  const footerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [footerRefHeight, setFooterRefHeight] = useState(0)
  const [uploadImgUrl, setUploadImgUrl] = useState<UploadResponse>({
    url: '',
    thumb: '',
    del: '',
    srcName: ''
  })

  const [inputPrompt, setInputPrompt] = useState('')

  // 使用 Immer 添加新的消息到 messages 数组
  const handleAdd = (newMessage: Message): void => {
    setMessages((prevMessages) => [...prevMessages, newMessage])
  }

  const cleanInputMessage = (): void => {
    setInputPrompt('')
    setUploadImgUrl({
      url: '',
      thumb: '',
      del: '',
      srcName: ''
    })
  }

  const buildImgMd = (url: string): string => `<img data-zoomable src="${url}" />`

  const buildMessage = (message: Message): JSX.Element => {
    if (message.role === 'user') {
      return (
        <>
          {message.content.map((item, index) => (
            <div key={index} className="item bg-gray-50 p-2 rounded-sm mb-4">
              {item.type === 'text' ? (
                <MDViewer mdRaw={item.text} baseDir=""></MDViewer>
              ) : (
                <img data-zoomable src={item.image_url} />
              )}
            </div>
          ))}
        </>
      )
    } else {
      return (
        <>
          {message.content.map((item, index) => (
            <div key={index}>
              {item.type === 'text' ? (
                <div className="assistant-info rounded-lg shadow-lg">
                  <MDViewer mdRaw={item.text} baseDir="" />
                  <div className="px-8 w-full pb-4 flex flex-row justify-end items-center gap-4">
                    <CopyBtn textToCopy={item.text}></CopyBtn>
                    <GrRefresh
                      size={22}
                      title="刷新"
                      className="hover:text-gray-500 hover:cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <MDViewer mdRaw={buildImgMd(item.image_url)} baseDir="" />
              )}
            </div>
          ))}
        </>
      )
    }
  }

  const handleUploadSuccess = (
    result: UploadResponse,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _file: File
  ): void => {
    setUploadImgUrl({
      url: result.url,
      thumb: result.thumb,
      del: result.del,
      srcName: result.srcName
    })
  }

  const delUploadImg = (): void => {
    if (uploadImgUrl.del) {
      messageApi.open({
        type: 'loading',
        content: '文件删除中...',
        duration: 0
      })

      fetch(uploadImgUrl.del)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          setUploadImgUrl({
            url: '',
            thumb: '',
            del: '',
            srcName: ''
          })
          messageApi.destroy()
        })
        .catch((error) => {
          console.error('Error:', error)
          messageApi.destroy()
        })
    }
  }

  const sendMessage = async (): Promise<void> => {
    if (inputPrompt === '') {
      return
    }

    const newMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: []
    }

    if (uploadImgUrl.url !== '') {
      newMessage.content.push({
        type: 'image_url',
        image_url: uploadImgUrl.url
      })
    }

    if (inputPrompt !== '') {
      newMessage.content.push({
        type: 'text',
        text: inputPrompt
      })
    }

    handleAdd(newMessage)

    cleanInputMessage()

    try {
      setMessageLoading(true)
      const stream = await douBaoVisionStream(newMessage)
      if (!stream) {
        throw new Error('Failed to get stream')
      }
      const reader = stream.getReader()

      let result = ''
      const decoder = new TextDecoder()
      const assistantMessageId = uuidv4()
      handleAdd({
        id: assistantMessageId,
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: ''
          }
        ]
      })

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        result += chunk

        const events = result.split('\n\n')
        result = events.pop() || '' // 保留未处理完的部分

        for (const event of events) {
          if (event.trim() === '') continue
          const data = event.replace(/^data: /, '').trim()
          if (data === '[DONE]') {
            break
          }

          try {
            const parsedData = JSON.parse(data)
            if (parsedData?.choices?.[0]?.delta?.content) {
              setMessages((prevMessages) =>
                produce(prevMessages, (draft) => {
                  const assistantMessage = draft.find((msg) => msg.id === assistantMessageId)
                  if (assistantMessage && assistantMessage.content[0].type === 'text') {
                    assistantMessage.content[0].text += parsedData['choices'][0]['delta']['content']
                  }
                })
              )
            }
          } catch (error) {
            console.error('Failed to parse event data:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      messageApi.error('发送消息失败，请重试')
    } finally {
      setMessageLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.ctrlKey && event.key === 'Enter') {
      sendMessage()
    }
  }

  useEffect(() => {
    // handleAdd(textMessage)
    // handleAdd(tocUserMessage)
    // handleAdd({
    //   id: uuidv4(),
    //   role: 'assistant',
    //   content: [
    //     {
    //       type: 'text',
    //       text: '| 序号 | 是否是规范图片 | 衣服主体颜色 | 衣服logo文本 | 是否为镜像图片 | 工服类型 | 是否为手机照片 | 是否正确穿工服 |\n|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|\n| 1 | 是 | 红色 | 极兔速递 | 否 | 外套 | 是 | 是 |\n| 2 | 是 | 红色 | 极兔速递 | 否 | 马甲 | 是 | 是 |\n| 3 | 是 | 红色 | 极兔速递 | 否 | 外套 | 是 | 否 |\n| 4 | 是 | 红色 | 极兔速递 | 否 | 外套 | 是 | 否 |\n| 5 | 是 | 红色 | 极兔速递 | 否 | 外套 | 是 | 是 |\n| 6 | 是 | 黄色 | 无 | 否 | 马甲 | 是 | 是 |\n| 7 | 是 | 红色 | 极兔速递 | 否 | T恤 | 是 | 是 |\n| 8 | 是 | 红色、灰色 | 极兔速递 | 否 | 外套 | 是 | 是 |\n| 9 | 是 | 红色 | 极兔速递 | 否 | 外套 | 是 | 是 |\n| 10 | 是 | 红色 | J&T极兔速递 | 否 | 马甲 | 是 | 是 |'
    //     }
    //   ]
    // })
    // console.log(tocUserMessage)
    if (footerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setFooterRefHeight(entry.contentRect.height)
        }
      })

      observer.observe(footerRef.current)

      // 清理函数
      return (): void => {
        observer.disconnect()
      }
    }
    return
  }, [])

  useEffect(() => {
    scrollToBottom(contentRef)
  }, [messages])

  return (
    <>
      <div className="h-screen w-full overflow-auto" ref={contentRef}>
        <div className="flex flex-col mx-auto w-2/3 h-full">
          <h1 className="text-xl text-center">豆包视觉模型</h1>

          <div className="container">
            <div
              className="message-list flex gap-4 flex-col"
              style={{
                paddingBottom: footerRefHeight + 80 + 'px'
              }}
            >
              {messages.map((message) => (
                <div className={`message ${message.role}`} key={message.id}>
                  {buildMessage(message)}
                </div>
              ))}
            </div>
          </div>

          <div
            ref={footerRef}
            className="footer bg-white rounded-xl shadow-md w-3/5  border border-solid border-gray-200  fixed bottom-2 mx-auto  p-4 "
          >
            <div className="chat-input-container flex flex-col w-full">
              <div className="inner-box">
                {uploadImgUrl.url && (
                  <div className="relative">
                    <Image
                      width={40}
                      height={40}
                      preview={{
                        src: uploadImgUrl.url
                      }}
                      src={uploadImgUrl.thumb}
                    ></Image>
                    <CloseCircleFilled
                      size={10}
                      onClick={delUploadImg}
                      className="absolute top-[-5px] right-[-5px] bg-white rounded hover:text-gray-400 hover:cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="input-box flex flex-row w-full">
                <TextArea
                  className={`border-none outline-none flex-1`}
                  tabIndex={0}
                  placeholder="发消息、输入 @ 或 / 选择技能"
                  autoSize
                  value={inputPrompt}
                  onChange={(e) => {
                    setInputPrompt(e.target.value)
                  }}
                  onKeyDown={handleKeyDown}
                />

                <div className="icons flex gap-2 basis-72 justify-end items-center">
                  <Upload2EasyImg onUploadSuccessCallback={handleUploadSuccess}></Upload2EasyImg>
                  <Divider style={{ borderColor: '#7cb305', height: '22px' }} type="vertical" />
                  <Button
                    type="primary"
                    icon={<ArrowUpOutlined />}
                    shape="circle"
                    danger={messageLoading}
                    loading={messageLoading}
                    title={messageLoading ? '正在生成中...' : '发送消息'}
                    onClick={sendMessage}
                  ></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
