import client from './client'

/**
 * Login — uses OAuth2 form-data (FastAPI expects username/password as form fields)
 * @param {string} email
 * @param {string} password
 */
export async function apiLogin(email, password) {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)

    const res = await client.post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return res.data // { access_token, token_type, user }
}

/**
 * Register new user
 * @param {{ name, email, phone, password, role, vehicle_info }} data
 */
export async function apiRegister(data) {
    const res = await client.post('/auth/register', data)
    return res.data // UserOut (no token returned on register, user must login after)
}

/** Get currently authenticated user profile */
export async function apiGetMe() {
    const res = await client.get('/auth/me')
    return res.data
}
