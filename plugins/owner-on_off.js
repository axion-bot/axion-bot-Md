// plugin by Bonzino
console.log('PLUGIN OFF/ON CARICATO')

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function editMessage(conn, chatId, key, text) {
  await conn.relayMessage(
    chatId,
    {
      protocolMessage: {
        key,
        type: 14,
        editedMessage: {
          extendedTextMessage: { text }
        }
      }
    },
    {}
  )
}

let handler = async (m, { conn, command }) => {
  global.db.data = global.db.data || {}
  global.db.data.settings = global.db.data.settings || {}

  const chatId = m.chat

  // 🔴 OFF
  if (command === 'off') {
    const sent = await conn.sendMessage(
      chatId,
      {
        text: `╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━🛑━━━━━━━╯

⏳ 𝐒𝐩𝐞𝐠𝐧𝐢𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.`
      },
      { quoted: m }
    )

    const key = sent?.key
    if (!key) return

    const frames = [
      `⏳ 𝐒𝐩𝐞𝐠𝐧𝐢𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.`,
      `⏳ 𝐒𝐩𝐞𝐠𝐧𝐢𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨..`,
      `⏳ 𝐒𝐩𝐞𝐠𝐧𝐢𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...`
    ]

    for (const f of frames) {
      await sleep(700)
      await editMessage(conn, chatId, key, `╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━🛑━━━━━━━╯

${f}`)
    }

    global.db.data.settings.botOff = true

    await editMessage(
      conn,
      chatId,
      key,
      `╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━🛑━━━━━━━╯

🛑 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐨𝐟𝐟𝐥𝐢𝐧𝐞`
    )

    return
  }

  // 🟢 ON
  if (command === 'on') {
    const sent = await conn.sendMessage(
      chatId,
      {
        text: `╭━━━━━━━⚡━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━⚡━━━━━━━╯

⏳ 𝐀𝐯𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.`
      },
      { quoted: m }
    )

    const key = sent?.key
    if (!key) return

    const frames = [
      `⏳ 𝐀𝐯𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.`,
      `⏳ 𝐀𝐯𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨..`,
      `⏳ 𝐀𝐯𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...`
    ]

    for (const f of frames) {
      await sleep(700)
      await editMessage(conn, chatId, key, `╭━━━━━━━⚡━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━⚡━━━━━━━╯

${f}`)
    }

    global.db.data.settings.botOff = false

    await editMessage(
      conn,
      chatId,
      key,
      `╭━━━━━━━⚡━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━⚡━━━━━━━╯

✅ 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐨𝐧𝐥𝐢𝐧𝐞`
    )

    return
  }
}

handler.help = ['off', 'on']
handler.tags = ['owner']
handler.command = /^(off|on)$/i
handler.owner = true

export default handler