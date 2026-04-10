export async function sendTelegramMessage(botToken, chatId, text) {
  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.description || `Telegram API error: ${res.status}`)
  }

  return res.json()
}

export async function testConnection(botToken, chatId) {
  try {
    await sendTelegramMessage(botToken, chatId, 'CardWise connected successfully!')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}
