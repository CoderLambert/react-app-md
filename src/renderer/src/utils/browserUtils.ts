export const scrollToBottom = (contentRef: React.RefObject<HTMLDivElement>): void => {
  if (contentRef.current) {
    contentRef.current.scrollTop = contentRef.current.scrollHeight
  }
}
