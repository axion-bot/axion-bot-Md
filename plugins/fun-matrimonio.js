// by Bonzino

const proposals = {}

const S = v => String(v || '')
const bare = j => S(j).split('@')[0].split(':')[0]
const tag = jid => '@' + bare(jid)

function ensureUser(user) {
  if (!Array.isArray(user.ex)) user.ex = []
  if (!Array.isArray(user.figli)) user.figli = []
  if (typeof user.sposato !== 'boolean') user.sposato = false
  if (typeof user.coniuge !== 'string') user.coniuge = ''
}

function getButtonId(m) {
  try {
    if (m.text) return m.text

    const msg = m.message || {}

    if (msg.buttonsResponseMessage?.selectedButtonId) {
      return msg.buttonsResponseMessage.selectedButtonId
    }

    if (msg.templateButtonReplyMessage?.selectedId) {
      return msg.templateButtonReplyMessage.selectedId
    }

    const native = msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
    if (native) {
      const parsed = JSON.parse(native)
      if (parsed?.id) return parsed.id
    }

    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) {
      return msg.listResponseMessage.singleSelectReply.selectedRowId
    }
  } catch {}

  return ''
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const sender = m.sender
  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender || null

  const user1 = global.db.data.users[sender] || (global.db.data.users[sender] = {})
  ensureUser(user1)

  if (command === 'sposa') {
    if (!mentioned) {
      return conn.sendMessage(m.chat, {
        text: `*⚠️ 𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚𝐥𝐥'𝐮𝐭𝐞𝐧𝐭𝐞 𝐜𝐡𝐞 𝐯𝐮𝐨𝐢 𝐬𝐩𝐨𝐬𝐚𝐫𝐞*\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n${usedPrefix}sposa @utente`
      }, { quoted: m })
    }

    if (mentioned === sender) {
      return conn.sendMessage(m.chat, {
        text: '*❌ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐬𝐩𝐨𝐬𝐚𝐫𝐞 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨*'
      }, { quoted: m })
    }

    const user2 = global.db.data.users[mentioned] || (global.db.data.users[mentioned] = {})
    ensureUser(user2)

    if (user1.sposato) {
      return conn.sendMessage(m.chat, {
        text: `*💍 𝐓𝐮 𝐬𝐞𝐢 𝐠𝐢à 𝐬𝐩𝐨𝐬𝐚𝐭𝐨 𝐜𝐨𝐧* ${tag(user1.coniuge)}`
      }, { quoted: m })
    }

    if (user2.sposato) {
      return conn.sendMessage(m.chat, {
        text: `*💍 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐬𝐩𝐨𝐬𝐚𝐭𝐨 𝐜𝐨𝐧* ${tag(user2.coniuge)}`
      }, { quoted: m })
    }

    proposals[mentioned] = {
      from: sender,
      timestamp: Date.now()
    }

    setTimeout(() => {
      if (proposals[mentioned] && proposals[mentioned].from === sender) {
        delete proposals[mentioned]
      }
    }, 60000)

    return conn.sendMessage(m.chat, {
      text: `*💍 𝐏𝐫𝐨𝐩𝐨𝐬𝐭𝐚 𝐝𝐢 𝐦𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨!*\n\n${tag(sender)} 𝐡𝐚 𝐜𝐡𝐢𝐞𝐬𝐭𝐨 𝐚 ${tag(mentioned)} 𝐝𝐢 𝐬𝐩𝐨𝐬𝐚𝐫𝐥𝐨.\n\n*𝐇𝐚𝐢 𝟔𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐩𝐞𝐫 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞.*`,
      mentions: [sender, mentioned],
      footer: 'Scegli una risposta',
      buttons: [
        { buttonId: 'matrimonio_si', buttonText: { displayText: '✅ Accetta' }, type: 1 },
        { buttonId: 'matrimonio_no', buttonText: { displayText: '❌ Rifiuta' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === 'divorzia') {
    if (!user1.sposato || !user1.coniuge) {
      return conn.sendMessage(m.chat, {
        text: '*💔 𝐍𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐢 𝐬𝐩𝐨𝐬𝐚𝐭𝐨*'
      }, { quoted: m })
    }

    const spouse = user1.coniuge
    const user2 = global.db.data.users[spouse] || (global.db.data.users[spouse] = {})
    ensureUser(user2)

    if (!user1.ex.includes(spouse)) user1.ex.push(spouse)
    if (!user2.ex.includes(sender)) user2.ex.push(sender)

    user1.sposato = false
    user2.sposato = false

    user1.coniuge = ''
    user2.coniuge = ''

    return conn.sendMessage(m.chat, {
      text: `*💔 𝐃𝐢𝐯𝐨𝐫𝐳𝐢𝐨 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨*\n\n${tag(sender)} 𝐞 ${tag(spouse)} 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐩𝐢ù 𝐬𝐩𝐨𝐬𝐚𝐭𝐢.`,
      mentions: [sender, spouse]
    }, { quoted: m })
  }
}

handler.before = async function (m) {
  const sender = m.sender
  const pending = proposals[sender]

  if (!pending) return

  const txt = getButtonId(m)

  const response =
    txt === 'matrimonio_si' || /^matrimonio_si$/i.test(txt) ||
    txt === 'Si' || /^si$/i.test(txt)

  const reject =
    txt === 'matrimonio_no' || /^matrimonio_no$/i.test(txt) ||
    txt === 'No' || /^no$/i.test(txt)

  if (!response && !reject) return

  const proposer = pending.from
  delete proposals[sender]

  const user1 = global.db.data.users[proposer] || (global.db.data.users[proposer] = {})
  const user2 = global.db.data.users[sender] || (global.db.data.users[sender] = {})

  ensureUser(user1)
  ensureUser(user2)

  if (reject) {
    await this.sendMessage(m.chat, {
      text: `*💔 𝐏𝐫𝐨𝐩𝐨𝐬𝐭𝐚 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐚*\n\n${tag(sender)} 𝐡𝐚 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐨 𝐥𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 ${tag(proposer)}.`,
      mentions: [sender, proposer]
    }, { quoted: m })

    return true
  }

  if (user1.sposato || user2.sposato) {
    await this.sendMessage(m.chat, {
      text: '*⚠️ 𝐔𝐧𝐨 𝐝𝐞𝐢 𝐝𝐮𝐞 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐠𝐢à 𝐬𝐩𝐨𝐬𝐚𝐭𝐨*'
    }, { quoted: m })

    return true
  }

  user1.sposato = true
  user2.sposato = true

  user1.coniuge = sender
  user2.coniuge = proposer

  if (!user1.primoMatrimonio) user1.primoMatrimonio = Date.now()
  if (!user2.primoMatrimonio) user2.primoMatrimonio = Date.now()

  await this.sendMessage(m.chat, {
    text: `*💍 𝐌𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨!*\n\n${tag(proposer)} 𝐞 ${tag(sender)} 𝐨𝐫𝐚 𝐬𝐨𝐧𝐨 𝐬𝐩𝐨𝐬𝐚𝐭𝐢.`,
    mentions: [proposer, sender]
  }, { quoted: m })

  return true
}

handler.help = ['sposa', 'divorzia']
handler.tags = ['fun']
handler.command = /^(sposa|divorzia)$/i
handler.group = true

export default handler