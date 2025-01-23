import { v4 as uuidv4 } from 'uuid'
import mdRaw from './prompt.md?raw'
import mdMath from './math.md?raw'

export type RoleType = 'assistant' | 'user' | 'system'

export type ContentType =
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'image_url'
      image_url: string
    }

export interface Message {
  id: string
  role: RoleType
  content: ContentType[]
}

export interface UploadResponse {
  url: string
  thumb: string
  del: string
  srcName: string
}

export const textMessage: Message = {
  id: uuidv4(),
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: mdMath
    }
  ]
}

export const userMessage: Message = {
  id: uuidv4(),
  role: 'user',
  content: [
    {
      type: 'text',
      text: '你好~'
    },
    {
      type: 'image_url',
      image_url: 'http://img.lizhi.life/i/2025/01/14/hfkn7z-0.png'
    }
  ]
}

export const tosBucket = 'https://doubao-vision.tos-cn-shanghai.volces.com/1/'

export const tosPicUrlList = [
  '000788562024-12-02-10-10-28-701.jpg',
  '001270192024-12-05-09-25-32-165.jpg',
  '003183452024-12-04-13-03-49-497.jpg',
  '003482172024-12-02-10-10-16-171.jpg',
  '003582292024-12-02-10-43-20-337.jpg',

  '003896212024-12-02-16-23-34-682.jpg',
  '004089332024-12-04-10-08-19-514.jpg',
  '004151802024-12-02-10-51-22-446.jpg',
  '007115912024-12-02-13-02-03-643.jpg',
  '007119612024-12-02-15-20-44-638.jpg',

  '007527602024-12-02-12-04-33-810.jpg',
  '007597292024-12-04-14-35-27-167.jpg',
  '008017542024-12-04-13-37-52-958.jpg',
  '009030352024-12-02-10-05-46-347.jpg',
  '009451532024-12-02-16-36-13-614.jpg',

  '009716012024-12-02-14-04-44-733.jpg',
  '009722312024-12-02-13-46-33-449.jpg',
  '010929442024-12-02-09-38-20-405.jpg',
  '011579262024-12-02-10-11-02-454.jpg',
  '011719452024-12-02-11-17-59-583.jpg',

  '012263522024-12-02-09-46-35-506.jpg',
  '012917142024-12-02-13-43-05-077.jpg',
  '731339014699040778_WD01270679-1733103549466.png',
  '731339320438710308_173310362256924.jpeg'
]

const tosPicContent: ContentType[] = tosPicUrlList.map((pic) => {
  return {
    type: 'image_url',
    image_url: tosBucket + pic
  }
})

export const tocUserMessage: Message = {
  id: uuidv4(),
  role: 'user',
  content: [
    {
      type: 'text',
      text: mdRaw
    },
    ...tosPicContent
  ]
}
