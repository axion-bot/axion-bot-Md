// spam by Bonzino

let handler = async (m, { conn, text, isROwner, command }) => {
    if (!isROwner) return

    global.spamStop = global.spamStop || false

    if (/^(stopspam|spamstop)$/i.test(command)) {
        global.spamStop = true
        return m.react?.('✅')
    }

    let input = String(text || '').trim()

    if (!input && !m.quoted) {
        return m.reply(
`*.spam [numero] <messaggio>*
*.spam [numero]*
*.stopspam*
*.spamstop*`)
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
        return m.reply(
`*.spam [numero] <messaggio>*
*.spam [numero]*
*.stopspam*
*.spamstop*`)
    }

    if (count > 50) count = 50
    if (count < 1) count = 1

    const send = async (msg) => {
        if (m.quoted) {
            return await conn.sendMessage(
                m.chat,
                {
                    text: msg || m.quoted.text || m.quoted.caption || ''
                },
                { quoted: m.quoted }
            )
        }

        return await conn.sendMessage(
            m.chat,
            {
                text: msg
            },
            { quoted: m }
        )
    }

    const delay = (time) => new Promise(res => setTimeout(res, time))

    try {
        global.spamStop = false

        for (let i = 0; i < count; i++) {
            if (global.spamStop) {
                global.spamStop = false
                return
            }

            await send(customMessage)
            await delay(1000)
        }
    } catch (e) {
        console.error('Errore spam:', e)
    }
}

handler.help = ['spam', 'stopspam', 'spamstop']
handler.tags = ['owner']
handler.command = /^(spam|stopspam|spamstop)$/i
handler.owner = true
handler.group = true

export default handler