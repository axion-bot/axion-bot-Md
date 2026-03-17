import { execSync } from 'child_process'

let handler = async (m, { conn }) => {
  try {
    await conn.reply(m.chat, '🔄 Controllo aggiornamenti...', m)

    // --- commit in arrivo ---
    let commits = execSync('git log HEAD..origin/main --oneline', { encoding: 'utf-8' })
    let commitMsg = commits ? `📝 Commit in arrivo:\n${commits}` : '✅ Nessun commit da applicare'

    await conn.reply(m.chat, commitMsg, m)

    // --- eseguo pull ---
    let update = execSync('git fetch origin && git reset --hard origin/main && git pull', { encoding: 'utf-8' })

    // --- estraggo solo file modificati dall'output del pull ---
    let files = update.split('\n').filter(l => l.includes('|')).map(l => {
      let [file, changes] = l.split('|').map(s => s.trim())
      let ins = (changes.match(/\+/g) || []).length
      let del = (changes.match(/-/g) || []).length
      return `📄 ${file} (+${ins}/-${del})`
    }).join('\n')

    let resultMsg = `✅ Aggiornamento completato!\n\n`
    resultMsg += files || 'Nessun file aggiornato'

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