// Plugin ruba by Bonzino

global.robSession = global.robSession || {}

const robCooldown = 15 * 60 * 1000

const robEvents = [
  {
    txt: '*👀 𝐕𝐞𝐝𝐢 𝐢𝐥 𝐭𝐚𝐫𝐠𝐞𝐭 𝐝𝐢𝐬𝐭𝐫𝐚𝐭𝐭𝐨 𝐯𝐢𝐜𝐢𝐧𝐨 𝐚𝐥𝐥𝐚 𝐯𝐞𝐭𝐫𝐢𝐧𝐚.*',
    opzioni: ['1️⃣ 𝐓𝐢 𝐚𝐯𝐯𝐢𝐜𝐢𝐧𝐢 𝐩𝐢𝐚𝐧𝐨', '2️⃣ 𝐏𝐫𝐨𝐯𝐢 𝐮𝐧 𝐦𝐨𝐯𝐢𝐦𝐞𝐧𝐭𝐨 𝐫𝐚𝐩𝐢𝐝𝐨'],
    delta: [18, -8]
  },
  {
    txt: '*🕶️ 𝐔𝐧 𝐩𝐚𝐬𝐬𝐚𝐧𝐭𝐞 𝐭𝐢 𝐬𝐭𝐚 𝐨𝐬𝐬𝐞𝐫𝐯𝐚𝐧𝐝𝐨.*',
    opzioni: ['1️⃣ 𝐅𝐢𝐧𝐠𝐢 𝐝𝐢 𝐜𝐞𝐫𝐜𝐚𝐫𝐞 𝐪𝐮𝐚𝐥𝐜𝐨𝐬𝐚', '2️⃣ 𝐋𝐨 𝐢𝐠𝐧𝐨𝐫𝐢'],
    delta: [12, -12]
  },
  {
    txt: '*📱 𝐈𝐥 𝐭𝐚𝐫𝐠𝐞𝐭 𝐬𝐭𝐚 𝐜𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐚𝐧𝐝𝐨 𝐢𝐥 𝐭𝐞𝐥𝐞𝐟𝐨𝐧𝐨.*',
    opzioni: ['1️⃣ 𝐀𝐬𝐩𝐞𝐭𝐭𝐢 𝐢𝐥 𝐦𝐨𝐦𝐞𝐧𝐭𝐨 𝐠𝐢𝐮𝐬𝐭𝐨', '2️⃣ 𝐀𝐠𝐢𝐬𝐜𝐢 𝐬𝐮𝐛𝐢𝐭𝐨'],
    delta: [15, -10]
  },
  {
    txt: '*🚶 𝐂'è 𝐭𝐫𝐨𝐩𝐩𝐚 𝐠𝐞𝐧𝐭𝐞 𝐚𝐭𝐭𝐨𝐫𝐧𝐨.*',
    opzioni: ['1️⃣ 𝐂𝐚𝐦𝐛𝐢 𝐩𝐨𝐬𝐢𝐳𝐢𝐨𝐧𝐞', '2️⃣ 𝐏𝐫𝐨𝐯𝐢 𝐥𝐨 𝐬𝐭𝐞𝐬𝐬𝐨'],
    delta: [10, -14]
  },
  {
    txt: '*🎒 𝐍𝐨𝐭𝐢 𝐜𝐡𝐞 𝐥𝐚 𝐛𝐨𝐫𝐬𝐚 𝐞̀ 𝐚𝐩𝐞𝐫𝐭𝐚 𝐚 𝐦𝐞𝐭𝐚̀.*',
    opzioni: ['1️⃣ 𝐏𝐫𝐨𝐟𝐢𝐭𝐭𝐢 𝐝𝐞𝐥𝐥’𝐨𝐜𝐜𝐚𝐬𝐢𝐨𝐧𝐞', '2️⃣ 𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐢 𝐩𝐫𝐢𝐦𝐚 𝐥’𝐚𝐦𝐛𝐢𝐞𝐧𝐭𝐞'],
    delta: [20, 8]
  },
  {
    txt: '*🐕 𝐔𝐧 𝐜𝐚𝐧𝐞 𝐢𝐧𝐢𝐳𝐢𝐚 𝐚 𝐟𝐢𝐬𝐬𝐚𝐫𝐭𝐢.*',
    opzioni: ['1️⃣ 𝐓𝐢 𝐚𝐥𝐥𝐨𝐧𝐭𝐚𝐧𝐢 𝐮𝐧 𝐚𝐭𝐭𝐢𝐦𝐨', '2️⃣ 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐢 𝐬𝐞𝐧𝐳𝐚 𝐟𝐞𝐫𝐦𝐚𝐫𝐭𝐢'],
    delta: [8, -16]
  },
  {
    txt: '*🧤 𝐇𝐚𝐢 𝐚𝐧𝐜𝐨𝐫𝐚 𝐢𝐥 𝐭𝐞𝐦𝐩𝐨 𝐝𝐢 𝐜𝐚𝐦𝐛𝐢𝐚𝐫𝐞 𝐬𝐭𝐫𝐚𝐭𝐞𝐠𝐢𝐚.*',
    opzioni: ['1️⃣ 𝐏𝐮𝐧𝐭𝐢 𝐚 𝐩𝐨𝐜𝐡𝐢 𝐬𝐨𝐥𝐝𝐢 𝐦𝐚 𝐬𝐢𝐜𝐮𝐫𝐢', '2️⃣ 𝐏𝐮𝐧𝐭𝐢 𝐚 𝐮𝐧 𝐜𝐨𝐥𝐩𝐨 𝐠𝐫𝐨𝐬𝐬𝐨'],
    delta: [10, -6]
  },
  {
    txt: '*💬 𝐈𝐥 𝐭𝐚𝐫𝐠𝐞𝐭 𝐬𝐢 𝐟𝐞𝐫𝐦𝐚 𝐚 𝐩𝐚𝐫𝐥𝐚𝐫𝐞 𝐜𝐨𝐧 𝐪𝐮𝐚𝐥𝐜𝐮𝐧𝐨.*',
    opzioni: ['1️⃣ 𝐍𝐞 𝐚𝐩𝐩𝐫𝐨𝐟𝐢𝐭𝐭𝐢', '2️⃣ 𝐀𝐬𝐩𝐞𝐭𝐭𝐢 𝐜𝐡𝐞 𝐫𝐢𝐩𝐚𝐫𝐭𝐚'],
    delta: [16, 4]
  }
]

const box = (emoji, title, body) => `╭━━━━━━━${emoji}━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━${emoji}━━━━━━━╯

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

function getButtonId(m) {
  const msg = m.message || {}
  return (
    msg.buttonsResponseMessage?.selectedButtonId ||
    msg.templateButtonReplyMessage?.selectedId ||
    m.text ||
    ''
  ).trim()
}

function pickTarget(m) {
  return m.mentionedJid?.[0] || m.quoted?.sender || null
}

async function sendRobEvent(conn, chat, quoted, event, step, targetName, score) {
  const text = box(
    '🕵️',
    `𝐑𝐔𝐁𝐀 • 𝐅𝐀𝐒𝐄 ${step}`,
    `*🎯 𝐓𝐚𝐫𝐠𝐞𝐭:* ${targetName}
*📊 𝐅𝐮𝐫𝐭𝐢𝐯𝐢𝐭𝐚̀ 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:* ${score}

${event.txt}

*${event.opzioni[0]}*
*${event.opzioni[1]}*`
  )

  return conn.sendMessage(chat, {
    text,
    footer: '',
    buttons: [
      {
        buttonId: '.ruba1',
        buttonText: { displayText: '1️⃣ 𝐒𝐜𝐞𝐥𝐭𝐚 𝟏' },
        type: 1
      },
      {
        buttonId: '.ruba2',
        buttonText: { displayText: '2️⃣ 𝐒𝐜𝐞𝐥𝐭𝐚 𝟐' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted })
}

let handler = async (m, { conn, usedPrefix }) => {
  const user = m.sender
  const target = pickTarget(m)

  if (!global.db.data.users[user]) {
    global.db.data.users[user] = { euro: 0, xp: 0, level: 1, lastRob: 0, isJailed: false, jailTime: 0 }
  }

  const u = global.db.data.users[user]

  if (typeof u.euro !== 'number') u.euro = 0
  if (typeof u.xp !== 'number') u.xp = 0
  if (typeof u.level !== 'number') u.level = 1
  if (typeof u.lastRob !== 'number') u.lastRob = 0
  if (typeof u.isJailed !== 'boolean') u.isJailed = false
  if (typeof u.jailTime !== 'number') u.jailTime = 0

  if (u.isJailed) {
    const left = u.jailTime - Date.now()
    if (left > 0) {
      const minutes = Math.ceil(left / 60000)
      return conn.reply(
        m.chat,
        box(
          '🔒',
          '𝐑𝐔𝐁𝐀',
          `*𝐒𝐞𝐢 𝐚𝐧𝐜𝐨𝐫𝐚 𝐢𝐧 𝐜𝐞𝐥𝐥𝐚 𝐩𝐞𝐫:* ${minutes} 𝐦𝐢𝐧𝐮𝐭𝐢

*𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐮𝐛𝐚𝐫𝐞 𝐟𝐢𝐧𝐜𝐡𝐞́ 𝐧𝐨𝐧 𝐞𝐬𝐜𝐢.*`
        ),
        m
      )
    }
    u.isJailed = false
    u.jailTime = 0
  }

  const time = robCooldown - (Date.now() - u.lastRob)
  if (time > 0) {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    return conn.reply(
      m.chat,
      box(
        '⏳',
        '𝐑𝐔𝐁𝐀',
        `*𝐃𝐞𝐯𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐚𝐫𝐞 𝐚𝐧𝐜𝐨𝐫𝐚:* ${minutes}𝐦 ${seconds}𝐬`
      ),
      m
    )
  }

  if (!target) {
    return conn.reply(
      m.chat,
      box(
        '🕵️',
        '𝐑𝐔𝐁𝐀',
        `*𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐞𝐫 𝐭𝐞𝐧𝐭𝐚𝐫𝐞 𝐢𝐥 𝐟𝐮𝐫𝐭𝐨.*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:* *${usedPrefix}ruba @utente*`
      ),
      m
    )
  }

  if (target === user) {
    return conn.reply(
      m.chat,
      box(
        '🙃',
        '𝐑𝐔𝐁𝐀',
        `*𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐮𝐛𝐚𝐫𝐞 𝐚 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨.*`
      ),
      m
    )
  }

  if (target === conn.user.jid) {
    return conn.reply(
      m.chat,
      box(
        '🤖',
        '𝐑𝐔𝐁𝐀',
        `*𝐁𝐞𝐥 𝐭𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐨, 𝐦𝐚 𝐧𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐮𝐛𝐚𝐫𝐞 𝐚𝐥 𝐛𝐨𝐭.*`
      ),
      m
    )
  }

  if (!global.db.data.users[target]) {
    global.db.data.users[target] = { euro: 0, xp: 0, level: 1 }
  }

  const victim = global.db.data.users[target]
  if (typeof victim.euro !== 'number') victim.euro = 0
  if (typeof victim.xp !== 'number') victim.xp = 0
  if (typeof victim.level !== 'number') victim.level = 1

  if (victim.euro < 50) {
    return conn.reply(
      m.chat,
      box(
        '🪙',
        '𝐑𝐔𝐁𝐀',
        `*𝐈𝐥 𝐭𝐚𝐫𝐠𝐞𝐭 𝐡𝐚 𝐭𝐫𝐨𝐩𝐩𝐨 𝐩𝐨𝐜𝐨 𝐝𝐞𝐧𝐚𝐫𝐨 𝐩𝐞𝐫𝐜𝐡𝐞́ 𝐯𝐚𝐥𝐠𝐚 𝐢𝐥 𝐫𝐢𝐬𝐜𝐡𝐢𝐨.*`
      ),
      m
    )
  }

  const targetName = await conn.getName(target)
  const chosenEvents = shuffle([...robEvents]).slice(0, 2)

  global.robSession[user] = {
    step: 0,
    target,
    targetName,
    events: chosenEvents,
    score: 0,
    startMoney: victim.euro
  }

  const intro = box(
    '🕵️',
    '𝐑𝐔𝐁𝐀',
    `*🎯 𝐓𝐚𝐫𝐠𝐞𝐭:* ${targetName}
*💼 𝐃𝐞𝐧𝐚𝐫𝐨 𝐬𝐭𝐢𝐦𝐚𝐭𝐨:* ${formatNumber(victim.euro)}

*𝐏𝐫𝐞𝐩𝐚𝐫𝐚 𝐢𝐥 𝐜𝐨𝐥𝐩𝐨 𝐞 𝐬𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐧 𝐚𝐭𝐭𝐞𝐧𝐳𝐢𝐨𝐧𝐞...*`
  )

  await conn.reply(m.chat, intro, m)
  return sendRobEvent(conn, m.chat, m, chosenEvents[0], 1, targetName, 0)
}

handler.before = async (m, { conn }) => {
  const user = m.sender
  if (!global.robSession[user]) return

  const raw = getButtonId(m).toLowerCase()
  let input = null

  if (raw === '.ruba1' || raw === '1') input = 1
  if (raw === '.ruba2' || raw === '2') input = 2
  if (!input) return

  const session = global.robSession[user]
  const u = global.db.data.users[user]
  const victim = global.db.data.users[session.target]

  if (!victim) {
    delete global.robSession[user]
    return conn.reply(
      m.chat,
      box(
        '❌',
        '𝐑𝐔𝐁𝐀',
        `*𝐈𝐥 𝐭𝐚𝐫𝐠𝐞𝐭 𝐧𝐨𝐧 è 𝐩𝐢𝐮̀ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞.*`
      ),
      m
    )
  }

  const ev = session.events[session.step]
  const choice = input - 1
  const delta = ev.delta[choice] || 0

  session.score += delta

  await conn.reply(
    m.chat,
    box(
      '📌',
      '𝐒𝐂𝐄𝐋𝐓𝐀',
      `*✅ 𝐇𝐚𝐢 𝐬𝐜𝐞𝐥𝐭𝐨:* ${input}️⃣
*📊 𝐕𝐚𝐫𝐢𝐚𝐳𝐢𝐨𝐧𝐞 𝐟𝐮𝐫𝐭𝐢𝐯𝐢𝐭𝐚̀:* ${delta >= 0 ? '+' : ''}${delta}`
    ),
    m
  )

  session.step++

  if (session.step < session.events.length) {
    const next = session.events[session.step]
    return sendRobEvent(conn, m.chat, m, next, session.step + 1, session.targetName, session.score)
  }

  const baseChance = 0.42
  const finalChance = Math.max(0.12, Math.min(0.85, baseChance + session.score / 100))
  const roll = Math.random()

  u.lastRob = Date.now()

  if (roll <= finalChance) {
    const mode = Math.random()

    let percent = 0.14
    if (mode < 0.20) percent = 0.30
    else if (mode < 0.55) percent = 0.20
    else percent = 0.12

    let stolen = Math.floor(victim.euro * percent)
    stolen = Math.max(30, stolen)
    stolen = Math.min(stolen, victim.euro)
    stolen = Math.min(stolen, 3500)

    if (stolen > 0) {
      victim.euro -= stolen
      u.euro += stolen
    }

    const xpGain = randomNum(4, 12)
    u.xp = (u.xp || 0) + xpGain

    let lvlUp = false
    const needed = (u.level || 1) * 100
    if (u.xp >= needed) {
      u.level = (u.level || 1) + 1
      u.xp = 0
      lvlUp = true
    }

    delete global.robSession[user]

    let flavor = '*𝐂𝐨𝐥𝐩𝐨 𝐩𝐮𝐥𝐢𝐭𝐨, 𝐧𝐨𝐧 𝐭𝐢 𝐡𝐚 𝐧𝐨𝐭𝐚𝐭𝐨 𝐧𝐞𝐬𝐬𝐮𝐧𝐨.*'
    if (percent >= 0.30) flavor = '*𝐇𝐚𝐢 𝐟𝐚𝐭𝐭𝐨 𝐮𝐧 𝐜𝐨𝐥𝐩𝐨 𝐠𝐫𝐨𝐬𝐬𝐨.*'
    else if (percent >= 0.20) flavor = '*𝐇𝐚𝐢 𝐩𝐫𝐞𝐬𝐨 𝐩𝐢𝐮̀ 𝐝𝐞𝐥 𝐩𝐫𝐞𝐯𝐢𝐬𝐭𝐨.*'

    let msg = `*🎯 𝐓𝐚𝐫𝐠𝐞𝐭:* ${session.targetName}
*💸 𝐇𝐚𝐢 𝐫𝐮𝐛𝐚𝐭𝐨:* ${formatNumber(stolen)}
*💼 𝐈𝐥 𝐭𝐮𝐨 𝐝𝐞𝐧𝐚𝐫𝐨:* ${formatNumber(u.euro)}
*⭐ 𝐄𝐗𝐏:* +${formatNumber(xpGain)}

${flavor}`

    if (lvlUp) {
      msg += `

*🎉 𝐋𝐄𝐕𝐄𝐋 𝐔𝐏!*`
    }

    return conn.sendMessage(m.chat, {
      text: box('🕶️', '𝐅𝐔𝐑𝐓𝐎 𝐑𝐈𝐔𝐒𝐂𝐈𝐓𝐎', msg),
      footer: '',
      buttons: [
        {
          buttonId: '.crimine',
          buttonText: { displayText: '🕶️ 𝐂𝐫𝐢𝐦𝐢𝐧𝐞' },
          type: 1
        },
        {
          buttonId: '.portafoglio',
          buttonText: { displayText: '💰 𝐏𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨' },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: m })
  }

  delete global.robSession[user]

  const failRoll = Math.random()

  if (failRoll < 0.45) {
    const multa = Math.min(u.euro, randomNum(80, 250))
    u.euro -= multa

    return conn.reply(
      m.chat,
      box(
        '🚨',
        '𝐅𝐔𝐑𝐓𝐎 𝐅𝐀𝐋𝐋𝐈𝐓𝐎',
        `*𝐈𝐥 𝐭𝐚𝐫𝐠𝐞𝐭 𝐬𝐞 𝐧𝐞 𝐚𝐜𝐜𝐨𝐫𝐠𝐞 𝐞 𝐭𝐢 𝐦𝐞𝐭𝐭𝐢 𝐢𝐧 𝐟𝐮𝐠𝐚.*

*💸 𝐏𝐞𝐫𝐝𝐢:* ${formatNumber(multa)}
*💼 𝐃𝐞𝐧𝐚𝐫𝐨 𝐫𝐢𝐦𝐚𝐬𝐭𝐨:* ${formatNumber(u.euro)}`
      ),
      m
    )
  }

  const jailMinutes = 8
  u.isJailed = true
  u.jailTime = Date.now() + jailMinutes * 60 * 1000

  return conn.sendMessage(m.chat, {
    text: box(
      '🚔',
      '𝐓𝐈 𝐇𝐀𝐍𝐍𝐎 𝐏𝐑𝐄𝐒𝐎',
      `*𝐈𝐥 𝐜𝐨𝐥𝐩𝐨 è 𝐚𝐧𝐝𝐚𝐭𝐨 𝐦𝐚𝐥𝐞 𝐞 𝐬𝐞𝐢 𝐟𝐢𝐧𝐢𝐭𝐨 𝐢𝐧 𝐜𝐞𝐥𝐥𝐚.*

*⏳ 𝐏𝐞𝐧𝐚:* ${jailMinutes} 𝐦𝐢𝐧𝐮𝐭𝐢
*🏃‍♂️ 𝐏𝐮𝐨𝐢 𝐩𝐫𝐨𝐯𝐚𝐫𝐞 𝐚 𝐟𝐮𝐠𝐠𝐢𝐫𝐞 𝐨 𝐮𝐬𝐚𝐫𝐞 𝐥𝐚 𝐜𝐚𝐮𝐳𝐢𝐨𝐧𝐞.*`
    ),
    footer: '',
    buttons: [
      {
        buttonId: '.evadi',
        buttonText: { displayText: '🏃‍♂️ 𝐄𝐯𝐚𝐝𝐢' },
        type: 1
      },
      {
        buttonId: '.cauzione',
        buttonText: { displayText: '⚖️ 𝐂𝐚𝐮𝐳𝐢𝐨𝐧𝐞' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['ruba @utente', 'borseggia @utente']
handler.tags = ['economy']
handler.command = /^(ruba|borseggia)$/i

export default handler

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  return arr.sort(() => 0.5 - Math.random())
}

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}