// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let hangmanGames = {}

const categories = {
  oggetti: ['casa', 'porta', 'tavolo', 'sedia', 'letto', 'finestra', 'chiave', 'zaino'],
  cibo: ['pizza', 'pasta', 'pane', 'formaggio', 'gelato', 'cioccolato', 'biscotto'],
  animali: ['cane', 'gatto', 'leone', 'tigre', 'cavallo', 'pesce', 'orso'],
  natura: ['mare', 'sole', 'luna', 'stella', 'montagna', 'albero', 'fiore'],
  persone: ['mamma', 'papa', 'amico', 'bambino', 'insegnante', 'dottore'],
  tech: ['telefono', 'computer', 'internet', 'email', 'video', 'gioco']
}

const S = v => String(v || '')
const random = arr => arr[Math.floor(Math.random() * arr.length)]

const gameButtons = prefix => [
  { buttonId: `${prefix}impiccato`, buttonText: { displayText: '🎮 Nuova Partita' }, type: 1 },
  { buttonId: `${prefix}skipimpiccato`, buttonText: { displayText: '⏩ Salta' }, type: 1 }
]

function getRandomWord() {
  const keys = Object.keys(categories)
  const category = random(keys)
  const word = random(categories[category])
  return { word, category }
}

function renderGame(game) {
  return `*╭━━━━━━━🎮━━━━━━━╮*
*✦ 𝐈𝐌𝐏𝐈𝐂𝐂𝐀𝐓𝐎 ✦*
*╰━━━━━━━🎮━━━━━━━╯*

*📂 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚:* ${game.category}
*🔤 𝐏𝐚𝐫𝐨𝐥𝐚:* ${game.guessed.join(' ')}
*❤️ 𝐓𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐢:* ${game.attempts}
*❌ 𝐄𝐫𝐫𝐨𝐫𝐢:* ${game.wrong.join(', ') || '𝐍𝐞𝐬𝐬𝐮𝐧𝐨'}

*📩 𝐒𝐜𝐫𝐢𝐯𝐢 𝐮𝐧𝐚 𝐥𝐞𝐭𝐭𝐞𝐫𝐚 𝐨 𝐢𝐧𝐝𝐨𝐯𝐢𝐧𝐚 𝐥𝐚 𝐩𝐚𝐫𝐨𝐥𝐚!*`
}

let handler = async (m, { conn, command, usedPrefix }) => {
  const chat = m.chat

  if (command === 'impiccato') {
    if (hangmanGames[chat]) {
      return conn.sendMessage(chat, {
        text: `*❌ 𝐂’è 𝐠𝐢à 𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨!*`,
        footer: '𝐆𝐞𝐬𝐭𝐢𝐬𝐜𝐢 𝐥𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚',
        buttons: gameButtons(usedPrefix),
        headerType: 1
      }, { quoted: m })
    }

    const { word, category } = getRandomWord()

    hangmanGames[chat] = {
      word,
      category,
      guessed: Array(word.length).fill('_'),
      wrong: [],
      attempts: 6
    }

    return conn.sendMessage(chat, {
      text: renderGame(hangmanGames[chat]),
      footer: '𝐁𝐮𝐨𝐧𝐚 𝐟𝐨𝐫𝐭𝐮𝐧𝐚',
      buttons: gameButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })
  }

  if (command === 'skipimpiccato') {
    if (!hangmanGames[chat]) {
      return m.reply('*❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐝𝐚 𝐬𝐚𝐥𝐭𝐚𝐫𝐞.*')
    }

    const parola = hangmanGames[chat].word
    delete hangmanGames[chat]

    return conn.sendMessage(chat, {
      text: `*╭━━━━━━━⏩━━━━━━━╮*
*✦ 𝐏𝐀𝐑𝐓𝐈𝐓𝐀 𝐒𝐀𝐋𝐓𝐀𝐓𝐀 ✦*
*╰━━━━━━━⏩━━━━━━━╯*

*📌 𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚:* ${parola}`,
      footer: '𝐆𝐢𝐨𝐜𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨',
      buttons: gameButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })
  }
}

handler.before = async (m, { conn, usedPrefix }) => {
  const chat = m.chat
  const game = hangmanGames[chat]

  if (!game || !m.text) return

  const input = S(m.text).toLowerCase().trim()
  if (!input) return
  if (/^\./.test(input)) return

  if (input.length > 1) {
    if (input === game.word) {
      delete hangmanGames[chat]
      return conn.sendMessage(chat, {
        text: `*╭━━━━━━━🎉━━━━━━━╮*
*✦ 𝐇𝐀𝐈 𝐕𝐈𝐍𝐓𝐎 ✦*
*╰━━━━━━━🎉━━━━━━━╯*

*🏆 𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚:* ${game.word}`,
        footer: '𝐆𝐢𝐨𝐜𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨',
        buttons: gameButtons(usedPrefix),
        headerType: 1
      }, { quoted: m })
    } else {
      game.attempts--
    }
  } else {
    if (game.guessed.includes(input) || game.wrong.includes(input)) return

    if (game.word.includes(input)) {
      for (let i = 0; i < game.word.length; i++) {
        if (game.word[i] === input) game.guessed[i] = input
      }
    } else {
      game.wrong.push(input)
      game.attempts--
    }
  }

  if (game.guessed.join('') === game.word) {
    delete hangmanGames[chat]
    return conn.sendMessage(chat, {
      text: `*╭━━━━━━━🎉━━━━━━━╮*
*✦ 𝐇𝐀𝐈 𝐕𝐈𝐍𝐓𝐎 ✦*
*╰━━━━━━━🎉━━━━━━━╯*

*🏆 𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚:* ${game.word}`,
      footer: '𝐆𝐢𝐨𝐜𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨',
      buttons: gameButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })
  }

  if (game.attempts <= 0) {
    delete hangmanGames[chat]
    return conn.sendMessage(chat, {
      text: `*╭━━━━━━━💀━━━━━━━╮*
*✦ 𝐇𝐀𝐈 𝐏𝐄𝐑𝐒𝐎 ✦*
*╰━━━━━━━💀━━━━━━━╯*

*📌 𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚:* ${game.word}`,
      footer: '𝐆𝐢𝐨𝐜𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨',
      buttons: gameButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })
  }

  await conn.sendMessage(chat, {
    text: renderGame(game),
    footer: '𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚 𝐥𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚',
    buttons: gameButtons(usedPrefix),
    headerType: 1
  }, { quoted: m })
}

handler.command = /^(impiccato|skipimpiccato)$/i
handler.tags = ['game']
handler.help = ['impiccato', 'skipimpiccato']
handler.group = true

export default handler