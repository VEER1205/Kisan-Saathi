import client from './client'

/**
 * Send a message to the Kisan Mitra AI chatbot
 * @param {string} message
 * @param {string|null} sessionId  - pass null to start a new session
 * @returns {{ reply: string, session_id: string }}
 */
export async function sendChatMessage(message, sessionId = null) {
    const body = { message }
    if (sessionId) body.session_id = sessionId

    const res = await client.post('/chat/', body)
    return res.data // { reply, session_id }
}

/**
 * Fetch full chat history for a session
 * @param {string} sessionId
 */
export async function fetchChatHistory(sessionId) {
    const res = await client.get(`/chat/history/${sessionId}`)
    return res.data
}
