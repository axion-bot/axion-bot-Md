//by Bonzino

let handler = async () => {
  throw new Error('Test errore plugin: tutto ok, il sistema di errori sta funzionando.')
}

handler.command = ['testerrore', 'crash']
handler.tags = ['test']
handler.help = ['testerrore']

export default handler