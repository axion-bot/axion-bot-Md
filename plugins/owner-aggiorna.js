import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  try {

    await m.react('⏳')

    let status = execSync('git fetch && git status -uno', { encoding: 'utf-8' })
    let message = ''
    let reaction = '🚀'

    // ✅ Già aggiornato
    if (
      status.includes('Your branch is up to date') ||
      status.includes('nothing to commit')
    ) {

      message = `
╭━━〔 🔄 AGGIORNAMENTO 〕━⬣
┃
┃  ✅ Il bot è già aggiornato
┃  📦 Nessun update disponibile
┃
╰━━━━━━━━━━━━━━━━━━━━⬣`

      reaction = '✅'
    }

    // 🔄 Update disponibile
    else if (status.includes('Your branch is behind')) {

      let update = execSync(
        'git reset --hard && git pull' + (m.fromMe && text ? ' ' + text : ''),
        { encoding: 'utf-8' }
      )

      message = `
╭━━━〔 🔄 COMPLETATO 〕━━━⬣
┃
┃  📥 Nuova versione installata
┃  🤖 Bot aggiornato con successo
┃  📦 OUTPUT:
\`\`\`
${update.trim()}
\`\`\`
╰━━━━━━━━━━━━━━━━━━━━⬣`

      reaction = '🚀'
    }

    // ⚠️ Update forzato
    else {

      let force = execSync(
        'git reset --hard && git pull' + (m.fromMe && text ? ' ' + text : ''),
        { encoding: 'utf-8' }
      )

      message = `
╭━━━〔 ⚙️ UPDATE FORZATO 〕━━━⬣
┃
┃  🔄 Operazione completata
┃
┃  📦 OUTPUT:
┃
\`\`\`
${force.trim()}
\`\`\`
┃
╰━━━━━━━━━━━━━━━━━━━━⬣`

      reaction = '🤖'
    }

    await conn.reply(m.chat, message.trim(), m)
    await m.react(reaction)

  } catch (err) {

    await conn.reply(
      m.chat,
`
╭━━━〔 ❌ ERRORE 〕━━━⬣
┃
┃  ⚠️ Aggiornamento fallito
┃
┃  📄 DETTAGLI:
┃
\`\`\`
${err.message}
\`\`\`
┃
╰━━━━━━━━━━━━━━━━━━━━⬣`.trim(),
      m
    )

    await m.react('❌')
  }
}

handler.help = ['aggiorna']
handler.tags = ['creatore']
handler.command = ['aggiorna', 'update', 'aggiornabot']
handler.rowner = true

export default handler