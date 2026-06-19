// reload by Bonzino

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

let handler = async (m, { conn }) => {
  const msg = await conn.sendMessage(
  m.chat,
  {
    text: `*⚙️ 𝐂𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 𝐬𝐢𝐬𝐭𝐞𝐦𝐚.*`
  },
  { quoted: m }
)

const states = [
  '*⚙️ 𝐂𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 𝐬𝐢𝐬𝐭𝐞𝐦𝐚.*',
  '*⚙️ 𝐂𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 𝐬𝐢𝐬𝐭𝐞𝐦𝐚..*',
  '*⚙️ 𝐂𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 𝐬𝐢𝐬𝐭𝐞𝐦𝐚...*'
]

for (let i = 0; i < 6; i++) {
  await editMessage(
    conn,
    m.chat,
    msg.key,
    states[i % states.length]
  )

  await new Promise(r => setTimeout(r, 500))
}

try {
  await global.reloadHandler(false)

    await editMessage(
      conn,
      m.chat,
      msg.key,
`*✅ 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐀𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    )
  } catch (e) {
    await editMessage(
      conn,
      m.chat,
      msg.key,
`*⚠️ 𝐑𝐢𝐜𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 𝐅𝐚𝐥𝐥𝐢𝐭𝐨*

*${e.message || 'Errore sconosciuto'}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    )
  }
}

handler.help = ['reload']
handler.tags = ['owner']
handler.command = /^(reload)$/i
handler.owner = true

export default handler