//plugin "rpg-deposita" by Bonzino

global.db.data.depositoSessioni ??= {}

const footer='𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

const box=(emoji,title,body,showFooter=true)=>`${emoji} *${title}*

${body}${showFooter?`

> *${footer}*`:''}`

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num || 0)
}

function getQuotedId(m) {
  return (
    m.quoted?.id ||
    m.quoted?.key?.id ||
    m.message?.extendedTextMessage?.contextInfo?.stanzaId ||
    null
  )
}

let handler = async (m, { conn, args, command }) => {
  global.db.data.users[m.sender] ??= {}

  const cmd = String(command || '').toLowerCase()

  if (cmd === 'confermadeposito') {
    return confermaDeposito(m)
  }

  if (cmd === 'annulladeposito') {
    return annullaDeposito(m)
  }

  const user = global.db.data.users[m.sender]

  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bank !== 'number') user.bank = 0

  if (args[0]) {
    return preparaDeposito(m, conn, args.join(' '))
  }

const sent = await conn.sendMessage(
  m.chat,
  {
    text: box(
      '🏦',
      '𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐎',
      `*💸 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐥'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐝𝐚 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐚𝐫𝐞.*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢:* all • metà • 50% • 100`
    )
  },
  { quoted: m }
)

  global.db.data.depositoSessioni[`${m.chat}|${sent.key.id}`] = {
    owner: m.sender,
    createdAt: Date.now()
  }
}

handler.before = async function (m, { conn }) {
  if (!m.text) return false

  global.db.data.depositoSessioni ??= {}

  const quotedId = getQuotedId(m)
  if (!quotedId) return false

  const key = `${m.chat}|${quotedId}`
  const sessione = global.db.data.depositoSessioni[key]

  if (!sessione) return false

  if (sessione.owner !== m.sender) {
    await m.reply(
      box(
        '🚫',
        '𝐒𝐄𝐒𝐒𝐈𝐎𝐍𝐄 𝐍𝐎𝐍 𝐓𝐔𝐀',
        `*❌ 𝐐𝐮𝐞𝐬𝐭𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 𝐚𝐩𝐩𝐚𝐫𝐭𝐢𝐞𝐧𝐞 𝐚 𝐭𝐞.*`
      )
    )

    return true
  }

  if (Date.now() - sessione.createdAt > 60000) {
    delete global.db.data.depositoSessioni[key]

    await m.reply(
      box(
        '⏳',
        '𝐒𝐄𝐒𝐒𝐈𝐎𝐍𝐄 𝐒𝐂𝐀𝐃𝐔𝐓𝐀',
        `*⌛ 𝐋𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐝𝐢 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐨 è 𝐬𝐜𝐚𝐝𝐮𝐭𝐚.*

*📌 𝐑𝐢𝐚𝐩𝐫𝐢 𝐢𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨 𝐞 𝐫𝐢𝐩𝐫𝐨𝐯𝐚.*`
      )
    )

    return true
  }

  delete global.db.data.depositoSessioni[key]

  await preparaDeposito(
    m,
    conn,
    m.text.trim()
  )

  return true
}

handler.command = /^(deposita|deposit|dep|confermadeposito|annulladeposito)$/i
handler.help = ['deposita']
handler.tags = ['economia']

export default handler

async function preparaDeposito(m, conn, input) {
  global.db.data.users[m.sender] ??= {}

  const user = global.db.data.users[m.sender]

  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bank !== 'number') user.bank = 0

  const amount = parseAmount(input, user.euro)

  if (!amount.valid) {
    return m.reply(
      box(
        '❌',
        '𝐐𝐔𝐀𝐍𝐓𝐈𝐓À 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐀',
        amount.message
      )
    )
  }

  if (amount.value > user.euro) {
    return m.reply(
      box(
        '❌',
        '𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄',
        `*💼 𝐇𝐚𝐢 𝐬𝐨𝐥𝐨 ${formatNumber(user.euro)}€ 𝐜𝐨𝐧𝐭𝐚𝐧𝐭𝐢.*`
      )
    )
  }

  user._depositoPending = {
    amount: amount.value,
    createdAt: Date.now()
  }

  const buttons = [
    {
      buttonId: '.confermadeposito',
      buttonText: {
        displayText: '✅ Conferma'
      },
      type: 1
    },
    {
      buttonId: '.annulladeposito',
      buttonText: {
        displayText: '❌ Annulla'
      },
      type: 1
    }
  ]

  await conn.sendMessage(
    m.chat,
    {
      text: box(
        '🏦',
        '𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐎',
        `*💸 𝐐𝐮𝐚𝐧𝐭𝐢𝐭à:* ${formatNumber(amount.value)}€

*💼 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢:* ${formatNumber(user.euro - amount.value)}€
*🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐛𝐚𝐧𝐜𝐚:* ${formatNumber(user.bank + amount.value)}€
*💰 𝐏𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨:* ${formatNumber(user.euro + user.bank)}€

*📌 𝐂𝐨𝐧𝐟𝐞𝐫𝐦𝐢 𝐥’𝐨𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞?*`,
        false
      ),
      footer,
      buttons,
      headerType: 1
    },
    { quoted: m }
  )
}

async function confermaDeposito(m) {
  const user = global.db.data.users[m.sender]

  if (!user?._depositoPending) {
    return m.reply(
      box(
        '❌',
        '𝐍𝐄𝐒𝐒𝐔𝐍 𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐎',
        `*📌 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐢 𝐢𝐧 𝐚𝐭𝐭𝐞𝐬𝐚.*`
      )
    )
  }

  if (Date.now() - user._depositoPending.createdAt > 60000) {
    delete user._depositoPending

    return m.reply(
      box(
        '⏳',
        '𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎',
        `*⌛ 𝐋𝐚 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚 è 𝐬𝐜𝐚𝐝𝐮𝐭𝐚.*`
      )
    )
  }

  const amount = user._depositoPending.amount

  if (amount > user.euro) {
    delete user._depositoPending

    return m.reply(
      box(
        '❌',
        '𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄',
        `*💼 𝐈 𝐜𝐨𝐧𝐭𝐚𝐧𝐭𝐢 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐩𝐢ù 𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭𝐢.*`
      )
    )
  }

  user.euro -= amount
  user.bank += amount

  delete user._depositoPending

  return m.reply(
    box(
      '✅',
      '𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐎 𝐄𝐅𝐅𝐄𝐓𝐓𝐔𝐀𝐓𝐎',
      `*💸 𝐃𝐞𝐩𝐨𝐬𝐢𝐭𝐚𝐭𝐢:* ${formatNumber(amount)}€

*💼 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢:* ${formatNumber(user.euro)}€
*🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐛𝐚𝐧𝐜𝐚:* ${formatNumber(user.bank)}€
*💰 𝐏𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨:* ${formatNumber(user.euro + user.bank)}€`
    )
  )
}

async function annullaDeposito(m) {
  const user = global.db.data.users[m.sender]

  if (user?._depositoPending) {
    delete user._depositoPending
  }

  return m.reply(
    box(
      '❌',
      '𝐎𝐏𝐄𝐑𝐀𝐙𝐈𝐎𝐍𝐄 𝐀𝐍𝐍𝐔𝐋𝐋𝐀𝐓𝐀',
      `*📌 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 è 𝐬𝐭𝐚𝐭𝐚 𝐞𝐟𝐟𝐞𝐭𝐭𝐮𝐚𝐭𝐚.*`
    )
  )
}

function parseAmount(input, max) {
  const valore = String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/\./g, '')

  if (['all', 'tutto'].includes(valore)) {
    if (max <= 0) {
      return {
        valid: false,
        message: `*💸 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐜𝐨𝐧𝐭𝐚𝐧𝐭𝐢 𝐝𝐚 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐚𝐫𝐞.*`
      }
    }

    return {
      valid: true,
      value: max
    }
  }

  if (['meta', 'metà', '50%'].includes(valore)) {
    const metà = Math.floor(max / 2)

    if (metà <= 0) {
      return {
        valid: false,
        message: `*💸 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐜𝐨𝐧𝐭𝐚𝐧𝐭𝐢.*`
      }
    }

    return {
      valid: true,
      value: metà
    }
  }

  if (!/^\d+$/.test(valore)) {
    return {
      valid: false,
      message: `*🔢 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.*`
    }
  }

  const amount = parseInt(valore)

  if (amount <= 0) {
    return {
      valid: false,
      message: `*💸 𝐋𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐦𝐢𝐧𝐢𝐦𝐚 è 𝟏.*`
    }
  }

  return {
    valid: true,
    value: amount
  }
}