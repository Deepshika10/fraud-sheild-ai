const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`API ${response.status}: ${text}`)
    }

    return response.json()
}

export const apiClient = {
    get(path) {
        return request(path)
    },
    post(path, body) {
        return request(path, {
            method: 'POST',
            body: JSON.stringify(body),
        })
    },
}
