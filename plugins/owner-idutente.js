let handler = async (m, { conn, mentionedJid }) => {
let jid =
mentionedJid?.[0] ||
m.quoted?.sender ||
m.sender

await conn.sendButton(
m.chat,
`*🆔 ID UTENTE:*\n\n\`${jid}\``,
'> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
null,
null,
[['📋 Copia ID', jid]],
null,
m
)
}

handler.help = ['id']
handler.tags = ['owner']
handler.command = /^id$/i
handler.owner = true

export default handler