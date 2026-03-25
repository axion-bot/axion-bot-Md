let handler = async (m, { conn, command, usedPrefix }) => {
  let chat = global.db.data.chats[m.chat]

  if (!chat) {
    return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀*\n\n𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞")
  }

  const isAll = /topall/i.test(command)
  let limite = 3

  if (command === "top5" || command === "topall5") limite = 5
  if (command === "top10" || command === "topall10") limite = 10

  let classifica = []
  let totaleMessaggi = 0

  if (isAll) {
    let utenti = chat.users || {}

    classifica = Object.entries(utenti)
      .map(([id, data]) => [id, { conteggio: data.messages || 0 }])
      .filter(u => u[1].conteggio > 0)
      .sort((a, b) => b[1].conteggio - a[1].conteggio)
      .slice(0, limite)

    totaleMessaggi = Object.values(utenti).reduce((acc, u) => acc + (u.messages || 0), 0)

    if (classifica.length === 0) {
      return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐓𝐎𝐓𝐀𝐋𝐄*\n\n𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐨")
    }
  } else {
    if (!chat.archivioMessaggi || chat.archivioMessaggi.totali === 0) {
      return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀*\n\n𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐨𝐠𝐠𝐢")
    }

    let dati = chat.archivioMessaggi
    totaleMessaggi = dati.totali

    classifica = Object.entries(dati.utenti)
      .sort((a, b) => b[1].conteggio - a[1].conteggio)
      .slice(0, limite)
  }

  const medaglie = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅']
  const titolo = isAll ? `𝐓𝐎𝐏 ${limite} 𝐓𝐎𝐓𝐀𝐋𝐄` : `𝐓𝐎𝐏 ${limite} 𝐃𝐈 𝐎𝐆𝐆𝐈`

  let testo = `╭━〔 📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀* 〕━⬣\n`
  testo += `┃ 💬 Totale: ${totaleMessaggi}\n`
  testo += `╰━━━━━━━━━━━━⬣\n\n`
  testo += `🏆 *${titolo}*\n\n`

  let menzioni = classifica.map(u => u[0])

  classifica.forEach((u, i) => {
    testo += `${medaglie[i]} @${u[0].split("@")[0]}\n`
    testo += `   ${u[1].conteggio} messaggi\n\n`
  })

  testo += `──────────────\n`
  testo += isAll ? `Storico gruppo` : `Reset ogni giorno`

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni
  }, { quoted: m })
}

handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  let oggi = new Date().toDateString()

  if (!chat.archivioMessaggi) {
    chat.archivioMessaggi = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  if (chat.archivioMessaggi.ultimoReset !== oggi) {
    chat.archivioMessaggi = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  let archivio = chat.archivioMessaggi
  archivio.totali++

  if (!archivio.utenti[m.sender]) archivio.utenti[m.sender] = { conteggio: 0 }
  archivio.utenti[m.sender].conteggio++
}

if (!global.topResetInterval) {
  global.topResetInterval = setInterval(async () => {
    try {
      let chats = global.db.data.chats
      if (!chats || !global.conn) return

      let oggi = new Date().toDateString()

      for (let jid in chats) {
        try {
          if (!jid.endsWith('@g.us')) {
            delete chats[jid]
            continue
          }

          let chat = chats[jid]
          if (!chat.archivioMessaggi) continue

          let dati = chat.archivioMessaggi

          if (!dati.ultimoReset) {
            dati.ultimoReset = oggi
            continue
          }

          if (dati.ultimoReset === oggi) continue

          await global.conn.groupMetadata(jid)

          if (dati.totali > 0) {
            let classifica = Object.entries(dati.utenti)
              .sort((a, b) => b[1].conteggio - a[1].conteggio)
              .slice(0, 3)

            let testo = `🏆 *CLASSIFICA FINALE*\n\n`
            testo += `📊 Totale: ${dati.totali}\n\n`

            let menzioni = classifica.map(u => u[0])
            const medaglie = ['🥇','🥈','🥉']

            classifica.forEach((u, i) => {
              testo += `${medaglie[i]} @${u[0].split("@")[0]} — ${u[1].conteggio}\n`
            })

            testo += `\n🔄 Reset effettuato`

            await global.conn.sendMessage(jid, {
              text: testo,
              mentions: menzioni
            })
          }

          chat.archivioMessaggi = {
            totali: 0,
            utenti: {},
            ultimoReset: oggi
          }

        } catch (e) {
          console.log('Errore gruppo:', jid, e.message)

          if (e?.data === 403 || e.message?.includes('forbidden')) {
            delete chats[jid]
            console.log('Rimosso dal DB:', jid)
          }

          continue
        }
      }

    } catch (e) {
      console.error(e)
    }
  }, 60000)
}

handler.help = ['top', 'top5', 'top10', 'topall']
handler.tags = ['group']
handler.command = /^(top|top5|top10|topall|topall5|topall10)$/i
handler.group = true

export default handler