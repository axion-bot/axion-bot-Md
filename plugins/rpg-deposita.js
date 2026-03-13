let handler = async (m, { args }) => {
  // Assicurati che l'utente esista
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  let user = global.db.data.users[m.sender]

  // Inizializza i valori di default
  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bank !== 'number') user.bank = 0

  if (!args[0]) return m.reply('🚩 Inserisci la quantità da depositare.')

  let count
  if (args[0].toLowerCase() === 'all') {
    count = user.euro
    if (count <= 0) return m.reply('🚩 Non hai abbastanza 💶 Euro da depositare.')
  } else {
    if (isNaN(args[0])) return m.reply('🚩 La quantità deve essere un numero valido.')
    count = parseInt(args[0])
    if (count < 1) return m.reply('🚩 La quantità minima è 1 💶 Euro.')
    if (count > user.euro) return m.reply(`🚩 Hai solo ${user.euro} 💶 Euro nel portafoglio.`)
  }

  // Trasferimento
  user.euro -= count
  user.bank += count

  await m.reply(`🏦 Hai depositato ${count} 💶 Euro nella tua banca.\n💰 Nuovo saldo in banca: ${user.bank} 💶\n💵 Portafoglio: ${user.euro} 💶`)
}

handler.help = ['deposita <numero|all>']
handler.tags = ['economy', 'rpg']
handler.command = ['deposita']

export default handler