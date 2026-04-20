// Plugin AntiPrivato by Bonzino

export async function before(m, { isOwner, isRowner, isMods }) {
  if (m.fromMe) return true
  if (m.isGroup) return false
  if (!m.message) return true

  const bot = global.db.data.settings[this.user.jid] || {}

  if (bot.antiprivato && !isOwner && !isRowner && !isMods) {
    await this.updateBlockStatus(m.chat, 'block')
  }

  return false
}