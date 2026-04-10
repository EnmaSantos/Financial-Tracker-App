const getHost = () => import.meta.env.VITE_OLLAMA_HOST || 'http://localhost:11434'
const getModel = () => import.meta.env.VITE_OLLAMA_MODEL || 'gemma3:4b'

export async function pingOllama(host) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${host || getHost()}/api/tags`, {
      signal: controller.signal
    })
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

export async function parseStatement(content, mimeType, host, model) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120000)

    const prompt = `Extract all transactions from this credit card statement. Return a JSON array where each object has: date (YYYY-MM-DD), description (string), amount (number, positive for charges, negative for payments/credits), type (one of: purchase, payment, fee, interest, refund). Return ONLY the JSON array, no other text.`

    const body = {
      model: model || getModel(),
      prompt,
      stream: false
    }

    if (mimeType.startsWith('image/')) {
      body.images = [content]
    } else {
      body.prompt = `${prompt}\n\nStatement content:\n${content}`
    }

    const res = await fetch(`${host || getHost()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return { ok: false, error: `Ollama returned ${res.status}` }
    }

    const data = await res.json()
    const responseText = data.response || ''

    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return { ok: false, error: 'Could not parse AI response' }
    }

    const transactions = JSON.parse(jsonMatch[0])
    return { ok: true, transactions }
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, error: 'AI request timed out' }
    }
    return { ok: false, error: err.message || 'AI unavailable' }
  }
}
