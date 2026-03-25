import fs from "fs"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let who = m.sender

    if (!global.db.data.users[who]) global.db.data.users[who] = {}
    let user = global.db.data.users[who]

    if (typeof user.euro === 'undefined') user.euro = 0

    let bet = parseInt(args[0])

    if (!bet || isNaN(bet) || bet <= 0) {
        let buttons = [
            { buttonId: `${usedPrefix + command} 10`, buttonText: { displayText: "💸 Punta 10" }, type: 1 },
            { buttonId: `${usedPrefix + command} 50`, buttonText: { displayText: "💸 Punta 50" }, type: 1 },
            { buttonId: `${usedPrefix + command} 100`, buttonText: { displayText: "💸 Punta 100" }, type: 1 },
            { buttonId: `${usedPrefix + command} 500`, buttonText: { displayText: "💸 Punta 500" }, type: 1 }
        ]

        let caption = `╭━━━━━━━🎰━━━━━━━╮
✦ 𝐒𝐂𝐎𝐌𝐌𝐄𝐒𝐒𝐀 ✦
╰━━━━━━━🎰━━━━━━━╯

👤 𝐔𝐭𝐞𝐧𝐭𝐞: @${who.split('@')[0]}
💸 𝐃𝐞𝐧𝐚𝐫𝐨: ${formatNumber(user.euro)}

📝 𝐒𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐮𝐧𝐭𝐚𝐭𝐚`

        return conn.sendMessage(m.chat, {
            image: fs.readFileSync("./media/snai.png"),
            caption,
            footer: "⚽ 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐒𝐜𝐨𝐦𝐦𝐞𝐬𝐬𝐞",
            buttons,
            headerType: 4,
            mentions: [who]
        }, { quoted: m })
    }

    if (user.euro < bet) {
        return m.reply(`╭━━━━━━━💸━━━━━━━╮
✦ 𝐃𝐄𝐍𝐀𝐑𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄 ✦
╰━━━━━━━💸━━━━━━━╯

💼 𝐇𝐚𝐢: ${formatNumber(user.euro)}
💳 𝐏𝐮𝐧𝐭𝐚𝐭𝐚: ${formatNumber(bet)}`)
    }

    const squadre = [
        "Inter", "Milan", "Juventus", "Napoli",
        "Roma", "Lazio", "Atalanta", "Fiorentina",
        "Torino", "Bologna"
    ]

    let casa = squadre[Math.floor(Math.random() * squadre.length)]
    let trasf = squadre.filter(s => s !== casa)[Math.floor(Math.random() * (squadre.length - 1))]

    let quota = (Math.random() * (4 - 1.5) + 1.5).toFixed(2)
    let vincita = Math.floor(bet * quota)

    user.euro -= bet

    let matchImage = `https://dummyimage.com/900x500/111/ffffff&text=${encodeURIComponent(casa + " VS " + trasf)}`

    await conn.sendMessage(m.chat, {
        image: { url: matchImage },
        caption: `╭━━━━━━━🎫━━━━━━━╮
✦ 𝐒𝐂𝐇𝐄𝐃𝐈𝐍𝐀 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀𝐓𝐀 ✦
╰━━━━━━━🎫━━━━━━━╯

⚔️ 𝐌𝐚𝐭𝐜𝐡: ${casa} vs ${trasf}

💸 𝐏𝐮𝐧𝐭𝐚𝐭𝐚: ${formatNumber(bet)}
📈 𝐐𝐮𝐨𝐭𝐚: x${quota}
🏆 𝐕𝐢𝐧𝐜𝐢𝐭𝐚 𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞: ${formatNumber(vincita)}

⏳ 𝐋𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐬𝐭𝐚 𝐢𝐧𝐢𝐳𝐢𝐚𝐧𝐝𝐨...`,
        mentions: [who]
    }, { quoted: m })

    const cronaca = [
        { t: 2000, txt: `🔔 𝐂𝐚𝐥𝐜𝐢𝐨 𝐝'𝐢𝐧𝐢𝐳𝐢𝐨!` },
        { t: 2500, txt: `⚡ 10' ${casa} 𝐚𝐭𝐭𝐚𝐜𝐜𝐚 𝐬𝐮𝐥𝐥𝐚 𝐟𝐚𝐬𝐜𝐢𝐚!` },
        { t: 2500, txt: `🔥 18' 𝐓𝐢𝐫𝐨 𝐝𝐞𝐥 ${trasf}... 𝐏𝐀𝐑𝐀𝐓𝐀! 🧤` },
        { t: 2500, txt: `😱 25' 𝐏𝐀𝐋𝐎 𝐝𝐞𝐥 ${casa}!` },
        { t: 2500, txt: `🟨 33' 𝐂𝐚𝐫𝐭𝐞𝐥𝐥𝐢𝐧𝐨 𝐠𝐢𝐚𝐥𝐥𝐨.` },
        { t: 2500, txt: `⚽ 38' 𝐆𝐎𝐀𝐋! 𝐋𝐨 𝐬𝐭𝐚𝐝𝐢𝐨 𝐞𝐬𝐩𝐥𝐨𝐝𝐞!` },
        { t: 2500, txt: `⏸ 𝐅𝐢𝐧𝐞 𝐩𝐫𝐢𝐦𝐨 𝐭𝐞𝐦𝐩𝐨.` },
        { t: 2500, txt: `▶️ 𝐈𝐧𝐢𝐳𝐢𝐚 𝐢𝐥 𝐬𝐞𝐜𝐨𝐧𝐝𝐨 𝐭𝐞𝐦𝐩𝐨.` },
        { t: 2500, txt: `🖥 𝐕𝐀𝐑 𝐜𝐡𝐞𝐜𝐤 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...` },
        { t: 2500, txt: `🔥 70' ${trasf} 𝐬𝐩𝐢𝐧𝐠𝐞 𝐟𝐨𝐫𝐭𝐞!` },
        { t: 2500, txt: `😱 𝐓𝐑𝐀𝐕𝐄𝐑𝐒𝐀! 𝐂𝐡𝐞 𝐨𝐜𝐜𝐚𝐬𝐢𝐨𝐧𝐞!` },
        { t: 2500, txt: `⏳ 90' 𝐑𝐞𝐜𝐮𝐩𝐞𝐫𝐨!` }
    ]

    for (let step of cronaca) {
        await new Promise(r => setTimeout(r, step.t))
        await conn.sendMessage(m.chat, { text: step.txt })
    }

    await new Promise(r => setTimeout(r, 3000))

    let win = Math.random() > 0.4
    let g1 = Math.floor(Math.random() * 4)
    let g2 = Math.floor(Math.random() * 4)

    if (win) {
        if (g1 <= g2) g1 = g2 + 1

        user.euro += vincita

        await conn.sendMessage(m.chat, {
            text: `╭━━━━━━━🏁━━━━━━━╮
✦ 𝐅𝐈𝐒𝐂𝐇𝐈𝐎 𝐅𝐈𝐍𝐀𝐋𝐄 ✦
╰━━━━━━━🏁━━━━━━━╯

${casa} ${g1} - ${g2} ${trasf}

✅ 𝐒𝐜𝐡𝐞𝐝𝐢𝐧𝐚 𝐯𝐢𝐧𝐭𝐚

💸 +${formatNumber(vincita)}
🏦 𝐒𝐚𝐥𝐝𝐨: ${formatNumber(user.euro)}`,
            mentions: [who]
        })
    } else {
        if (g2 <= g1) g2 = g1 + 1

        await conn.sendMessage(m.chat, {
            text: `╭━━━━━━━🏁━━━━━━━╮
✦ 𝐅𝐈𝐒𝐂𝐇𝐈𝐎 𝐅𝐈𝐍𝐀𝐋𝐄 ✦
╰━━━━━━━🏁━━━━━━━╯

${casa} ${g1} - ${g2} ${trasf}

❌ 𝐒𝐜𝐡𝐞𝐝𝐢𝐧𝐚 𝐩𝐞𝐫𝐬𝐚

📉 -${formatNumber(bet)}
💼 𝐒𝐚𝐥𝐝𝐨: ${formatNumber(user.euro)}`,
            mentions: [who]
        })
    }
}

handler.help = ['schedina']
handler.tags = ['game']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}