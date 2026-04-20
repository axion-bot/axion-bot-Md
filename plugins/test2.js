let handler = async (m) => {
  m.reply('FUNZIONA')
}

handler.command = /^test$/i

export default handler