let handler = async (m, { conn }) => {
    let who = m.sender

    if (!global.db.data.users[who]) {
        global.db.data.users[who] = {}
    }

    let user = global.db.data.users[who]

    if (typeof user.euro !== 'number') user.euro = 0
    if (typeof user.bank !== 'number') user.bank = 0

    let denaro = user.euro
    let banca = user.bank
    let totale = denaro + banca

    let text = `╭━━━━━━━💸━━━━━━━╮
*✦ 𝐏𝐎𝐑𝐓𝐀𝐅𝐎𝐆𝐋𝐈𝐎 ✦*
╰━━━━━━━💸━━━━━━━╯

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${who.split('@')[0]}

*💸 𝐃𝐞𝐧𝐚𝐫𝐨:* ${formatNumber(denaro)}
*🏦 𝐁𝐚𝐧𝐜𝐚:* ${formatNumber(banca)}
*━━━━━━━━━━━━━━*
*🧾 𝐓𝐨𝐭𝐚𝐥𝐞:* ${formatNumber(totale)}`

    const buttons = [
        {
            buttonId: '.soldi',
            buttonText: { displayText: '💰 𝐌𝐞𝐧𝐮 𝐒𝐨𝐥𝐝𝐢' },
            type: 1
        }
    ]

    await conn.sendMessage(
        m.chat,
        {
            text,
            footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
            buttons,
            headerType: 1,
            mentions: [who]
        },
        { quoted: m }
    )
}

handler.command = /^(wallet|portafoglio)$/i
handler.help = ['wallet', 'portafoglio']
handler.tags = ['economia']

export default handler

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num || 0)
}