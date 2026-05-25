let handler = async (m, { conn }) => {
    let staff = `*⋆｡˚✦『 𝐒𝐓𝐀𝐅𝐅 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 』✦˚｡⋆*

*╭───────────────╮*
*│ 🤖 𝐁𝐨𝐭:* ${global.nomebot}
*│ 🆚 𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞:* ${global.versione}
*╰───────────────╯*

*╭─── 👑 𝐂𝐑𝐄𝐀𝐓𝐎𝐑𝐄 ───╮*
*│ ✦ 𝐍𝐨𝐦𝐞:* Deadly
*│ ✦ 𝐑𝐮𝐨𝐥𝐨:* Creatore / Developer
*│ ✦ 𝐂𝐨𝐧𝐭𝐚𝐭𝐭𝐨:* @212784392820
*╰────────────────────╯*

*╭─── 🔱 𝐂𝐎-𝐎𝐖𝐍𝐄𝐑 ───╮*
*│ ✦ 𝐁𝐨𝐧𝐳𝐢𝐧𝐨*
*│   ├ 𝐑𝐮𝐨𝐥𝐨:* Co-Owner / Lead Developer
*│   └ 𝐂𝐨𝐧𝐭𝐚𝐭𝐭𝐨:* @639350468907
*╰────────────────────╯*

*╭─── 🛡️ 𝐒𝐓𝐀𝐅𝐅 ───╮*
*│ ✦ 𝐋𝐮𝐱𝐢𝐟𝐞𝐫*
*│   ├ 𝐑𝐮𝐨𝐥𝐨:* Staffer
*│   └ 𝐂𝐨𝐧𝐭𝐚𝐭𝐭𝐨:* @393780560229
*╰────────────────────╯*

*╭─── 🛡️ 𝐒𝐓𝐀𝐅𝐅 ───╮*
*│ ✦ 𝐸𝑙ɪxⁱʳ*
*│   ├ 𝐑𝐮𝐨𝐥𝐨:* Staffer
*│   └ 𝐂𝐨𝐧𝐭𝐚𝐭𝐭𝐨:* @5491172448896
*╰────────────────────╯*

*╭─── 📌 𝐈𝐍𝐅𝐎 𝐔𝐓𝐈𝐋𝐈 ───╮*
*│ ✦ 𝐆𝐢𝐭𝐇𝐮𝐛:* github.com/axion-bot
*│ ✦ 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐨:* @393509594333
*╰────────────────────╯*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

    await conn.reply(
        m.chat,
        staff.trim(),
        m,
        {
            contextInfo: {
                mentionedJid: [
                    '212784392820@s.whatsapp.net',
                    '393780560229@s.whatsapp.net',
                    '639350468907@s.whatsapp.net',
                    '5491172448896@s.whatsapp.net',
                    '393509594333@s.whatsapp.net'
                ]
            }
        }
    )

    await conn.sendMessage(
        m.chat,
        {
            contacts: {
                contacts: [
                    {
                        vcard: `BEGIN:VCARD
VERSION:3.0
FN:Deadly
ORG:𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - Creatore / Dev
TEL;type=CELL;type=VOICE;waid=212784392820:+212784392820
END:VCARD`
                    },
                    {
                        vcard: `BEGIN:VCARD
VERSION:3.0
FN:Bonzino
ORG:𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - Co-Owner
TEL;type=CELL;type=VOICE;waid=639350468907:+639350468907
END:VCARD`
                    },
                    {
                        vcard: `BEGIN:VCARD
VERSION:3.0
FN:Luxifer
ORG:𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - Staffer
TEL;type=CELL;type=VOICE;waid=393780560229:+393780560229
END:VCARD`
                    },
                    {
                        vcard: `BEGIN:VCARD
VERSION:3.0
FN:Elixⁱʳ
ORG:𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - Staffer
TEL;type=CELL;type=VOICE;waid=5491172448896:+5491172448896
END:VCARD`
                    }
                ]
            }
        },
        { quoted: m }
    )

    m.react('👑')
}

handler.help = ['staff']
handler.tags = ['main']
handler.command = ['staff', 'collaboratori']

export default handler