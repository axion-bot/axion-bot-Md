global.animalShopSession = global.animalShopSession || {}

const ANIMALI_SHOP = [
  { id: 'gatto', tipo: 'Gatto', emoji: '🐱', prezzo: 1000 },
  { id: 'cane', tipo: 'Cane', emoji: '🐶', prezzo: 2000 },
  { id: 'coniglio', tipo: 'Coniglio', emoji: '🐰', prezzo: 2500 },
  { id: 'tartaruga', tipo: 'Tartaruga', emoji: '🐢', prezzo: 3800 },
  { id: 'pappagallo', tipo: 'Pappagallo', emoji: '🦜', prezzo: 5000 }
]

const CIBO_SHOP = [
  { id: 'food1', nome: 'Cibo x1', emoji: '🥫', prezzo: 250, quantita: 1 },
  { id: 'food3', nome: 'Cibo x3', emoji: '🥫', prezzo: 700, quantita: 3 },
  { id: 'food5', nome: 'Cibo x5', emoji: '🥫', prezzo: 1100, quantita: 5 }
]

const box = (emoji, title, body) => `╭━━━━━━━${emoji}━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━${emoji}━━━━━━━╯

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}

function getButtonId(m) {
  const msg = m.message || {}
  return (
    msg.buttonsResponseMessage?.selectedButtonId ||
    msg.templateButtonReplyMessage?.selectedId ||
    m.text ||
    ''
  ).trim()
}

function ensureAnimalUser(user) {
  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.ciboAnimale !== 'number') user.ciboAnimale = 0
  if (!user.animale) user.animale = null
}

function createAnimalData(item) {
  return {
    tipo: item.tipo,
    nome: item.tipo,
    emoji: item.emoji,
    salute: 100,
    fame: 100,
    affetto: 20,
    energia: 100,
    livello: 1,
    xp: 0,
    lastFeed: 0,
    lastPlay: 0,
    lastCare: 0,
    lastUpdate: Date.now()
  }
}

async function sendMainMenu(conn, chat, quoted, user) {
  const text = box(
    '🐾',
    '𝐒𝐇𝐎𝐏 𝐀𝐍𝐈𝐌𝐀𝐋𝐈',
    `*💰 𝐃𝐞𝐧𝐚𝐫𝐨:* ${formatNumber(user.euro)}€
*🥫 𝐂𝐢𝐛𝐨 𝐚𝐧𝐢𝐦𝐚𝐥𝐞:* ${user.ciboAnimale}
*🐾 𝐀𝐧𝐢𝐦𝐚𝐥𝐞:* ${user.animale ? `${user.animale.emoji} ${user.animale.nome}` : '𝐍𝐞𝐬𝐬𝐮𝐧𝐨'}

*𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐬𝐚 𝐯𝐮𝐨𝐢 𝐯𝐞𝐝𝐞𝐫𝐞:*`
  )

  return conn.sendMessage(chat, {
    text,
    footer: '',
    buttons: [
      { buttonId: '.ashop_animali_1', buttonText: { displayText: '🐾 Animali' }, type: 1 },
      { buttonId: '.ashop_cibo', buttonText: { displayText: '🥫 Cibo' }, type: 1 },
      { buttonId: '.ashop_stato', buttonText: { displayText: '📋 Stato' }, type: 1 }
    ],
    headerType: 1
  }, { quoted })
}

async function sendAnimalsPage(conn, chat, quoted, page = 1) {
  const page1 = ANIMALI_SHOP.slice(0, 3)
  const page2 = ANIMALI_SHOP.slice(3, 5)
  const items = page === 1 ? page1 : page2

  const list = items
    .map((v, i) => `*${i + 1}. ${v.emoji} ${v.tipo}* — *${formatNumber(v.prezzo)}€*`)
    .join('\n')

  const text = box(
    '🐾',
    '𝐀𝐍𝐈𝐌𝐀𝐋𝐈 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐈𝐋𝐈',
    `${list}

*📌 𝐔𝐧 𝐬𝐨𝐥𝐨 𝐚𝐧𝐢𝐦𝐚𝐥𝐞 𝐚𝐭𝐭𝐢𝐯𝐨 𝐚𝐥𝐥𝐚 𝐯𝐨𝐥𝐭𝐚.*
*🏷️ 𝐏𝐨𝐭𝐫𝐚𝐢 𝐜𝐚𝐦𝐛𝐢𝐚𝐫𝐠𝐥𝐢 𝐧𝐨𝐦𝐞 𝐝𝐨𝐩𝐨 𝐥’𝐚𝐜𝐪𝐮𝐢𝐬𝐭𝐨.*`
  )

  const buttons = page === 1
    ? [
        { buttonId: `.ashop_buy_${items[0].id}`, buttonText: { displayText: `${items[0].emoji} ${items[0].tipo}` }, type: 1 },
        { buttonId: `.ashop_buy_${items[1].id}`, buttonText: { displayText: `${items[1].emoji} ${items[1].tipo}` }, type: 1 },
        { buttonId: '.ashop_animali_2', buttonText: { displayText: '➡️ Altri' }, type: 1 }
      ]
    : [
        { buttonId: `.ashop_buy_${items[0].id}`, buttonText: { displayText: `${items[0].emoji} ${items[0].tipo}` }, type: 1 },
        { buttonId: `.ashop_buy_${items[1].id}`, buttonText: { displayText: `${items[1].emoji} ${items[1].tipo}` }, type: 1 },
        { buttonId: '.ashop_main', buttonText: { displayText: '⬅️ Menu' }, type: 1 }
      ]

  return conn.sendMessage(chat, {
    text,
    footer: '',
    buttons,
    headerType: 1
  }, { quoted })
}

async function sendFoodPage(conn, chat, quoted) {
  const list = CIBO_SHOP
    .map(v => `*${v.emoji} ${v.nome}* — *${formatNumber(v.prezzo)}€*`)
    .join('\n')

  const text = box(
    '🥫',
    '𝐂𝐈𝐁𝐎 𝐀𝐍𝐈𝐌𝐀𝐋𝐄',
    `${list}

*🍖 𝐈𝐥 𝐜𝐢𝐛𝐨 𝐬𝐞𝐫𝐯𝐞 𝐩𝐞𝐫 𝐮𝐬𝐚𝐫𝐞 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 .nutri*`
  )

  return conn.sendMessage(chat, {
    text,
    footer: '',
    buttons: [
      { buttonId: '.ashop_food_food1', buttonText: { displayText: '🥫 x1' }, type: 1 },
      { buttonId: '.ashop_food_food3', buttonText: { displayText: '🥫 x3' }, type: 1 },
      { buttonId: '.ashop_food_food5', buttonText: { displayText: '🥫 x5' }, type: 1 }
    ],
    headerType: 1
  }, { quoted })
}

async function sendAnimalState(conn, chat, quoted, user) {
  const text = user.animale
    ? box(
        '📋',
        '𝐒𝐓𝐀𝐓𝐎 𝐀𝐍𝐈𝐌𝐀𝐋𝐄',
        `*🐾 𝐀𝐧𝐢𝐦𝐚𝐥𝐞:* ${user.animale.emoji} ${user.animale.nome}
*🏷️ 𝐓𝐢𝐩𝐨:* ${user.animale.tipo}
*💰 𝐃𝐞𝐧𝐚𝐫𝐨:* ${formatNumber(user.euro)}€
*🥫 𝐂𝐢𝐛𝐨:* ${user.ciboAnimale}`
      )
    : box(
        '📋',
        '𝐒𝐓𝐀𝐓𝐎 𝐀𝐍𝐈𝐌𝐀𝐋𝐄',
        `*🐾 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐧𝐜𝐨𝐫𝐚 𝐮𝐧 𝐚𝐧𝐢𝐦𝐚𝐥𝐞.*
*💰 𝐃𝐞𝐧𝐚𝐫𝐨:* ${formatNumber(user.euro)}€
*🥫 𝐂𝐢𝐛𝐨:* ${user.ciboAnimale}`
      )

  return conn.sendMessage(chat, {
    text,
    footer: '',
    buttons: [
      { buttonId: '.ashop_main', buttonText: { displayText: '⬅️ Menu' }, type: 1 }
    ],
    headerType: 1
  }, { quoted })
}

async function sendAnimalConfirm(conn, chat, quoted, item) {
  const text = box(
    '🛒',
    '𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 𝐀𝐂𝐐𝐔𝐈𝐒𝐓𝐎',
    `*𝐕𝐮𝐨𝐢 𝐜𝐨𝐦𝐩𝐫𝐚𝐫𝐞:* ${item.emoji} ${item.tipo}
*💰 𝐏𝐫𝐞𝐳𝐳𝐨:* ${formatNumber(item.prezzo)}€

*🏷️ 𝐏𝐨𝐭𝐫𝐚𝐢 𝐜𝐚𝐦𝐛𝐢𝐚𝐫𝐞 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐜𝐨𝐧 .nomeanimale <nome>*`
  )

  return conn.sendMessage(chat, {
    text,
    footer: '',
    buttons: [
      { buttonId: `.ashop_confirm_buy_${item.id}`, buttonText: { displayText: '✅ Compra' }, type: 1 },
      { buttonId: '.ashop_main', buttonText: { displayText: '❌ Annulla' }, type: 1 }
    ],
    headerType: 1
  }, { quoted })
}

async function sendFoodConfirm(conn, chat, quoted, item) {
  const text = box(
    '🛒',
    '𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 𝐀𝐂𝐐𝐔𝐈𝐒𝐓𝐎',
    `*𝐕𝐮𝐨𝐢 𝐜𝐨𝐦𝐩𝐫𝐚𝐫𝐞:* ${item.emoji} ${item.nome}
*💰 𝐏𝐫𝐞𝐳𝐳𝐨:* ${formatNumber(item.prezzo)}€
*🥫 𝐐𝐮𝐚𝐧𝐭𝐢𝐭à:* +${item.quantita}`
  )

  return conn.sendMessage(chat, {
    text,
    footer: '',
    buttons: [
      { buttonId: `.ashop_confirm_food_${item.id}`, buttonText: { displayText: '✅ Compra' }, type: 1 },
      { buttonId: '.ashop_main', buttonText: { displayText: '❌ Annulla' }, type: 1 }
    ],
    headerType: 1
  }, { quoted })
}

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
  ensureAnimalUser(user)

  global.animalShopSession[m.sender] = {
    owner: m.sender,
    chat: m.chat,
    expires: Date.now() + 2 * 60 * 1000
  }

  return sendMainMenu(conn, m.chat, m, user)
}

handler.before = async (m, { conn }) => {
  const raw = getButtonId(m)
  if (!raw || !raw.startsWith('.ashop_')) return false

  const session = global.animalShopSession[m.sender]
  if (!session) {
    await conn.reply(
      m.chat,
      box('⚠️', '𝐒𝐄𝐒𝐒𝐈𝐎𝐍𝐄 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐀', `*𝐐𝐮𝐞𝐬𝐭𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 è 𝐭𝐮𝐚 𝐨 𝐝𝐞𝐯𝐢 𝐫𝐢𝐚𝐩𝐫𝐢𝐫𝐞 𝐥𝐨 𝐬𝐡𝐨𝐩.*`),
      m
    )
    return true
  }

  if (session.chat !== m.chat) return true

  if (Date.now() > session.expires) {
    delete global.animalShopSession[m.sender]
    await conn.reply(
      m.chat,
      box('⏳', '𝐒𝐄𝐒𝐒𝐈𝐎𝐍𝐄 𝐒𝐂𝐀𝐃𝐔𝐓𝐀', `*𝐋𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐨 𝐬𝐡𝐨𝐩 è 𝐬𝐜𝐚𝐝𝐮𝐭𝐚. 𝐔𝐬𝐚 .shopanimali 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨.*`),
      m
    )
    return true
  }

  session.expires = Date.now() + 2 * 60 * 1000

  const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
  ensureAnimalUser(user)

  if (raw === '.ashop_main') {
    await sendMainMenu(conn, m.chat, m, user)
    return true
  }

  if (raw === '.ashop_animali_1') {
    await sendAnimalsPage(conn, m.chat, m, 1)
    return true
  }

  if (raw === '.ashop_animali_2') {
    await sendAnimalsPage(conn, m.chat, m, 2)
    return true
  }

  if (raw === '.ashop_cibo') {
    await sendFoodPage(conn, m.chat, m)
    return true
  }

  if (raw === '.ashop_stato') {
    await sendAnimalState(conn, m.chat, m, user)
    return true
  }

  if (raw.startsWith('.ashop_buy_')) {
    const id = raw.replace('.ashop_buy_', '')
    const item = ANIMALI_SHOP.find(v => v.id === id)
    if (!item) return true

    if (user.animale) {
      await conn.reply(
        m.chat,
        box('⚠️', '𝐒𝐇𝐎𝐏 𝐀𝐍𝐈𝐌𝐀𝐋𝐈', `*𝐇𝐚𝐢 𝐠𝐢à 𝐮𝐧 𝐚𝐧𝐢𝐦𝐚𝐥𝐞 𝐚𝐭𝐭𝐢𝐯𝐨.*

*🐾 𝐀𝐧𝐢𝐦𝐚𝐥𝐞 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:* ${user.animale.emoji} ${user.animale.nome}`),
        m
      )
      return true
    }

    await sendAnimalConfirm(conn, m.chat, m, item)
    return true
  }

  if (raw.startsWith('.ashop_food_')) {
    const id = raw.replace('.ashop_food_', '')
    const item = CIBO_SHOP.find(v => v.id === id)
    if (!item) return true

    await sendFoodConfirm(conn, m.chat, m, item)
    return true
  }

  if (raw.startsWith('.ashop_confirm_buy_')) {
    const id = raw.replace('.ashop_confirm_buy_', '')
    const item = ANIMALI_SHOP.find(v => v.id === id)
    if (!item) return true

    if (user.animale) {
      await conn.reply(
        m.chat,
        box('⚠️', '𝐀𝐂𝐐𝐔𝐈𝐒𝐓𝐎 𝐍𝐄𝐆𝐀𝐓𝐎', `*𝐇𝐚𝐢 𝐠𝐢à 𝐮𝐧 𝐚𝐧𝐢𝐦𝐚𝐥𝐞 𝐚𝐭𝐭𝐢𝐯𝐨.*`),
        m
      )
      return true
    }

    if (user.euro < item.prezzo) {
      await conn.reply(
        m.chat,
        box(
          '❌',
          '𝐃𝐄𝐍𝐀𝐑𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄',
          `*𝐓𝐢 𝐬𝐞𝐫𝐯𝐨𝐧𝐨:* ${formatNumber(item.prezzo)}€
*𝐇𝐚𝐢:* ${formatNumber(user.euro)}€`
        ),
        m
      )
      return true
    }

    user.euro -= item.prezzo
    user.animale = createAnimalData(item)

    await conn.sendMessage(m.chat, {
      text: box(
        '✅',
        '𝐀𝐂𝐐𝐔𝐈𝐒𝐓𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎',
        `*𝐇𝐚𝐢 𝐜𝐨𝐦𝐩𝐫𝐚𝐭𝐨:* ${item.emoji} ${item.tipo}
*💰 𝐒𝐩𝐞𝐬𝐢:* ${formatNumber(item.prezzo)}€
*💼 𝐑𝐢𝐦𝐚𝐬𝐭𝐢:* ${formatNumber(user.euro)}€

*🏷️ 𝐍𝐨𝐦𝐞 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:* ${user.animale.nome}
*✏️ 𝐔𝐬𝐚 .nomeanimale <nome> 𝐩𝐞𝐫 𝐜𝐚𝐦𝐛𝐢𝐚𝐫𝐠𝐥𝐢 𝐧𝐨𝐦𝐞.*`
      ),
      footer: '',
      buttons: [
        { buttonId: '.animale', buttonText: { displayText: '🐾 Il mio animale' }, type: 1 },
        { buttonId: '.ashop_main', buttonText: { displayText: '🛒 Torna allo shop' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })

    return true
  }

  if (raw.startsWith('.ashop_confirm_food_')) {
    const id = raw.replace('.ashop_confirm_food_', '')
    const item = CIBO_SHOP.find(v => v.id === id)
    if (!item) return true

    if (user.euro < item.prezzo) {
      await conn.reply(
        m.chat,
        box(
          '❌',
          '𝐃𝐄𝐍𝐀𝐑𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄',
          `*𝐓𝐢 𝐬𝐞𝐫𝐯𝐨𝐧𝐨:* ${formatNumber(item.prezzo)}€
*𝐇𝐚𝐢:* ${formatNumber(user.euro)}€`
        ),
        m
      )
      return true
    }

    user.euro -= item.prezzo
    user.ciboAnimale += item.quantita

    await conn.sendMessage(m.chat, {
      text: box(
        '✅',
        '𝐀𝐂𝐐𝐔𝐈𝐒𝐓𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎',
        `*𝐇𝐚𝐢 𝐜𝐨𝐦𝐩𝐫𝐚𝐭𝐨:* ${item.emoji} ${item.nome}
*🥫 𝐂𝐢𝐛𝐨 𝐨𝐭𝐭𝐞𝐧𝐮𝐭𝐨:* +${item.quantita}
*💰 𝐒𝐩𝐞𝐬𝐢:* ${formatNumber(item.prezzo)}€
*💼 𝐑𝐢𝐦𝐚𝐬𝐭𝐢:* ${formatNumber(user.euro)}€
*🥫 𝐂𝐢𝐛𝐨 𝐭𝐨𝐭𝐚𝐥𝐞:* ${user.ciboAnimale}`
      ),
      footer: '',
      buttons: [
        { buttonId: '.nutri', buttonText: { displayText: '🥫 Nutri' }, type: 1 },
        { buttonId: '.ashop_main', buttonText: { displayText: '🛒 Torna allo shop' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })

    return true
  }

  return false
}

handler.help = ['shopanimali', 'animaleshop']
handler.tags = ['rpg']
handler.command = /^(shopanimali|animaleshop|negozioanimali)$/i

export default handler