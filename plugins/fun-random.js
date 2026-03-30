// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

const S = v => String(v || '')
const random = arr => arr[Math.floor(Math.random() * arr.length)]

const unknownPeople = [
  {
    name: '👤 Marco92',
    desc: 'quello che ha l’immagine predefinita da 3 anni',
    community: 'Gruppi di scambio',
    lastSeen: '10 minuti fa'
  },
  {
    name: '👤 Giulia__',
    desc: 'legge ma non risponde mai',
    community: 'Community libri',
    lastSeen: '2 ore fa'
  },
  {
    name: '👤 User12345',
    desc: 'il classico numero internazionale',
    community: 'Gruppi spam',
    lastSeen: 'ieri'
  },
  {
    name: '👤 Alessandro',
    desc: 'ha la spunta blu ma non si sa chi sia',
    community: 'Vari gruppi',
    lastSeen: '3 giorni fa'
  },
  {
    name: '👤 Sara',
    desc: 'cambia foto profilo ogni settimana',
    community: 'Community gossip',
    lastSeen: 'online ora'
  },
  {
    name: '👤 +39 *** *** **90',
    desc: 'numero nascosto, nessuno lo conosce',
    community: 'Mistero totale',
    lastSeen: 'mai online'
  },
  {
    name: '👤 Luca',
    desc: 'manda solo auguri a Natale',
    community: 'Parenti lontani',
    lastSeen: '8 mesi fa'
  },
  {
    name: '👤 Fra',
    desc: 'quello che c’è in 100 gruppi',
    community: 'Tutte le community',
    lastSeen: 'sempre online'
  },
  {
    name: '👤 Anonimo',
    desc: 'ha disattivato l’ultimo accesso',
    community: 'Ghost mode',
    lastSeen: 'nascosto'
  },
  {
    name: '👤 Nonno_45',
    desc: 'manda buongiorno ogni mattina',
    community: 'Gruppi famiglia',
    lastSeen: '5 minuti fa'
  },
  {
    name: '👤 _unknown_',
    desc: 'nome utente tutto in minuscolo',
    community: 'Community tech',
    lastSeen: '2 settimane fa'
  },
  {
    name: '👤 Missim',
    desc: 'quello che ti compare nei suggeriti',
    community: 'Contatti suggeriti',
    lastSeen: 'sconosciuto'
  },
  {
    name: '👤 Silvia',
    desc: 'ha 2 spunte blu ma non parla mai',
    community: 'Gruppi silenziosi',
    lastSeen: 'letto'
  }
]

const actionButtons = prefix => [
  {
    buttonId: `${prefix}random`,
    buttonText: { displayText: '🔄 Nuovo Mistero' },
    type: 1
  },
  {
    buttonId: `${prefix}randomprofile`,
    buttonText: { displayText: '📸 Foto Profilo' },
    type: 1
  },
  {
    buttonId: `${prefix}randomstory`,
    buttonText: { displayText: '📖 Storia' },
    type: 1
  }
]

function createLoadingBar(percent, length = 15) {
  const filledLength = Math.round((percent / 100) * length)
  const emptyLength = length - filledLength
  return `┃${'█'.repeat(filledLength)}${'░'.repeat(emptyLength)}┃`
}

function getMysteryEmoji(percent) {
  if (percent >= 80) return '👻'
  if (percent >= 60) return '🕵️'
  if (percent >= 40) return '🤔'
  if (percent >= 20) return '😐'
  return '😎'
}

function getMysteryDescription(percent) {
  if (percent >= 80) return '└ *𝐋𝐄𝐆𝐆𝐄𝐍𝐃𝐀:* 𝐍𝐞𝐬𝐬𝐮𝐧𝐨 𝐬𝐚 𝐜𝐡𝐢 𝐬𝐢𝐚 𝐯𝐞𝐫𝐚𝐦𝐞𝐧𝐭𝐞'
  if (percent >= 60) return '└ *𝐌𝐈𝐒𝐓𝐄𝐑𝐎:* 𝐏𝐨𝐜𝐡𝐢 𝐥𝐨 𝐡𝐚𝐧𝐧𝐨 𝐯𝐢𝐬𝐭𝐨 𝐨𝐧𝐥𝐢𝐧𝐞'
  if (percent >= 40) return '└ *𝐍𝐎𝐑𝐌𝐀𝐋𝐄:* 𝐔𝐭𝐞𝐧𝐭𝐞 𝐬𝐭𝐚𝐧𝐝𝐚𝐫𝐝 𝐝𝐢 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩'
  if (percent >= 20) return '└ *𝐂𝐇𝐈𝐀𝐑𝐎:* 𝐒𝐢 𝐯𝐞𝐝𝐞 𝐬𝐩𝐞𝐬𝐬𝐨 𝐢𝐧 𝐠𝐢𝐫𝐨'
  return '└ *𝐍𝐎𝐓𝐎:* 𝐏𝐫𝐚𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞 𝐮𝐧𝐚 𝐜𝐞𝐥𝐞𝐛𝐫𝐢𝐭à'
}

function getActivityLevel(percent) {
  if (percent >= 80) return '💤 *𝐒𝐩𝐞𝐧𝐭𝐨* - 𝐌𝐚𝐢 𝐨𝐧𝐥𝐢𝐧𝐞'
  if (percent >= 60) return '🌙 *𝐆𝐡𝐨𝐬𝐭* - 𝐒𝐨𝐥𝐨 𝐧𝐨𝐭𝐭𝐞 𝐟𝐨𝐧𝐝𝐚'
  if (percent >= 40) return '📱 *𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨* - 𝐎𝐠𝐧𝐢 𝐭𝐚𝐧𝐭𝐨 𝐬𝐢 𝐯𝐞𝐝𝐞'
  if (percent >= 20) return '☀️ *𝐀𝐭𝐭𝐢𝐯𝐨* - 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐞 𝐬𝐩𝐞𝐬𝐬𝐨'
  return '⚡ *𝐒𝐮𝐩𝐞𝐫 𝐚𝐭𝐭𝐢𝐯𝐨* - 𝟐𝟒/𝟕 𝐨𝐧𝐥𝐢𝐧𝐞'
}

function getRiskLevel(percent) {
  if (percent >= 80) return '🔴 *𝐀𝐥𝐭𝐢𝐬𝐬𝐢𝐦𝐨* - 𝐅𝐚𝐧𝐭𝐚𝐬𝐦𝐚 𝐭𝐨𝐭𝐚𝐥𝐞'
  if (percent >= 60) return '🟠 *𝐀𝐥𝐭𝐨* - 𝐐𝐮𝐚𝐬𝐢 𝐢𝐧𝐯𝐢𝐬𝐢𝐛𝐢𝐥𝐞'
  if (percent >= 40) return '🟡 *𝐌𝐞𝐝𝐢𝐨* - 𝐒𝐢 𝐟𝐚 𝐯𝐞𝐝𝐞𝐫𝐞'
  if (percent >= 20) return '🟢 *𝐁𝐚𝐬𝐬𝐨* - 𝐏𝐫𝐨𝐟𝐢𝐥𝐨 𝐜𝐡𝐢𝐚𝐫𝐨'
  return '🔵 *𝐌𝐢𝐧𝐢𝐦𝐨* - 𝐓𝐫𝐨𝐩𝐩𝐨 𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'
}

function getWhatsAppGossip(name, percent) {
  const gossips = [
    `"𝐇𝐨 𝐯𝐢𝐬𝐭𝐨 ${name} 𝐢𝐧 𝟏𝟓 𝐠𝐫𝐮𝐩𝐩𝐢 𝐝𝐢𝐯𝐞𝐫𝐬𝐢, 𝐧𝐨𝐧 𝐩𝐚𝐫𝐥𝐚 𝐦𝐚𝐢 𝐦𝐚 𝐜’è 𝐬𝐞𝐦𝐩𝐫𝐞"`,
    `"𝐃𝐢𝐜𝐨𝐧𝐨 𝐜𝐡𝐞 ${name} 𝐚𝐛𝐛𝐢𝐚 𝟑 𝐚𝐜𝐜𝐨𝐮𝐧𝐭 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐝𝐢𝐯𝐞𝐫𝐬𝐢"`,
    `"𝐋𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨 𝐝𝐢 ${name} è 𝐥𝐚 𝐬𝐭𝐞𝐬𝐬𝐚 𝐝𝐚 𝟓 𝐚𝐧𝐧𝐢, 𝐫𝐢𝐬𝐩𝐞𝐭𝐭𝐨"`,
    `"𝐐𝐮𝐚𝐥𝐜𝐮𝐧𝐨 𝐡𝐚 𝐦𝐚𝐢 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐚 ${name}? 𝐈𝐨 𝐧𝐨"`,
    `"${name} è 𝐢𝐥 𝐜𝐥𝐚𝐬𝐬𝐢𝐜𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐜𝐡𝐞 𝐚𝐠𝐠𝐢𝐮𝐧𝐠𝐢 𝐞 𝐩𝐨𝐢 𝐝𝐢𝐦𝐞𝐧𝐭𝐢𝐜𝐡𝐢"`,
    `"𝐒𝐞𝐜𝐨𝐧𝐝𝐨 𝐦𝐞 ${name} è 𝐮𝐧 𝐛𝐨𝐭 𝐜𝐫𝐞𝐚𝐭𝐨 𝐝𝐚 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐩𝐞𝐫 𝐦𝐨𝐧𝐢𝐭𝐨𝐫𝐚𝐫𝐞 𝐢 𝐠𝐫𝐮𝐩𝐩𝐢"`,
    `"𝐇𝐨 𝐬𝐨𝐠𝐧𝐚𝐭𝐨 ${name} 𝐮𝐧𝐚 𝐯𝐨𝐥𝐭𝐚, 𝐜𝐢 𝐡𝐚 𝐩𝐚𝐫𝐥𝐚𝐭𝐨? 𝐍𝐨"`,
    `"𝐒𝐢 𝐝𝐢𝐜𝐞 𝐜𝐡𝐞 ${name} 𝐬𝐚𝐩𝐩𝐢𝐚 𝐭𝐮𝐭𝐭𝐨 𝐝𝐢 𝐭𝐮𝐭𝐭𝐢, 𝐦𝐚 𝐧𝐞𝐬𝐬𝐮𝐧𝐨 𝐬𝐚 𝐧𝐮𝐥𝐥𝐚 𝐝𝐢 𝐥𝐮𝐢/𝐥𝐞𝐢"`,
    `"𝐌𝐢𝐨 𝐜𝐮𝐠𝐢𝐧𝐨 𝐜𝐨𝐧𝐨𝐬𝐜𝐞 ${name}, 𝐦𝐚 𝐧𝐨𝐧 𝐯𝐮𝐨𝐥𝐞 𝐝𝐢𝐫𝐦𝐢 𝐜𝐡𝐢 è"`,
    `"𝐒𝐞 𝐠𝐮𝐚𝐫𝐝𝐢 𝐛𝐞𝐧𝐞, ${name} è 𝐢𝐧 𝐭𝐮𝐭𝐭𝐢 𝐢 𝐠𝐫𝐮𝐩𝐩𝐢 𝐝𝐚 𝐜𝐮𝐢 𝐬𝐞𝐢 𝐮𝐬𝐜𝐢𝐭𝐨"`,
    `"𝐋𝐚 𝐯𝐞𝐫𝐚 𝐝𝐨𝐦𝐚𝐧𝐝𝐚 è: ${name} 𝐞𝐬𝐢𝐬𝐭𝐞 𝐯𝐞𝐫𝐚𝐦𝐞𝐧𝐭𝐞?"`
  ]

  if (percent > 90) {
    return `🚨 *𝐀𝐋𝐋𝐀𝐑𝐌𝐄 𝐌𝐈𝐒𝐓𝐄𝐑𝐎:* ${random(gossips)}`
  }

  return random(gossips)
}

function getRandomHashtag() {
  const hashtags = [
    '#UtenteMisterioso', '#WhatsAppGhost', '#MaiVistoOnline',
    '#ChiSaràMai', '#LeggendaWhatsApp', '#ProfiloMistero',
    '#Sconosciuto', '#GhostMode', '#SoloInGruppo',
    '#MisteroDellaFede', '#MaiUnaParola', '#LettoreSilenzioso',
    '#PresenteMaAssente', '#Enigma', '#ChiÈCostui'
  ]

  return random(hashtags)
}

async function mainHandler(m, { conn, usedPrefix }) {
  if (!m.isGroup) {
    return m.reply('*𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐩𝐮ò 𝐞𝐬𝐬𝐞𝐫𝐞 𝐮𝐬𝐚𝐭𝐨 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.*')
  }

  const randomUnknown = random(unknownPeople)
  const mysteryPercent = Math.floor(Math.random() * 101)
  const groupsCount = Math.floor(Math.random() * 50) + 1
  const mutualGroups = Math.floor(Math.random() * groupsCount)
  const commonContacts = Math.floor(Math.random() * 20)
  const loadingBar = createLoadingBar(mysteryPercent, 15)

  const initialMsg = `*╭━━━━━━━🕵️━━━━━━━╮*
*✦ 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐔𝐍𝐊𝐍𝐎𝐖𝐍 ✦*
*╰━━━━━━━🕵️━━━━━━━╯*

*🔎 𝐒𝐜𝐚𝐧𝐬𝐢𝐨𝐧𝐚𝐧𝐝𝐨 𝐜𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲...*
*📱 𝐀𝐧𝐚𝐥𝐢𝐳𝐳𝐚𝐧𝐝𝐨 𝐩𝐚𝐫𝐭𝐞𝐜𝐢𝐩𝐚𝐧𝐭𝐢...*

${loadingBar}

*📊 𝐌𝐢𝐬𝐭𝐞𝐫𝐨 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨:* ${mysteryPercent}%
*👥 𝐆𝐫𝐮𝐩𝐩𝐢 𝐚𝐧𝐚𝐥𝐢𝐳𝐳𝐚𝐭𝐢:* ${groupsCount}`

  const sentMsg = await conn.sendMessage(m.chat, {
    text: initialMsg,
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '🔍 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐈 𝐑𝐈𝐂𝐄𝐑𝐂𝐀',
        body: '𝐂𝐞𝐫𝐜𝐚𝐧𝐝𝐨 𝐮𝐭𝐞𝐧𝐭𝐢 𝐦𝐢𝐬𝐭𝐞𝐫𝐢𝐨𝐬𝐢...',
        mediaType: 1,
        renderLargerThumbnail: false,
        thumbnailUrl: 'https://telegra.ph/file/9e123d8b0b9c9a7d3b5f4.jpg'
      }
    }
  }, { quoted: m })

  await new Promise(resolve => setTimeout(resolve, 2500))

  const activityLevel = getActivityLevel(mysteryPercent)
  const riskLevel = getRiskLevel(mysteryPercent)
  const mysteryEmoji = getMysteryEmoji(mysteryPercent)

  const resultMessage = `*╭━━━━━━━🕵️━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 ✦*
*╰━━━━━━━🕵️━━━━━━━╯*

*📱 𝐏𝐫𝐨𝐟𝐢𝐥𝐨:*  
${randomUnknown.name} │ ${randomUnknown.desc}

*━━━━━━━━━━━━━━━━━━━*
*📊 𝐒𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜𝐡𝐞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩:*

*👥 𝐆𝐫𝐮𝐩𝐩𝐢 𝐢𝐧 𝐜𝐨𝐦𝐮𝐧𝐞:* ${mutualGroups}
*👤 𝐂𝐨𝐧𝐭𝐚𝐭𝐭𝐢 𝐢𝐧 𝐜𝐨𝐦𝐮𝐧𝐞:* ${commonContacts}
*🏘️ 𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲 𝐩𝐫𝐢𝐧𝐜𝐢𝐩𝐚𝐥𝐞:* ${randomUnknown.community}
*⏰ 𝐔𝐥𝐭𝐢𝐦𝐨 𝐚𝐜𝐜𝐞𝐬𝐬𝐨:* ${randomUnknown.lastSeen}

*━━━━━━━━━━━━━━━━━━━*
*🔮 𝐋𝐢𝐯𝐞𝐥𝐥𝐨 𝐦𝐢𝐬𝐭𝐞𝐫𝐨:* ${mysteryPercent}% ${mysteryEmoji}
${getMysteryDescription(mysteryPercent)}

*📈 𝐀𝐭𝐭𝐢𝐯𝐢𝐭à:* ${activityLevel}
*⚠️ 𝐑𝐢𝐬𝐜𝐡𝐢𝐨 𝐠𝐡𝐨𝐬𝐭:* ${riskLevel}

*━━━━━━━━━━━━━━━━━━━*
*💬 𝐂𝐨𝐬𝐚 𝐝𝐢𝐜𝐞 𝐥𝐚 𝐜𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲:*

${getWhatsAppGossip(randomUnknown.name, mysteryPercent)}

${getRandomHashtag()}`.trim()

  await conn.sendMessage(m.chat, {
    text: resultMessage,
    footer: '🕵️ 𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩',
    buttons: actionButtons(usedPrefix),
    headerType: 1,
    mentions: [m.sender]
  }, { quoted: sentMsg })
}

async function profileHandler(m) {
  const profiles = [
    '📸 *𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎:* 𝐔𝐧𝐚 𝐬𝐢𝐥𝐡𝐨𝐮𝐞𝐭𝐭𝐞 𝐧𝐞𝐫𝐚, 𝐜𝐥𝐚𝐬𝐬𝐢𝐜𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨 𝐦𝐢𝐬𝐭𝐞𝐫𝐢𝐨𝐬𝐨',
    '📸 *𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎:* 𝐈𝐥 𝐬𝐨𝐥𝐞 𝐬𝐮 𝐮𝐧𝐚 𝐬𝐩𝐢𝐚𝐠𝐠𝐢𝐚, 𝐩𝐫𝐨𝐛𝐚𝐛𝐢𝐥𝐦𝐞𝐧𝐭𝐞 𝐩𝐫𝐞𝐬𝐚 𝐝𝐚 𝐆𝐨𝐨𝐠𝐥𝐞',
    '📸 *𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎:* 𝐔𝐧 𝐠𝐚𝐭𝐭𝐨 𝐧𝐞𝐫𝐨, 𝟗𝟗% 𝐧𝐨𝐧 è 𝐢𝐥 𝐬𝐮𝐨 𝐠𝐚𝐭𝐭𝐨',
    '📸 *𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎:* 𝐅𝐢𝐨𝐫𝐞 𝐯𝐢𝐨𝐥𝐚, 𝐦𝐨𝐥𝐭𝐨 𝐛𝐚𝐬𝐢𝐜',
    '📸 *𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎:* 𝐈𝐜𝐨𝐧𝐚 𝐩𝐫𝐞𝐝𝐞𝐟𝐢𝐧𝐢𝐭𝐚 𝐝𝐢 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩, 𝐢𝐥 𝐯𝐞𝐫𝐨 𝐦𝐢𝐬𝐭𝐞𝐫𝐨',
    '📸 *𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎:* 𝐅𝐚𝐦𝐨𝐬𝐨 𝐚𝐭𝐭𝐨𝐫𝐞, 𝐩𝐫𝐨𝐛𝐚𝐛𝐢𝐥𝐦𝐞𝐧𝐭𝐞 𝐜𝐢 𝐩𝐫𝐨𝐯𝐚',
    '📸 *𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎:* 𝐏𝐚𝐞𝐬𝐚𝐠𝐠𝐢𝐨 𝐦𝐨𝐧𝐭𝐚𝐧𝐨, 𝐜𝐞𝐫𝐜𝐚 𝐚𝐯𝐯𝐞𝐧𝐭𝐮𝐫𝐞',
    '📸 *𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎:* 𝐄𝐦𝐨𝐣𝐢 𝐠𝐢𝐠𝐚𝐧𝐭𝐞, 𝐧𝐮𝐥𝐥𝐚 𝐝𝐢 𝐜𝐡𝐞'
  ]

  await m.reply(`*╭━━━━━━━📸━━━━━━━╮*
*✦ 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 𝐌𝐈𝐒𝐓𝐄𝐑𝐈𝐎𝐒𝐎 ✦*
*╰━━━━━━━📸━━━━━━━╯*

${random(profiles)}`)
}

async function storyHandler(m) {
  const stories = [
    '📖 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐬𝐭𝐚𝐭𝐨 𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝐚 𝟓𝟎 𝐠𝐫𝐮𝐩𝐩𝐢 𝐧𝐞𝐥 𝟐𝟎𝟐𝟎 𝐞 𝐝𝐚 𝐚𝐥𝐥𝐨𝐫𝐚 𝐧𝐨𝐧 𝐡𝐚 𝐦𝐚𝐢 𝐝𝐞𝐭𝐭𝐨 𝐮𝐧𝐚 𝐩𝐚𝐫𝐨𝐥𝐚.',
    '📖 𝐒𝐢 𝐮𝐧𝐢𝐬𝐜𝐞 𝐚𝐢 𝐠𝐫𝐮𝐩𝐩𝐢, 𝐥𝐞𝐠𝐠𝐞 𝐭𝐮𝐭𝐭𝐨, 𝐬𝐚𝐥𝐯𝐚 𝐢 𝐦𝐞𝐝𝐢𝐚, 𝐞 𝐬𝐩𝐚𝐫𝐢𝐬𝐜𝐞. 𝐈𝐥 𝐟𝐚𝐧𝐭𝐚𝐬𝐦𝐚 𝐝𝐢 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩.',
    '📖 𝐇𝐚 𝐥𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨 𝐝𝐢 𝐮𝐧𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐟𝐚𝐦𝐨𝐬𝐚, 𝐧𝐞𝐬𝐬𝐮𝐧𝐨 𝐬𝐚 𝐜𝐡𝐢 𝐬𝐢𝐚 𝐯𝐞𝐫𝐚𝐦𝐞𝐧𝐭𝐞.',
    '📖 𝐄𝐫𝐚 𝐚𝐭𝐭𝐢𝐯𝐢𝐬𝐬𝐢𝐦𝐨 𝐧𝐞𝐥 𝟐𝟎𝟏𝟗, 𝐩𝐨𝐢 𝐮𝐧 𝐠𝐢𝐨𝐫𝐧𝐨 𝐬𝐜𝐨𝐦𝐩𝐚𝐫𝐯𝐞. 𝐈𝐥 𝐬𝐮𝐨 𝐮𝐥𝐭𝐢𝐦𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐟𝐮 “𝐜𝐢𝐚𝐨”.',
    '📖 𝐂𝐨𝐦𝐩𝐚𝐫𝐞 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢 𝐝𝐢 𝐬𝐜𝐚𝐦𝐛𝐢𝐨 𝐥𝐢𝐛𝐫𝐢, 𝐦𝐚 𝐧𝐨𝐧 𝐡𝐚 𝐦𝐚𝐢 𝐥𝐞𝐭𝐭𝐨 𝐮𝐧 𝐥𝐢𝐛𝐫𝐨 𝐢𝐧 𝐯𝐢𝐭𝐚 𝐬𝐮𝐚.',
    '📖 𝐇𝐚 𝟑 𝐧𝐮𝐦𝐞𝐫𝐢 𝐝𝐢 𝐭𝐞𝐥𝐞𝐟𝐨𝐧𝐨 𝐝𝐢𝐯𝐞𝐫𝐬𝐢 𝐞 𝐢𝐧 𝐨𝐠𝐧𝐢 𝐠𝐫𝐮𝐩𝐩𝐨 𝐧𝐞 𝐮𝐬𝐚 𝐮𝐧𝐨 𝐝𝐢𝐯𝐞𝐫𝐬𝐨.'
  ]

  await m.reply(`*╭━━━━━━━📖━━━━━━━╮*
*✦ 𝐒𝐓𝐎𝐑𝐈𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀 ✦*
*╰━━━━━━━📖━━━━━━━╯*

${random(stories)}`)
}

const handler = async (m, { conn, usedPrefix, command }) => {
  if (command === 'randomprofile') {
    return profileHandler(m, { conn })
  }

  if (command === 'randomstory') {
    return storyHandler(m, { conn })
  }

  return mainHandler(m, { conn, usedPrefix, command })
}

handler.help = ['random', 'randomprofile', 'randomstory']
handler.tags = ['fun']
handler.command = /^(random|randomprofile|randomstory)$/i
handler.group = true

export default handler