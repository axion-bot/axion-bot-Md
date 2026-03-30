// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

global.curriculumGame = global.curriculumGame || {}

const random = arr => arr[Math.floor(Math.random() * arr.length)]
const S = v => String(v || '')

const lavori = [
  { nome: 'Web Developer', paga: 2500 },
  { nome: 'Data Scientist', paga: 3000 },
  { nome: 'Graphic Designer', paga: 1800 },
  { nome: 'Marketing Specialist', paga: 2100 },
  { nome: 'AI Engineer', paga: 3500 }
]

const aziende = [
  { nome: 'Google', reputazione: 90, bonus: 1.3 },
  { nome: 'Meta', reputazione: 80, bonus: 1.2 },
  { nome: 'Amazon', reputazione: 75, bonus: 1.15 },
  { nome: 'Tesla', reputazione: 85, bonus: 1.25 },
  { nome: 'OpenAI', reputazione: 95, bonus: 1.4 },
  { nome: 'Startup SRL', reputazione: 60, bonus: 1.1 }
]

const eventi = [
  { testo: '🎉 𝐁𝐨𝐧𝐮𝐬 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨!', effetto: u => u.euro += 500 },
  { testo: '😓 𝐄𝐫𝐫𝐨𝐫𝐞 𝐜𝐨𝐬𝐭𝐨𝐬𝐨...', effetto: u => u.euro -= 300 },
  { testo: '🚀 𝐏𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞!', effetto: u => u.euro += 1000 },
  { testo: '💀 𝐋𝐢𝐜𝐞𝐧𝐳𝐢𝐚𝐭𝐨!', effetto: u => { u.lavoro = null; u.azienda = null } },
  { testo: '😌 𝐆𝐢𝐨𝐫𝐧𝐚𝐭𝐚 𝐭𝐫𝐚𝐧𝐪𝐮𝐢𝐥𝐥𝐚.', effetto: u => {} }
]

const skillList = ['JavaScript', 'Python', 'UI/UX', 'AI', 'Marketing', 'SEO', 'Data Analysis']
const lingue = ['Italiano', 'Inglese', 'Spagnolo', 'Francese']
const certificazioni = ['Google Certified', 'AWS', 'Meta Ads', 'Azure', 'OpenAI Expert']
const livelliExp = ['Junior', 'Mid', 'Senior', 'Esperto']

const buttonsCurriculum = prefix => [
  { buttonId: `${prefix}cercalavoro`, buttonText: { displayText: '💼 Cerca Lavoro' }, type: 1 },
  { buttonId: `${prefix}profilowork`, buttonText: { displayText: '👤 Profilo' }, type: 1 }
]

const buttonProfilo = prefix => [
  { buttonId: `${prefix}profilowork`, buttonText: { displayText: '👤 Profilo' }, type: 1 }
]

let handler = async (m, { conn, command, usedPrefix }) => {
  const chat = m.chat
  const user = m.sender
  const nome = await conn.getName(user)

  global.curriculumGame[chat] = global.curriculumGame[chat] || {}

  let u = global.db.data.users[user]
  if (!u.euro) u.euro = 0
  if (!u.lavoro) u.lavoro = null
  if (!u.azienda) u.azienda = null
  if (!u.reputazioneAzienda) u.reputazioneAzienda = 0

  if (command === 'curriculum') {
    let skills = Array.from({ length: 3 }, () => random(skillList)).join(', ')
    let lingua = random(lingue)
    let cert = random(certificazioni)
    let exp = random(livelliExp)
    let ruolo = random(lavori).nome

    let txt = `*╭━━━━━━━📄━━━━━━━╮*
*✦ 𝐂𝐔𝐑𝐑𝐈𝐂𝐔𝐋𝐔𝐌 ✦*
*╰━━━━━━━📄━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* ${nome}
*💼 𝐑𝐮𝐨𝐥𝐨:* ${ruolo}
*📊 𝐋𝐢𝐯𝐞𝐥𝐥𝐨:* ${exp}

*🧠 𝐂𝐨𝐦𝐩𝐞𝐭𝐞𝐧𝐳𝐞:*
${skills}

*🌍 𝐋𝐢𝐧𝐠𝐮𝐞:*
${lingua}

*🏆 𝐂𝐞𝐫𝐭𝐢𝐟𝐢𝐜𝐚𝐳𝐢𝐨𝐧𝐢:*
${cert}

*🎯 𝐎𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨:*
𝐆𝐮𝐚𝐝𝐚𝐠𝐧𝐚𝐫𝐞 𝐬𝐞𝐦𝐩𝐫𝐞 𝐝𝐢 𝐩𝐢𝐮̀ 💸`

    return await conn.sendMessage(chat, {
      text: txt,
      footer: '𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐬𝐚 𝐟𝐚𝐫𝐞',
      buttons: buttonsCurriculum(usedPrefix),
      headerType: 1
    }, { quoted: m })
  }

  if (command === 'cercalavoro') {
    let lista = []
    let used = new Set()

    let txt = `*╭━━━━━━━💼━━━━━━━╮*
*✦ 𝐎𝐅𝐅𝐄𝐑𝐓𝐄 𝐃𝐈 𝐋𝐀𝐕𝐎𝐑𝐎 ✦*
*╰━━━━━━━💼━━━━━━━╯*

*𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐜𝐨𝐧 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐝𝐚 𝟏 𝐚 𝟓.*

`

    let i = 1
    while (used.size < 5) {
      let job = random(lavori)
      if (!used.has(job.nome)) {
        used.add(job.nome)

        let az = random(aziende)
        let paga = Math.floor(job.paga * az.bonus)

        lista.push({
          ...job,
          azienda: az.nome,
          reputazione: az.reputazione,
          pagaFinale: paga
        })

        txt += `*${i}. 𝐑𝐮𝐨𝐥𝐨:* ${job.nome}
*🏢 𝐀𝐳𝐢𝐞𝐧𝐝𝐚:* ${az.nome}
*⭐ 𝐑𝐞𝐩𝐮𝐭𝐚𝐳𝐢𝐨𝐧𝐞:* ${az.reputazione}/100
*💰 𝐒𝐭𝐢𝐩𝐞𝐧𝐝𝐢𝐨:* ${paga}€

`

        i++
      }
    }

    global.curriculumGame[chat][user] = { proposte: lista }

    return conn.reply(chat, txt.trim(), m)
  }

  if (command === 'profilowork') {
    let txt = `*╭━━━━━━━👤━━━━━━━╮*
*✦ 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 𝐋𝐀𝐕𝐎𝐑𝐎 ✦*
*╰━━━━━━━👤━━━━━━━╯*

*💼 𝐋𝐚𝐯𝐨𝐫𝐨:* ${u.lavoro || '𝐃𝐢𝐬𝐨𝐜𝐜𝐮𝐩𝐚𝐭𝐨'}
*🏢 𝐀𝐳𝐢𝐞𝐧𝐝𝐚:* ${u.azienda || '-'}
*⭐ 𝐑𝐞𝐩𝐮𝐭𝐚𝐳𝐢𝐨𝐧𝐞:* ${u.reputazioneAzienda || 0}/100
*💰 𝐄𝐮𝐫𝐨:* ${u.euro || 0}€`

    return conn.reply(chat, txt, m)
  }
}

handler.before = async (m, { conn, usedPrefix }) => {
  const chat = m.chat
  const user = m.sender

  if (!global.curriculumGame?.[chat]?.[user]) return
  if (!/^[1-5]$/.test(S(m.text).trim())) return

  let u = global.db.data.users[user]
  const scelta = global.curriculumGame[chat][user].proposte[Number(m.text) - 1]
  if (!scelta) return

  const nome = await conn.getName(user)

  u.lavoro = scelta.nome
  u.azienda = scelta.azienda
  u.reputazioneAzienda = scelta.reputazione
  u.euro += scelta.pagaFinale

  let evento
  if (u.reputazioneAzienda >= 85) evento = random([eventi[0], eventi[2], eventi[4]])
  else if (u.reputazioneAzienda >= 70) evento = random(eventi)
  else evento = random([eventi[1], eventi[3], eventi[4]])

  evento.effetto(u)

  let txt = `*╭━━━━━━━🎮━━━━━━━╮*
*✦ 𝐂𝐀𝐑𝐑𝐈𝐄𝐑𝐀 ✦*
*╰━━━━━━━🎮━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* ${nome}
*💼 𝐋𝐚𝐯𝐨𝐫𝐨:* ${u.lavoro || '𝐃𝐢𝐬𝐨𝐜𝐜𝐮𝐩𝐚𝐭𝐨'}
*🏢 𝐀𝐳𝐢𝐞𝐧𝐝𝐚:* ${u.azienda || '-'}
*⭐ 𝐑𝐞𝐩𝐮𝐭𝐚𝐳𝐢𝐨𝐧𝐞:* ${u.reputazioneAzienda || 0}/100
*💰 𝐄𝐮𝐫𝐨:* ${u.euro || 0}€

*🎲 𝐄𝐯𝐞𝐧𝐭𝐨:* ${evento.testo}`

  await conn.sendMessage(chat, {
    text: txt,
    footer: '𝐕𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚 𝐢𝐥 𝐭𝐮𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨',
    buttons: buttonProfilo(usedPrefix),
    headerType: 1
  }, { quoted: m })

  delete global.curriculumGame[chat][user]
}

handler.command = /^(curriculum|cercalavoro|profilowork)$/i

export default handler