import { createRoot, type Root } from 'react-dom/client'

export { Root }

export interface MountRoot extends Root {
  /** 移除挂载根节点 */
  removeRootElement: () => void
}

export interface MountVDomeOptions {
  /** 指定挂载的节点 */
  mountNode?: HTMLElement | null
  /** 自动创建的挂载容器 ID */
  containerId?: string
  /** 给容器附加的 className */
  containerClassName?: string
  /** 挂载内容 */
  content: JSX.Element
  /** 挂载父节点 */
  parentNode?: HTMLElement
  /** 是否前置插入 */
  isPrepend?: boolean
}

const mountNodesMap = new Map<HTMLElement, Root>()

/** 挂载 React 节点 */
export function mountReactNodeSync({
  mountNode,
  content,
  containerId,
  containerClassName,
  isPrepend,
  parentNode = document.body,
}: MountVDomeOptions): MountRoot {
  let containerNode = mountNode

  if (!containerNode) {
    if (containerId) {
      containerNode = document.getElementById(containerId)
    }

    if (!containerNode) {
      containerNode = document.createElement('div')
      containerNode.id = containerId || uuid()

      if (isPrepend) {
        parentNode.insertBefore(containerNode, parentNode.firstChild)
      } else {
        parentNode.appendChild(containerNode)
      }
    }
  }

  const currentMountNode = mountNodesMap.get(containerNode)

  if (currentMountNode) {
    // console.warn(
    //   `The target element(#${containerId}) has mounted ReactNode, and the reload operation will be performed.`
    // )
    currentMountNode.unmount()
    mountNodesMap.delete(containerNode)
  }

  if (containerClassName) {
    containerNode.className = containerClassName
  }

  const root = createRoot(containerNode) as MountRoot

  root.removeRootElement = () => {
    containerNode?.remove()
  }

  root.render(content)

  mountNodesMap.set(containerNode, root)

  return root
}

/** 异步挂载 React 节点 */
export async function mountReactNode(options: MountVDomeOptions) {
  return mountReactNodeSync(options) // 返回异步函数，防止线程阻塞
}

/**
 * 生成一组随机 ID
 * @param 格式, x 为随机字符
 */
export function uuid(t = 'id-xxxxx'): string {
  return t.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
 