// Plugin setpicbot by Bonzino

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted || m
    const mime =
      q?.mimetype ||
      q?.msg?.mimetype ||
      q?.message?.imageMessage?.mimetype ||
      ''
    if (!/image/i.test(mime)) {
      return m.reply(
`*𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧'𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞 𝐜𝐨𝐧:*
*${usedPrefix + command}*`
      )
    }
    await m.react('🖼️')
    const buffer = await q.download()
    if (!buffer || !buffer.length) {
      throw new Error('Immagine non valida')
    }
    await conn.updateProfilePicture(
      conn.user.jid || conn.user.id,
      buffer
    )
    await m.react('✅')
    return m.reply(
`*𝐅𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐚 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨.'✅*`
    )

  } catch (e) {
    console.error(e)

    await m.react('❌').catch(() => {})

    return m.reply(
`*❌ ${e?.message || e}*`
    )
  }
}

handler.help = ['setpicbot']
handler.tags = ['owner']
handler.command = /^(setpicbot)$/i
handler.owner = true

export default handler