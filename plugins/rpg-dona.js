let tassa = 0.02 // 2%

let handler = async (m, { conn, text, usedPrefix, command }) => {

  let who

  // 📌 Se è in gruppo
  if (m.isGroup) {
    if (m.mentionedJid[0]) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    }
  } else {
    // 📌 Se è in privato
    who = m.chat
  }

  if (!who) {
    return m.reply(
      `🚩 Devi menzionare o rispondere a un utente.\n\n` +
      `Esempio:\n${usedPrefix + command} @utente 100\n` +
      `oppure rispondi al messaggio con:\n${usedPrefix + command} 100`
    )
  }

  if (who === m.sender) {
    return m.reply('⚠️ Non puoi inviare soldi a te stesso.')
  }

  if (!text) {
    return m.reply('🚩 Inserisci la quantità di euro da trasferire.')
  }

  // Se ha menzionato qualcuno, rimuoviamo la menzione dal testo
  let txt = text
  if (m.mentionedJid && m.mentionedJid[0]) {
    txt = text.replace('@' + who.split('@')[0], '').trim()
  }

  if (isNaN(txt)) {
    return m.reply('⚠️ Scrivi solo numeri.')
  }

  let euro = parseInt(txt)
  if (euro < 1) {
    return m.reply('🚩 Il minimo trasferibile è 1 €')
  }

  let users = global.db.data.users

  if (!users[m.sender]) users[m.sender] = {}
  if (!users[who]) users[who] = {}

  if (!users[m.sender].euro) users[m.sender].euro = 0
  if (!users[who].euro) users[who].euro = 0

  let tassaImporto = Math.ceil(euro * tassa)
  let costoTotale = euro + tassaImporto

  if (costoTotale > users[m.sender].euro) {
    return m.reply('❌ Saldo insufficiente.')
  }

  // 💸 Transazione
  users[m.sender].euro -= costoTotale
  users[who].euro += euro

  await m.reply(
    `🏦 BONIFICO ESEGUITO\n\n` +
    `👤 Destinatario: @${who.split('@')[0]}\n` +
    `💸 Inviati: -${euro} €\n` +
    `🧾 Tassa (2%): -${tassaImporto} €\n` +
    `📉 Totale scalato: ${costoTotale} €`,
    null,
    { mentions: [who] }
  )

  global.db.write()
}

handler.help = ['bonifico @user <euro>', 'dona <euro> (rispondendo al messaggio)']
handler.tags = ['euro']
handler.command = /^(bonifico|dona)$/i

export default handler