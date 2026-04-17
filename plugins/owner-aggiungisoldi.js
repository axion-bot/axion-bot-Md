let handler = async (m, { args }) => {
  const who = m.sender

  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  const user = global.db.data.users[who]

  if (typeof user.euro === 'undefined') user.euro = 0

  const quantità = parseInt(args[0])

  if (!quantità || isNaN(quantità) || quantità <= 0) {
    return m.reply('Usa: *.add 100*')
  }

  user.euro += quantità

  m.reply(`💸 *Ti sono stati aggiunti ${quantità} euro.*\n🏦 *Saldo attuale:* ${user.euro}`)
}

handler.help = ['add <quantità>']
handler.tags = ['owner']
handler.command = /^add$/i
handler.owner = true

export default handler