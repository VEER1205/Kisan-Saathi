import client from './client'

/**
 * Fetch community feed (newest first)
 * @param {{ skip?: number, limit?: number }} opts
 */
export async function fetchCommunityFeed({ skip = 0, limit = 20 } = {}) {
    const res = await client.get('/community/feed', { params: { skip, limit } })
    return res.data // PostOut[]
}

/**
 * Create a new community post (multipart: image required)
 * @param {string} caption
 * @param {string[]} tags
 * @param {File} imageFile
 */
export async function createCommunityPost(caption, tags = [], imageFile) {
    const form = new FormData()
    form.append('caption', caption)
    form.append('tags', tags.join(','))
    if (imageFile) form.append('file', imageFile)

    const res = await client.post('/community/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
}

/**
 * Toggle like on a post
 * @param {string} postId
 */
export async function likePost(postId) {
    const res = await client.post(`/community/${postId}/like`)
    return res.data
}

/**
 * Add a comment to a post
 * @param {string} postId
 * @param {string} text
 */
export async function addComment(postId, text) {
    const res = await client.post(`/community/${postId}/comment`, { text })
    return res.data
}
