// migrate by Bonzino

const normalizeJid = input => {
  if (!input) return null
  input = input.trim()
  if (input.includes('@')) return input
  const number = input.replace(/\D/g, '')
  if (!number) return null
  return `${number}@s.whatsapp.net`
}

function mergeObjects(oldData, newData) {
  for (const key in oldData) {
    const oldVal = oldData[key]
    const newVal = newData[key]

    if (
      key === 'joinedAt' ||
      key === 'firstMsgAt'
    ) {
      if (oldVal) newData[key] = oldVal
      continue
    }

    if (
      typeof oldVal === 'number' &&
      typeof newVal === 'number'
    ) {
      newData[key] += oldVal
    } else if (
      oldVal &&
      typeof oldVal === 'object' &&
      !Array.isArray(oldVal)
    ) {
      newData[key] ||= {}
      mergeObjects(oldVal, newData[key])
    } else if (newVal == null) {
      newData[key] = oldVal
    }
  }
}

function migrateKeys(obj, oldJid, newJid) {
  if (!obj || typeof obj !== 'object') return

  if (Object.prototype.hasOwnProperty.call(obj, oldJid)) {
    if (
      obj[newJid] &&
      typeof obj[oldJid] === 'object' &&
      typeof obj[newJid] === 'object'
    ) {
      mergeObjects(obj[oldJid], obj[newJid])
    } else {
      obj[newJid] = obj[oldJid]
    }

    delete obj[oldJid]
  }

  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object')
      migrateKeys(obj[key], oldJid, newJid)
  }
}

let handler = async (m, { text }) => {
  if (!text) throw `*❌ 𝐔𝐬𝐨*

*.migrate vecchio nuovo*

*𝐄𝐬.:*

*.migrate 212645565194 67076394867*`

  const args = text.trim().split(/\s+/)

  if (args.length < 2)
    throw `*❌ 𝐒𝐩𝐞𝐜𝐢𝐟𝐢𝐜𝐚 𝐃𝐮𝐞 𝐔𝐭𝐞𝐧𝐭𝐢*`

  const oldJid = normalizeJid(args[0])
  const newJid = normalizeJid(args[1])

  if (!oldJid || !newJid)
    throw `*❌ 𝐔𝐭𝐞𝐧𝐭𝐞 𝐍𝐨𝐧 𝐕𝐚𝐥𝐢𝐝𝐨*`

  if (oldJid === newJid)
    throw `*❌ 𝐈 𝐃𝐮𝐞 𝐔𝐭𝐞𝐧𝐭𝐢 𝐂𝐨𝐢𝐧𝐜𝐢𝐝𝐨𝐧𝐨*`

  global.db.data.users ||= {}

  if (!global.db.data.users[oldJid])
    throw `*❌ 𝐃𝐚𝐭𝐢 𝐍𝐨𝐧 𝐓𝐫𝐨𝐯𝐚𝐭𝐢*

${oldJid}`

  global.db.data.users[newJid] ||= {}

  mergeObjects(
    global.db.data.users[oldJid],
    global.db.data.users[newJid]
  )

  delete global.db.data.users[oldJid]

  migrateKeys(
    global.db.data,
    oldJid,
    newJid
  )

  if (global.db.data.users[oldJid])
    throw `*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐃𝐮𝐫𝐚𝐧𝐭𝐞 𝐋𝐚 𝐌𝐢𝐠𝐫𝐚𝐳𝐢𝐨𝐧𝐞*`

  await m.reply(
`*✅ 𝐌𝐢𝐠𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚*

*𝐕𝐞𝐜𝐜𝐡𝐢𝐨 𝐈𝐃:*
${oldJid}

*𝐍𝐮𝐨𝐯𝐨 𝐈𝐃:*
${newJid}

*𝐓𝐮𝐭𝐭𝐢 𝐢 𝐝𝐚𝐭𝐢, 𝐥𝐞 𝐬𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜𝐡𝐞, 𝐢 𝐩𝐫𝐨𝐠𝐫𝐞𝐬𝐬𝐢 𝐞 𝐥𝐞 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐳𝐢𝐨𝐧𝐢 𝐚𝐬𝐬𝐨𝐜𝐢𝐚𝐭𝐞 𝐚𝐥 𝐯𝐞𝐜𝐜𝐡𝐢𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐚𝐦𝐞𝐧𝐭𝐞 𝐭𝐫𝐚𝐬𝐟𝐞𝐫𝐢𝐭𝐢 𝐚𝐥 𝐧𝐮𝐨𝐯𝐨 𝐚𝐜𝐜𝐨𝐮𝐧𝐭.*`
  )
}

handler.help = ['migrate','transfer']
handler.tags = ['owner']
handler.command = /^(migrate|transfer|trasferiscidati|migrautente|trasferisciutente)$/i
handler.owner = true

export default handler