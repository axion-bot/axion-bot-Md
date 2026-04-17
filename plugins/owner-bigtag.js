// Plugin bigtag by Bonzino

let handler = async (m, { conn, text, participants, isROwner, command }) => {
    if (!isROwner) return

    global.bigtagStop = global.bigtagStop || false

    if (/^stop$/i.test(command)) {
        global.bigtagStop = true
        return
    }

    let input = String(text || '').trim()

    if (!input && !m.quoted) {
        return m.reply('*.bigtag [numero] <messaggio>*\n*.bigtag [numero]*\n*.stop*')
    }

    let args = input ? input.split(' ') : []
    let count = parseInt(args[0])
    let customMessage = ''

    if (!isNaN(count)) {
        customMessage = args.slice(1).join(' ').trim()
    } else {
        count = 5
        customMessage = input
    }

    if (!customMessage && !m.quoted) {
        return m.reply('*.bigtag [numero] <messaggio>*\n*.bigtag [numero]*\n*.stop*')
    }

    if (count > 50) count = 50
    if (count < 1) count = 1

    let users = participants.map(u => u.id)

    const send = async (msg) => {
        if (m.quoted) {
            return await conn.sendMessage(m.chat, {
                text: msg || m.quoted.text || m.quoted.caption || '',
                mentions: users
            }, { quoted: m.quoted })
        }

        return await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: msg,
                contextInfo: { mentionedJid: users }
            }
        }, {})
    }

    const delay = (time) => new Promise((res) => setTimeout(res, time))

    try {
        global.bigtagStop = false

        for (let i = 0; i < count; i++) {
            if (global.bigtagStop) {
                global.bigtagStop = false
                return
            }

            await send(customMessage)
            await delay(1000)
        }
    } catch (e) {
        console.error(e)
    }
}

handler.command = /^(bigtag|stop)$/i
handler.group = true
handler.owner = true

export default handler