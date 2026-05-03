let handler = async (m, { conn, args, command }) => {
await m.reply('`_𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 ha abbandonato il gruppo correttamente_`') 
await  conn.groupLeave(m.chat)}
handler.command = /^(out|leavegc|leave|salirdelgrupo)$/i
handler.group = true
handler.rowner = true
export default handler