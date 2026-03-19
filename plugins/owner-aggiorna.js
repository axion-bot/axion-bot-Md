import { execSync } from 'child_process'

let handler = async (m, { conn }) => {
  try {
    // Messaggio iniziale
    await conn.reply(m.chat, '🔄 𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐨 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐢...', m)

    // Eseguo pull
    let update = execSync('git fetch origin && git reset --hard origin/main && git pull', { encoding: 'utf-8' })

    // Estraggo solo i file aggiornati dal pull
    let files = update.split('\n').filter(l => l.includes('|')).map(l => {
      let [file, changes] = l.split('|').map(s => s.trim())
      let ins = (changes.match(/\+/g) || []).length
      let del = (changes.match(/-/g) || []).length
      return `📄 ${file} (+${ins}/-${del})`
    }).join('\n')

    let resultMsg = '✅ 𝐀𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐨 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨!' + (files)

    await conn.reply(m.chat, resultMsg, m)
    await m.react('✅')

  } catch (err) {
    await conn.reply(m.chat, `❌ Errore durante aggiornamento:\n\n${err.message}`, m)
    await m.react('❌')
  }
}

handler.help = ['aggiorna']
handler.tags = ['owner']
handler.command = ['aggiorna','update','aggiornabot']
handler.owner = true

export default handler
