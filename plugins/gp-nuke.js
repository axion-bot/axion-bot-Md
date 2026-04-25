import fs from 'fs'

let handler = async (m, { conn, command }) => {
    const chat = global.db.data.chats[m.chat] || {}

    if (command === 'nuke') {
        const groupMetadata = await conn.groupMetadata(m.chat)

        chat.oldName = groupMetadata.subject
        chat.oldDesc = groupMetadata.desc || "Nessuna descrizione"
        global.db.data.chats[m.chat] = chat

        let newName = `${chat.oldName} | 𝐒𝐕𝐓 𝐁𝐘 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`
        await conn.groupUpdateSubject(m.chat, newName)

        await conn.groupUpdateDescription(
            m.chat,
            "𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 𝐃𝐎𝐌𝐈𝐍𝐀 𝐒𝐔𝐈 𝐕𝐎𝐒𝐓𝐑𝐈 𝐆𝐑𝐔𝐏𝐏𝐈 🛡️"
        )

        await conn.groupSettingUpdate(m.chat, 'announcement')

        let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
        const participants = groupMetadata.participants.map(u => u.id)

        await conn.sendMessage(m.chat, {
            video: fs.readFileSync('./media/fakenuke.mp4'),
            caption: "☣️ 𝐍𝐔𝐊𝐄 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎..."
        }, { quoted: m })

        await new Promise(r => setTimeout(r, 2000))

        let nukeMsg = `
┏━━━━━━━━━━━━━━━━━━┓
┃  ☣️  *𝐆𝐑𝐔𝐏𝐏𝐎 𝐒𝐕𝐔𝐎𝐓𝐀𝐓𝐎* ☣️
┗━━━━━━━━━━━━━━━━━━┛

📢 *𝐃𝐀𝐋 𝐁𝐎𝐓 𝐌𝐈𝐆𝐋𝐈𝐎𝐑𝐄*

🔗 *𝐄𝐍𝐓𝐑𝐀𝐓𝐄 𝐓𝐔𝐓𝐓𝐈 𝐐𝐔𝐈:*
${link}

⚡ _Powered by Axion Bot_
`.trim()

        await conn.sendMessage(m.chat, {
            text: nukeMsg,
            mentions: participants
        }, { quoted: m })
    }

    if (command === 'resuscita') {
        if (!chat.oldName) {
            return m.reply("⚠️ *Non ho dati salvati per il ripristino!*")
        }

        await conn.groupUpdateSubject(m.chat, chat.oldName)

        await conn.groupUpdateDescription(m.chat, chat.oldDesc)

        await conn.groupSettingUpdate(m.chat, 'not_announcement')

        let resMsg = `
*𝐑𝐈𝐏𝐑𝐈𝐒𝐓𝐈𝐍𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎*
━━━━━━━━━━━━━━━━━━━━
✅ _Nome e descrizione tornati alla normalità._
🔓 _Chat aperta a tutti i partecipanti._
`.trim()

        m.reply(resMsg)
    }
}

handler.help = ['nuke', 'resuscita']
handler.tags = ['group', 'owner']
handler.command = ['nuke', 'resuscita']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler