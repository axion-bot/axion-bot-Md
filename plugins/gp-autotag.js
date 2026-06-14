// tag-auto by Bonzino

import fs from 'fs'

const FILE = './database/tags.json'

const loadTags = () => {
  try { return JSON.parse(fs.readFileSync(FILE)) }
  catch { return {} }
}

const saveTags = data =>
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))

let handler = async (m,{ conn, command, args, isAdmin, isOwner }) => {
  const tags = loadTags()

  if (command === 'savetag' || command === 'addtag') {
    if (!isAdmin && !isOwner) throw '*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫.*'

    const user = m.mentionedJid?.[0] || m.quoted?.sender
    if (!user) throw '*❌ 𝐓𝐚𝐠𝐠𝐚 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐝 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞.*'

    const alias = args.filter(v => !v.startsWith('@')).join(' ').trim().toLowerCase()
    if (!alias) throw '*❌ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐚𝐥𝐢𝐚𝐬.*'

    tags[m.chat] ||= {}
    tags[m.chat][user] ||= []

    if (!tags[m.chat][user].includes(alias))
      tags[m.chat][user].push(alias)

    saveTags(tags)

    return m.reply(`*✅ 𝐓𝐀𝐆 𝐒𝐀𝐋𝐕𝐀𝐓𝐎*\n\n👤 *${alias}*`)
  }

  if (command === 'removetag') {
    if (!isAdmin && !isOwner) throw '*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫.*'

    const user = m.mentionedJid?.[0] || m.quoted?.sender
    if (!user) throw '*❌ 𝐓𝐚𝐠𝐠𝐚 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐝 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞.*'

    const alias = args.filter(v => !v.startsWith('@')).join(' ').trim().toLowerCase()
    if (!alias) throw '*❌ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐚𝐥𝐢𝐚𝐬.*'

    if (!tags[m.chat]?.[user])
      throw '*❌ 𝐍𝐄𝐒𝐒𝐔𝐍 𝐓𝐀𝐆 𝐓𝐑𝐎𝐕𝐀𝐓𝐎.*'

    tags[m.chat][user] = tags[m.chat][user].filter(v => v !== alias)

    if (!tags[m.chat][user]?.length)
      delete tags[m.chat][user]

    saveTags(tags)

    return m.reply(`*✅ 𝐓𝐀𝐆 𝐑𝐈𝐌𝐎𝐒𝐒𝐎*\n\n👤 *${alias}*`)
  }

  if (command === 'listatag') {
    const groupTags = tags[m.chat] || {}

    let txt = '*📋 𝐋𝐈𝐒𝐓𝐀 𝐓𝐀𝐆*'

    for (const [jid, aliases] of Object.entries(groupTags))
      txt += `\n\n@${jid.split('@')[0]}\n${aliases.join(', ')}`

    return conn.sendMessage(m.chat,{
      text: txt,
      mentions: Object.keys(groupTags)
    },{ quoted: m })
  }
}

handler.before = async function (m,{ conn }) {
  if (!m.isGroup || !m.text || m.fromMe) return false

  const groupTags = loadTags()[m.chat] || {}
  const text = m.text.toLowerCase().trim().replace(/^@/, '')

  let jid = null

  for (const [user, aliases] of Object.entries(groupTags)) {
    if (aliases.includes(text)) {
      jid = user
      break
    }
  }

  if (!jid) return false

  await conn.sendMessage(m.chat,{
    text: `@${jid.split('@')[0]}`,
    mentions: [jid]
  },{ quoted: m })

  return true
}

handler.help = ['addtag','savetag','removetag','listatag']
handler.tags = ['funzioni']
handler.command = /^(addtag|savetag|removetag|listatag)$/i
handler.group = true

export default handler