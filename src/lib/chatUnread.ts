export const CHAT_UNREAD_CHANGED_EVENT = "phanda-chat-unread-changed"

const STORAGE_KEY = "phanda-links-message-last-read"

export function getConversationReadState(): Record<string, string> {
  if (typeof window === "undefined") return {}

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    return storedValue ? JSON.parse(storedValue) : {}
  } catch {
    return {}
  }
}

export function markConversationRead(jobId: string) {
  if (typeof window === "undefined" || !jobId) return

  const state = getConversationReadState()
  state[jobId] = new Date().toISOString()
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent(CHAT_UNREAD_CHANGED_EVENT))
}

export function isMessageUnread(
  jobId: string,
  latestMessageAt?: string | null,
  currentUserId?: string | null,
  senderId?: string | null,
) {
  if (!jobId || !latestMessageAt || !currentUserId) return false
  if (senderId === currentUserId) return false

  const lastReadAt = getConversationReadState()[jobId]
  if (!lastReadAt) return true

  return new Date(latestMessageAt).getTime() > new Date(lastReadAt).getTime()
}

export function countUnreadMessages(messages: Array<{ job_id: string; sender_id: string; created_at: string }>, currentUserId: string | null) {
  if (!currentUserId) return 0

  const readState = getConversationReadState()

  return messages.reduce((count, message) => {
    if (message.sender_id === currentUserId) return count

    const lastReadAt = readState[message.job_id]
    if (!lastReadAt) return count + 1

    return new Date(message.created_at).getTime() > new Date(lastReadAt).getTime() ? count + 1 : count
  }, 0)
}
