// by deadly

const formatNumber = n => new Intl.NumberFormat('it-IT').format(n || 0)

const getClassificaGruppi = (chats = {}, limite = 10) => {
  return Object.entries(chats)
    .filter(([jid, data]) => jid.endsWith('@g.us') && (data?.classificaTotale?.totali || 0) > 0)
    .sort((a, b) => (b[1]?.classificaTotale?.totali || 0) - (a[1]?.classificaTotale?.totali || 0))
    .slice(0, limite)
}

let handler = async (m, { conn, command, usedPrefix }) => {
  const tutteLeChat = global.db.data?.chats || {}
  
  let limite = 3
  if (command.includes('5')) limite = 5
  if (command.includes('10')) limite = 10

  const classifica = getClassificaGruppi(tutteLeChat, limite)

  if (!classifica.length) {
    return m.reply(`*❌ Nessun dato sui gruppi disponibile al momento.*`)
  }

  const medaglie = ['🥇', '🥈', '🥉']
  let testo = `*🌐 CLASSIFICA GLOBAL GRUPPI*\n_I gruppi più attivi in cui è presente il bot_\n`

  for (let i = 0; i < classifica.length; i++) {
    const [jid, data] = classifica[i]
    let nomeGruppo = 'Gruppo Sconosciuto'
    
    try {
      const meta = await conn.groupMetadata(jid).catch(() => null)
      if (meta?.subject) nomeGruppo = meta.subject
    } catch (e) {
      nomeGruppo = data?.subject || 'Gruppo Privato/Non accessibile'
    }

    const totaleMessaggi = data?.classificaTotale?.totali || 0
    const posizione = i < 3 ? medaglie[i] : `*${i + 1}°*`

    testo += `\n${posizione} *${nomeGruppo}*\n`
    testo += `➔ ID: \`${jid.split('@')[0]}\`\n`
    testo += `➔ Messaggi totali: *${formatNumber(totaleMessaggi)}*\n`
  }

  let buttons = []
  if (limite === 3) {
    buttons.push(
      { buttonId: `${usedPrefix}topgruppi5`, buttonText: { displayText: 'Top Gruppi 5' }, type: 1 },
      { buttonId: `${usedPrefix}topgruppi10`, buttonText: { displayText: 'Top Gruppi 10' }, type: 1 }
    )
  } else if (limite === 5) {
    buttons.push(
      { buttonId: `${usedPrefix}topgruppi`, buttonText: { displayText: 'Top Gruppi 3' }, type: 1 },
      { buttonId: `${usedPrefix}topgruppi10`, buttonText: { displayText: 'Top Gruppi 10' }, type: 1 }
    )
  } else {
    buttons.push(
      { buttonId: `${usedPrefix}topgruppi`, buttonText: { displayText: 'Top Gruppi 3' }, type: 1 },
      { buttonId: `${usedPrefix}topgruppi5`, buttonText: { displayText: 'Top Gruppi 5' }, type: 1 }
    )
  }

  await conn.sendMessage(m.chat, {
    text: testo,
    footer: 'Classifica Generale Server',
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.command = /^(topgruppi|topgruppi5|topgruppi10)$/i
handler.tags = ['main', 'group']
handler.help = ['topgruppi', 'topgruppi5', 'topgruppi10']

export default handler
