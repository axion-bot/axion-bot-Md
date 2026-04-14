// by Bonzino

const proposals = {}

const S = v => String(v || '')
const bare = j => S(j || '').split('@')[0].split(':')[0]
const tag = jid => '@' + bare(jid)

function ensureUser(user) {
  if (!Array.isArray(user.figli)) user.figli = []
  if (!Array.isArray(user.fratelli)) user.fratelli = []
  if (!Array.isArray(user.sorelle)) user.sorelle = []
  if (!Array.isArray(user.nonni)) user.nonni = []
  if (!Array.isArray(user.nonne)) user.nonne = []
  if (!Array.isArray(user.cugini)) user.cugini = []
  if (!Array.isArray(user.cugine)) user.cugine = []
  if (!Array.isArray(user.nipoti)) user.nipoti = []

  if (typeof user.madre !== 'string') user.madre = ''
  if (typeof user.padre !== 'string') user.padre = ''
}

function addUnique(arr, value) {
  if (!Array.isArray(arr)) return
  if (!arr.includes(value)) arr.push(value)
}

function getButtonId(m) {
  try {
    if (m.text) return m.text

    const msg = m.message || {}

    if (msg.buttonsResponseMessage?.selectedButtonId)
      return msg.buttonsResponseMessage.selectedButtonId

    if (msg.templateButtonReplyMessage?.selectedId)
      return msg.templateButtonReplyMessage.selectedId

    const native = msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
    if (native) {
      const parsed = JSON.parse(native)
      if (parsed?.id) return parsed.id
    }

    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId)
      return msg.listResponseMessage.singleSelectReply.selectedRowId
  } catch {}

  return ''
}

function getRequestText(command, from, to) {
  switch (command) {
    case 'madre':
      return `*👩 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐫𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞*\n\n${tag(from)} 𝐯𝐨𝐫𝐫𝐞𝐛𝐛𝐞 𝐜𝐡𝐞 𝐭𝐮 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐬𝐬𝐢 𝐬𝐮𝐚 𝐦𝐚𝐝𝐫𝐞.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
    case 'padre':
      return `*👨 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐫𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞*\n\n${tag(from)} 𝐯𝐨𝐫𝐫𝐞𝐛𝐛𝐞 𝐜𝐡𝐞 𝐭𝐮 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐬𝐬𝐢 𝐬𝐮𝐨 𝐩𝐚𝐝𝐫𝐞.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
    case 'figlio':
      return `*👶 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐫𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞*\n\n${tag(from)} 𝐯𝐨𝐫𝐫𝐞𝐛𝐛𝐞 𝐜𝐡𝐞 𝐭𝐮 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐬𝐬𝐢 𝐬𝐮𝐨 𝐟𝐢𝐠𝐥𝐢𝐨.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
    case 'adotta':
      return `*👨‍👩‍👧 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚*\n\n${tag(from)} 𝐯𝐮𝐨𝐥𝐞 𝐚𝐝𝐨𝐭𝐭𝐚𝐫𝐭𝐢 𝐜𝐨𝐦𝐞 𝐟𝐢𝐠𝐥𝐢𝐨/𝐚.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
    case 'fratello':
      return `*🧑‍🤝‍🧑 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚*\n\n${tag(from)} 𝐯𝐨𝐫𝐫𝐞𝐛𝐛𝐞 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐫𝐞 𝐭𝐮𝐨 𝐟𝐫𝐚𝐭𝐞𝐥𝐥𝐨.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
    case 'sorella':
      return `*👭 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚*\n\n${tag(from)} 𝐯𝐨𝐫𝐫𝐞𝐛𝐛𝐞 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐫𝐞 𝐭𝐮𝐚 𝐬𝐨𝐫𝐞𝐥𝐥𝐚.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
    case 'nonno':
      return `*👴 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚*\n\n${tag(from)} 𝐯𝐨𝐫𝐫𝐞𝐛𝐛𝐞 𝐜𝐡𝐞 𝐭𝐮 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐬𝐬𝐢 𝐬𝐮𝐨 𝐧𝐨𝐧𝐧𝐨.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
    case 'nonna':
      return `*👵 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚*\n\n${tag(from)} 𝐯𝐨𝐫𝐫𝐞𝐛𝐛𝐞 𝐜𝐡𝐞 𝐭𝐮 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐬𝐬𝐢 𝐬𝐮𝐚 𝐧𝐨𝐧𝐧𝐚.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
    case 'cugino':
      return `*👬 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚*\n\n${tag(from)} 𝐯𝐨𝐫𝐫𝐞𝐛𝐛𝐞 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐫𝐞 𝐭𝐮𝐨 𝐜𝐮𝐠𝐢𝐧𝐨.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
    case 'cugina':
      return `*👭 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚*\n\n${tag(from)} 𝐯𝐨𝐫𝐫𝐞𝐛𝐛𝐞 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐫𝐞 𝐭𝐮𝐚 𝐜𝐮𝐠𝐢𝐧𝐚.\n\n*𝐀𝐜𝐜𝐞𝐭𝐭𝐢?*`
  }
}

function applyRelation(command, sender, target, user1, user2) {
  if (command === 'madre') {
    user1.madre = target
    addUnique(user2.figli, sender)
    return `*👩 𝐎𝐫𝐚 ${tag(target)} è 𝐥𝐚 𝐦𝐚𝐝𝐫𝐞 𝐝𝐢 ${tag(sender)}.*`
  }

  if (command === 'padre') {
    user1.padre = target
    addUnique(user2.figli, sender)
    return `*👨 𝐎𝐫𝐚 ${tag(target)} è 𝐢𝐥 𝐩𝐚𝐝𝐫𝐞 𝐝𝐢 ${tag(sender)}.*`
  }

  if (command === 'figlio') {
    addUnique(user1.figli, target)
    return `*👶 𝐎𝐫𝐚 ${tag(target)} è 𝐟𝐢𝐠𝐥𝐢𝐨 𝐝𝐢 ${tag(sender)}.*`
  }

  if (command === 'adotta') {
    addUnique(user1.figli, target)
    return `*👨‍👩‍👧 𝐎𝐫𝐚 ${tag(target)} è 𝐟𝐢𝐠𝐥𝐢𝐨/𝐚 𝐚𝐝𝐨𝐭𝐭𝐢𝐯𝐨/𝐚 𝐝𝐢 ${tag(sender)}.*`
  }

  if (command === 'fratello') {
    addUnique(user1.fratelli, target)
    addUnique(user2.fratelli, sender)
    return `*🧑‍🤝‍🧑 𝐎𝐫𝐚 ${tag(sender)} e ${tag(target)} sono 𝐟𝐫𝐚𝐭𝐞𝐥𝐥𝐢.*`
  }

  if (command === 'sorella') {
    addUnique(user1.sorelle, target)
    addUnique(user2.sorelle, sender)
    return `*👭 𝐎𝐫𝐚 ${tag(sender)} e ${tag(target)} sono 𝐬𝐨𝐫𝐞𝐥𝐥𝐞.*`
  }

  if (command === 'nonno') {
    addUnique(user1.nonni, target)
    addUnique(user2.nipoti, sender)
    return `*👴 𝐎𝐫𝐚 ${tag(target)} è 𝐢𝐥 𝐧𝐨𝐧𝐧𝐨 𝐝𝐢 ${tag(sender)}.*`
  }

  if (command === 'nonna') {
    addUnique(user1.nonne, target)
    addUnique(user2.nipoti, sender)
    return `*👵 𝐎𝐫𝐚 ${tag(target)} è 𝐥𝐚 𝐧𝐨𝐧𝐧𝐚 𝐝𝐢 ${tag(sender)}.*`
  }

  if (command === 'cugino') {
    addUnique(user1.cugini, target)
    addUnique(user2.cugini, sender)
    return `*👬 𝐎𝐫𝐚 ${tag(sender)} e ${tag(target)} sono 𝐜𝐮𝐠𝐢𝐧𝐢.*`
  }

  if (command === 'cugina') {
    addUnique(user1.cugine, target)
    addUnique(user2.cugine, sender)
    return `*👭 𝐎𝐫𝐚 ${tag(sender)} e ${tag(target)} sono 𝐜𝐮𝐠𝐢𝐧𝐞.*`
  }
}

let handler = async (m, { conn, command, usedPrefix }) => {
  const sender = m.sender
  const target = m.mentionedJid?.[0] || m.quoted?.sender

  if (!target) return m.reply(`*⚠️ Usa:* ${usedPrefix}${command} @utente`)
  if (target === sender) return m.reply('*❌ Non puoi farlo con te stesso*')

  proposals[target] = { from: sender, relation: command }

  return conn.sendMessage(m.chat, {
    text: getRequestText(command, sender, target),
    mentions: [sender, target],
    footer: 'Scegli una risposta',
    buttons: [
      { buttonId: 'relazione_si', buttonText: { displayText: '✅ Accetta' }, type: 1 },
      { buttonId: 'relazione_no', buttonText: { displayText: '❌ Rifiuta' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.before = async function (m) {
  const pending = proposals[m.sender]
  if (!pending) return

  const txt = getButtonId(m)

  const accept = txt === 'relazione_si'
  const reject = txt === 'relazione_no'

  if (!accept && !reject) return

  const sender = pending.from
  const relation = pending.relation
  const target = m.sender

  delete proposals[m.sender]

  const user1 = global.db.data.users[sender]
  const user2 = global.db.data.users[target]

  ensureUser(user1)
  ensureUser(user2)

  if (reject) {
    await this.sendMessage(m.chat, {
      text: `*❌ ${tag(target)} ha rifiutato.*`,
      mentions: [sender, target]
    }, { quoted: m })
    return true
  }

  const result = applyRelation(relation, sender, target, user1, user2)

  await this.sendMessage(m.chat, {
    text: result,
    mentions: [sender, target]
  }, { quoted: m })

  return true
}

handler.command = /^(madre|padre|figlio|adotta|fratello|sorella|nonno|nonna|cugino|cugina)$/i
handler.tags = ['fun']
handler.help = ['relazioni']

export default handler