let handler = async (m, { conn }) => {

    let who = m.sender

    if (!global.db.data.users[who]) {
        global.db.data.users[who] = {}
    }

    let user = global.db.data.users[who]

    if (!user.euro) user.euro = 0
    if (!user.bank) user.bank = 0

    let total = user.euro + user.bank

    let message = `
╔═ 💰 PORTAFOGLIO 💰 ═╗

👤 Utente: @${who.split('@')[0]}

💶 Soldi: ${formatNumber(user.euro)} €
🏦 Banca: ${formatNumber(user.bank)} €
─────────────────
🧾 Totale: ${formatNumber(total)} €

╚══════════════════╝
`.trim()

    const buttons = [
        {
            buttonId: '.soldi',
            buttonText: { displayText: '💰 Menu Soldi' },
            type: 1
        }
    ]

    await conn.sendMessage(
        m.chat,
        {
            text: message,
            footer: 'Wallet 💶',
            buttons: buttons,
            headerType: 1,
            mentions: [who]
        },
        { quoted: m }
    )
}

handler.command = /^wallet$/i
handler.help = ['soldi']
handler.tags = ['economia']

export default handler

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}