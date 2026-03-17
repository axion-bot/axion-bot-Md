let handler = async (m, { conn, command, usedPrefix }) => {
  // Accediamo ai dati del database caricato nel main
  let chat = global.db.data.chats[m.chat]

  if (!chat || !chat.archivioMessaggi || chat.archivioMessaggi.totali === 0) {
    return m.reply("📊 *CLASSIFICA MESSAGGI*\n\nNessun messaggio registrato oggi in questo gruppo.");
  }

  let dati = chat.archivioMessaggi

  // Determina il limite basato sul comando (.top, .top5, .top10)
  let limite = 3
  if (command === "top5") limite = 5
  if (command === "top10") limite = 10

  // Ordiniamo gli utenti per conteggio decrescente
  let classifica = Object.entries(dati.utenti)
    .sort((a, b) => b[1].conteggio - a[1].conteggio)
    .slice(0, limite)

  const medaglie = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅']

  let testo = `╭━〔 📊 *CLASSIFICA* 📊 〕━⬣\n`
  testo += `┃ 💬 Messaggi totali: *${dati.totali}*\n`
  testo += `╰━━━━━━━━━━━━━━━━━⬣\n\n`
  testo += `🏆 *TOP ${limite} DI OGGI*\n\n`

  let menzioni = classifica.map(u => u[0])

  classifica.forEach((u, i) => {
    let id = u[0]
    let conteggio = u[1].conteggio
    testo += `${medaglie[i]} @${id.split("@")[0]}\n`
    testo += `   ✉️ ${conteggio} messaggi\n\n`
  })

  testo += `──────────────────\n`
  testo += `⏳ _Il conteggio si azzera a mezzanotte_`

  // Bottoni top5 e top10
  const buttons = [
    { buttonId: `${usedPrefix}top5`, buttonText: { displayText: '🏆 Top 5' }, type: 1 },
    { buttonId: `${usedPrefix}top10`, buttonText: { displayText: '🏆 Top 10' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, { 
    text: testo, 
    mentions: menzioni,
    footer: 'Seleziona un bottone per cambiare la classifica',
    buttons,
    headerType: 1
  }, { quoted: m })
}

// --- LOGICA DI REGISTRAZIONE ---
handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return 

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  if (!global.db.data.chats[m.chat].archivioMessaggi) {
    global.db.data.chats[m.chat].archivioMessaggi = { totali: 0, utenti: {} }
  }

  let archivio = global.db.data.chats[m.chat].archivioMessaggi
  archivio.totali += 1

  if (!archivio.utenti[m.sender]) archivio.utenti[m.sender] = { conteggio: 0 }
  archivio.utenti[m.sender].conteggio += 1
}

// --- RESET AUTOMATICO A MEZZANOTTE ---
setInterval(async () => {
  let now = new Date()
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    let chats = global.db.data.chats
    if (!chats) return

    for (let jid in chats) {
      let dati = chats[jid].archivioMessaggi
      if (!dati || dati.totali === 0) continue

      let classifica = Object.entries(dati.utenti)
        .sort((a, b) => b[1].conteggio - a[1].conteggio)
        .slice(0, 3)

      let testo = `╭━〔 🏆 *FINALE* 🏆 〕━⬣\n`
      testo += `┃ 📊 Totale messaggi: *${dati.totali}*\n`
      testo += `╰━━━━━━━━━━━━━━━━━⬣\n\n`

      let menzioni = classifica.map(u => u[0])
      const medaglie = ['🥇','🥈','🥉']

      classifica.forEach((u, i) => {
        testo += `${medaglie[i]} @${u[0].split("@")[0]} — ${u[1].conteggio} messaggi\n`
      })

      testo += `\n🔄 Classifica resettata nel database.`

      if (global.conn) await global.conn.sendMessage(jid, { text: testo, mentions: menzioni })

      chats[jid].archivioMessaggi = { totali: 0, utenti: {} }
    }
  }
}, 60000)

handler.help = ['top', 'top5', 'top10']
handler.tags = ['strumenti']
handler.command = /^(top|top5|top10)$/i
handler.group = true

export default handler