// rpg-wallet by Bonzino 

let handler = async (m, { conn }) => {
    let who = m.sender

    global.db.data.users[who] ??= {}

    let user = global.db.data.users[who]

    if (typeof user.euro !== 'number') user.euro = 0
    if (typeof user.bank !== 'number') user.bank = 0

    let contanti = user.euro
    let banca = user.bank
    let totale = contanti + banca

    let percentuale =
        totale > 0
            ? Math.round((banca / totale) * 100)
            : 0

    let text = `*💸 𝐏𝐎𝐑𝐓𝐀𝐅𝐎𝐆𝐋𝐈𝐎*

*💵 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢:* ${formatNumber(contanti)}€
*🏦 𝐁𝐚𝐧𝐜𝐚:* ${formatNumber(banca)}€
*📊 𝐃𝐞𝐩𝐨𝐬𝐢𝐭𝐚𝐭𝐨:* ${percentuale}%

*💰 𝐏𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨:* ${formatNumber(totale)}€`

    const buttons = [
        {
            buttonId: '.deposita',
            buttonText: {
                displayText: 'Deposita'
            },
            type: 1
        },
        {
            buttonId: '.preleva',
            buttonText: {
                displayText: 'Preleva'
            },
            type: 1
        },
        {
            buttonId: '.soldi',
            buttonText: {
                displayText: 'Menu Economia'
            },
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
handler.help = ['wallet']
handler.tags = ['economia']

export default handler

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT')
        .format(num || 0)
}