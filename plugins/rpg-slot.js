let cooldowns = {}

const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})

    const COOLDOWN = 2 * 60 * 1000

    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < COOLDOWN) {
        let timeLeft = cooldowns[m.sender] + COOLDOWN - Date.now()
        let min = Math.floor(timeLeft / 60000)
        let sec = Math.floor((timeLeft % 60000) / 1000)

        return conn.reply(
            m.chat,
            `╭━━━━━━━⏳━━━━━━━╮
✦ 𝐂𝐎𝐎𝐋𝐃𝐎𝐖𝐍 ✦
╰━━━━━━━⏳━━━━━━━╯

⏱️ 𝐀𝐬𝐩𝐞𝐭𝐭𝐚 ${min}𝐦 ${sec}𝐬`,
            m
        )
    }

    let r1 = fruits[Math.floor(Math.random() * fruits.length)]
    let r2 = fruits[Math.floor(Math.random() * fruits.length)]
    let r3 = fruits[Math.floor(Math.random() * fruits.length)]

    let win = (r1 === r2 || r2 === r3 || r1 === r3)

    user.euro = Number(user.euro) || 0
    user.exp = Number(user.exp) || 0
    user.level = Number(user.level) || 1

    let { min: minXP, xp: levelXP } = xpRange(user.level, global.multiplier || 1)

    let denaroText = ''
    let expText = ''
    let esitoText = ''

    if (win) {
        let denaroWin = Math.floor(Math.random() * 901) + 100
        let xpWin = Math.floor(Math.random() * 51) + 50

        user.euro += denaroWin
        user.exp += xpWin

        denaroText = `+${denaroWin}`
        expText = `+${xpWin}`
        esitoText = '🎉 𝐕𝐈𝐓𝐓𝐎𝐑𝐈𝐀!'
    } else {
        let denaroLose = Math.min(user.euro, Math.floor(Math.random() * 101) + 50)
        let xpLose = Math.floor(Math.random() * 31) + 20

        user.euro -= denaroLose
        user.exp = Math.max(0, user.exp - xpLose)

        denaroText = `-${denaroLose}`
        expText = `-${xpLose}`
        esitoText = '🤡 𝐒𝐂𝐎𝐍𝐅𝐈𝐓𝐓𝐀!'
    }

    let { min: newMinXP, xp: newLevelXP } = xpRange(user.level, global.multiplier || 1)
    let currentLevelXP = Math.max(0, user.exp - newMinXP)

    let text = `╭━━━━━━━🎰━━━━━━━╮
✦ 𝐒𝐋𝐎𝐓 𝐌𝐀𝐂𝐇𝐈𝐍𝐄 ✦
╰━━━━━━━🎰━━━━━━━╯

🎲 𝐑𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨:
┃ ${r1} │ ${r2} │ ${r3} ┃

${esitoText}

💸 𝐃𝐞𝐧𝐚𝐫𝐨: ${denaroText}
✨ 𝐄𝐗𝐏: ${expText}

━━━━━━━━━━━━━━
💼 𝐒𝐚𝐥𝐝𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞

💸 𝐃𝐞𝐧𝐚𝐫𝐨: ${formatNumber(user.euro)}
⭐ 𝐄𝐗𝐏: ${formatNumber(user.exp)}
📊 𝐏𝐫𝐨𝐠𝐫𝐞𝐬𝐬𝐨: ${formatNumber(currentLevelXP)}/${formatNumber(newLevelXP)}`

    cooldowns[m.sender] = Date.now()

    await new Promise(resolve => setTimeout(resolve, 1500))
    await conn.reply(m.chat, text, m)
}

handler.help = ['slot']
handler.tags = ['game', 'economia']
handler.command = ['slot']

export default handler

function xpRange(level, multiplier = 1) {
    if (level < 0) level = 0
    let min = level === 0 ? 0 : Math.pow(level, 2) * 20
    let max = Math.pow(level + 1, 2) * 20
    let xp = Math.floor((max - min) * multiplier)
    return { min, xp, max }
}

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}