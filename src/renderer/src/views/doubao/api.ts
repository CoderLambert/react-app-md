import { Message, RoleType } from './data'

const modelUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'

const model = 'ep-20250113104539-gpmmt'
const apiKey = 'b9796a4e-cb36-432c-a8a0-924088753042'

export function douBaoVision(messages: Message): Promise<{
  content: string
  role: RoleType
}> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}` // 替换为你的实际 token
  }

  const body = JSON.stringify({
    model, // 替换为你的实际模型 ID
    messages: [messages]
  })
  return fetch(modelUrl, {
    method: 'POST',
    headers: headers,
    body: body
  })
    .then((response) => response.json()) // 解析响应为 JSON
    .then((data) => {
      console.log('Response:', data) // 输出响应数据
      return data.choices[0].message
    })
    .catch((error) => {
      console.error('Error:', error) // 处理错误
    })
}

export async function douBaoVisionStream(
  messages: Message
): Promise<ReadableStream<Uint8Array> | null> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}` // 替换为你的实际 token
  }

  const body = JSON.stringify({
    model, // 替换为你的实际模型 ID
    stream: true,
    messages: [messages]
  })
  const response = await fetch(modelUrl, {
    method: 'POST',
    headers: headers,
    body: body,
    redirect: 'follow'
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.body
}
