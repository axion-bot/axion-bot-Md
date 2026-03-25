// by Bonzino

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
  if (!Array.isArray(user.amici)) user.amici = []
  if (!Array.isArray(user.ex)) user.ex = []

  if (typeof user.madre !== 'string') user.madre = ''
  if (typeof user.padre !== 'string') user.padre = ''
  if (typeof user.coniuge !== 'string') user.coniuge = ''
  if (typeof user.sposato !== 'boolean') user.sposato = false
}

function removeFromArray(arr, value) {
  if (!Array.isArray(arr)) return false
  const i = arr.indexOf(value)
  if (i === -1) return false
  arr.splice(i, 1)
  return true
}

const tipi = [
  'madre',
  'padre',
  'figlio',
  'fratello',
  'sorella',
  'nonno',
  'nonna',
  'cugino',
  'cugina'
]

let handler = async (m, { conn, args, usedPrefix }) => {
  const sender = m.sender
  const tipo = (args[0] || '').toLowerCase()
  const target = m.mentionedJid?.[0] || m.quoted?.sender || null

  if (!tipi.includes(tipo)) {
    return conn.sendMessage(m.chat, {
      text: `*⚠️ 𝐓𝐢𝐩𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨*\n\n𝐔𝐬𝐚:\n${usedPrefix}delrelazione madre @utente\n${usedPrefix}delrelazione padre @utente\n${usedPrefix}delrelazione figlio @utente\n${usedPrefix}delrelazione fratello @utente\n${usedPrefix}delrelazione sorella @utente\n${usedPrefix}delrelazione nonno @utente\n${usedPrefix}delrelazione nonna @utente\n${usedPrefix}delrelazione cugino @utente\n${usedPrefix}delrelazione cugina @utente`
    }, { quoted: m })
  }

  const user1 = global.db.data.users[sender] || (global.db.data.users[sender] = {})
  ensureUser(user1)

  if ((tipo === 'madre' || tipo === 'padre') && !target) {
    if (tipo === 'madre') {
      if (!user1.madre) {
        return m.reply('*⚠️ 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐮𝐧𝐚 𝐦𝐚𝐝𝐫𝐞 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐚*')
      }

      const old = user1.madre
      const user2 = global.db.data.users[old] || (global.db.data.users[old] = {})
      ensureUser(user2)

      user1.madre = ''
      removeFromArray(user2.figli, sender)

      return conn.sendMessage(m.chat, {
        text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(old)} 𝐧𝐨𝐧 𝐞̀ 𝐩𝐢𝐮̀ 𝐥𝐚 𝐦𝐚𝐝𝐫𝐞 𝐝𝐢 ${tag(sender)}.`,
        mentions: [sender, old]
      }, { quoted: m })
    }

    if (!user1.padre) {
      return m.reply('*⚠️ 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐮𝐧 𝐩𝐚𝐝𝐫𝐞 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨*')
    }

    const old = user1.padre
    const user2 = global.db.data.users[old] || (global.db.data.users[old] = {})
    ensureUser(user2)

    user1.padre = ''
    removeFromArray(user2.figli, sender)

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(old)} 𝐧𝐨𝐧 𝐞̀ 𝐩𝐢𝐮̀ 𝐢𝐥 𝐩𝐚𝐝𝐫𝐞 𝐝𝐢 ${tag(sender)}.`,
      mentions: [sender, old]
    }, { quoted: m })
  }

  if (!target) {
    return conn.sendMessage(m.chat, {
      text: `*⚠️ 𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞*\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n${usedPrefix}delrelazione ${tipo} @utente`
    }, { quoted: m })
  }

  if (target === sender) {
    return m.reply('*❌ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐮𝐧𝐚 𝐫𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐜𝐨𝐧 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨*')
  }

  const user2 = global.db.data.users[target] || (global.db.data.users[target] = {})
  ensureUser(user2)

  if (tipo === 'madre') {
    if (user1.madre !== target) {
      return m.reply(`*⚠️ ${tag(target)} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐭𝐮𝐚 𝐦𝐚𝐝𝐫𝐞*`)
    }

    user1.madre = ''
    removeFromArray(user2.figli, sender)

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(target)} 𝐧𝐨𝐧 𝐞̀ 𝐩𝐢𝐮̀ 𝐥𝐚 𝐦𝐚𝐝𝐫𝐞 𝐝𝐢 ${tag(sender)}.`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  if (tipo === 'padre') {
    if (user1.padre !== target) {
      return m.reply(`*⚠️ ${tag(target)} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐭𝐮𝐨 𝐩𝐚𝐝𝐫𝐞*`)
    }

    user1.padre = ''
    removeFromArray(user2.figli, sender)

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(target)} 𝐧𝐨𝐧 𝐞̀ 𝐩𝐢𝐮̀ 𝐢𝐥 𝐩𝐚𝐝𝐫𝐞 𝐝𝐢 ${tag(sender)}.`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  if (tipo === 'figlio') {
    if (!removeFromArray(user1.figli, target)) {
      return m.reply(`*⚠️ ${tag(target)} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐭𝐮𝐨 𝐟𝐢𝐠𝐥𝐢𝐨*`)
    }

    if (user2.madre === sender) user2.madre = ''
    if (user2.padre === sender) user2.padre = ''
    removeFromArray(user2.nipoti, sender)

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(target)} 𝐧𝐨𝐧 𝐞̀ 𝐩𝐢𝐮̀ 𝐟𝐢𝐠𝐥𝐢𝐨 𝐝𝐢 ${tag(sender)}.`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  if (tipo === 'fratello') {
    const ok1 = removeFromArray(user1.fratelli, target)
    const ok2 = removeFromArray(user2.fratelli, sender)

    if (!ok1 && !ok2) {
      return m.reply(`*⚠️ ${tag(target)} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐭𝐮𝐨 𝐟𝐫𝐚𝐭𝐞𝐥𝐥𝐨*`)
    }

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(sender)} 𝐞 ${tag(target)} 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐩𝐢𝐮̀ 𝐟𝐫𝐚𝐭𝐞𝐥𝐥𝐢.`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  if (tipo === 'sorella') {
    const ok1 = removeFromArray(user1.sorelle, target)
    const ok2 = removeFromArray(user2.sorelle, sender)

    if (!ok1 && !ok2) {
      return m.reply(`*⚠️ ${tag(target)} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐭𝐮𝐚 𝐬𝐨𝐫𝐞𝐥𝐥𝐚*`)
    }

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(sender)} 𝐞 ${tag(target)} 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐩𝐢𝐮̀ 𝐬𝐨𝐫𝐞𝐥𝐥𝐞.`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  if (tipo === 'nonno') {
    const ok1 = removeFromArray(user1.nonni, target)
    const ok2 = removeFromArray(user2.nipoti, sender)

    if (!ok1 && !ok2) {
      return m.reply(`*⚠️ ${tag(target)} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐭𝐮𝐨 𝐧𝐨𝐧𝐧𝐨*`)
    }

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(target)} 𝐧𝐨𝐧 𝐞̀ 𝐩𝐢𝐮̀ 𝐢𝐥 𝐧𝐨𝐧𝐧𝐨 𝐝𝐢 ${tag(sender)}.`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  if (tipo === 'nonna') {
    const ok1 = removeFromArray(user1.nonne, target)
    const ok2 = removeFromArray(user2.nipoti, sender)

    if (!ok1 && !ok2) {
      return m.reply(`*⚠️ ${tag(target)} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐭𝐮𝐚 𝐧𝐨𝐧𝐧𝐚*`)
    }

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(target)} 𝐧𝐨𝐧 𝐞̀ 𝐩𝐢𝐮̀ 𝐥𝐚 𝐧𝐨𝐧𝐧𝐚 𝐝𝐢 ${tag(sender)}.`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  if (tipo === 'cugino') {
    const ok1 = removeFromArray(user1.cugini, target)
    const ok2 = removeFromArray(user2.cugini, sender)

    if (!ok1 && !ok2) {
      return m.reply(`*⚠️ ${tag(target)} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐭𝐮𝐨 𝐜𝐮𝐠𝐢𝐧𝐨*`)
    }

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(sender)} 𝐞 ${tag(target)} 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐩𝐢𝐮̀ 𝐜𝐮𝐠𝐢𝐧𝐢.`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  if (tipo === 'cugina') {
    const ok1 = removeFromArray(user1.cugine, target)
    const ok2 = removeFromArray(user2.cugine, sender)

    if (!ok1 && !ok2) {
      return m.reply(`*⚠️ ${tag(target)} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐭𝐮𝐚 𝐜𝐮𝐠𝐢𝐧𝐚*`)
    }

    return conn.sendMessage(m.chat, {
      text: `*🗑️ 𝐑𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐚*\n\n${tag(sender)} 𝐞 ${tag(target)} 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐩𝐢𝐮̀ 𝐜𝐮𝐠𝐢𝐧𝐞.`,
      mentions: [sender, target]
    }, { quoted: m })
  }
}

handler.help = ['delrelazione']
handler.tags = ['fun']
handler.command = /^(delrelazione)$/i
handler.group = true

export default handler