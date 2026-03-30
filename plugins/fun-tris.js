// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let games = {}

const S = v => String(v || '')

function getPhoneNumber(jid) {
  if (!jid) return ''
  return S(jid).split('@')[0].replace(/\D/g, '')
}

function checkWinner(board) {
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === board[i][1] && board[i][1] === board[i][2]) return true
    if (board[0][i] === board[1][i] && board[1][i] === board[2][i]) return true
  }

  if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) return true
  if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) return true

  return false
}

function renderCell(cell) {
  if (cell === '❌' || cell === '⭕') return cell
  return '⬜'
}

function renderBoard(board) {
  return `      1️⃣   2️⃣   3️⃣
   ┌────┬────┬────┐
A  │ ${renderCell(board[0][0])} │ ${renderCell(board[0][1])} │ ${renderCell(board[0][2])} │
   ├────┼────┼────┤
B  │ ${renderCell(board[1][0])} │ ${renderCell(board[1][1])} │ ${renderCell(board[1][2])} │
   ├────┼────┼────┤
C  │ ${renderCell(board[2][0])} │ ${renderCell(board[2][1])} │ ${renderCell(board[2][2])} │
   └────┴────┴────┘`
}

async function sendBoard(chatId, conn, game, msg = '') {
  await conn.sendMessage(chatId, {
    text: `${renderBoard(game.board)}\n\n${msg}`.trim(),
    mentions: game.jids
  })
}

function startTurnTimer(chatId, conn) {
  const game = games[chatId]
  if (!game) return

  if (game.timer) clearTimeout(game.timer)

  game.timer = setTimeout(async () => {
    if (!games[chatId]) return

    await conn.sendMessage(chatId, {
      text: `*╭━━━━━━━⏱️━━━━━━━╮*
*✦ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎 ✦*
*╰━━━━━━━⏱️━━━━━━━╯*

*🛑 𝐋𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 è 𝐬𝐭𝐚𝐭𝐚 𝐜𝐡𝐢𝐮𝐬𝐚.*`,
      mentions: game.jids
    })

    delete games[chatId]
  }, 120000)
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const chatId = m.chat

  if (command === 'tris') {
    const mention = m.mentionedJid?.[0] || m.quoted?.sender || null

    if (!mention) {
      return conn.sendMessage(chatId, {
        text: `*𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐪𝐮𝐚𝐥𝐜𝐮𝐧𝐨.*\n*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:* ${usedPrefix}tris @utente`
      }, { quoted: m })
    }

    const myNumber = getPhoneNumber(m.sender)
    const theirNumber = getPhoneNumber(mention)

    if (myNumber === theirNumber) {
      return conn.sendMessage(chatId, {
        text: '*𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐠𝐢𝐨𝐜𝐚𝐫𝐞 𝐜𝐨𝐧𝐭𝐫𝐨 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨.*'
      }, { quoted: m })
    }

    if (games[chatId]) {
      return conn.sendMessage(chatId, {
        text: '*𝐂’è 𝐠𝐢à 𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.*'
      }, { quoted: m })
    }

    games[chatId] = {
      board: [['A1', 'A2', 'A3'], ['B1', 'B2', 'B3'], ['C1', 'C2', 'C3']],
      players: [myNumber, theirNumber],
      jids: [m.sender, mention],
      turn: 0,
      timer: null,
      symbols: ['❌', '⭕']
    }

    await sendBoard(chatId, conn, games[chatId], `*╭━━━━━━━🎮━━━━━━━╮*
*✦ 𝐓𝐑𝐈𝐒 𝐎𝐍𝐋𝐈𝐍𝐄 ✦*
*╰━━━━━━━🎮━━━━━━━╯*

*👤 𝐆𝐢𝐨𝐜𝐚𝐭𝐨𝐫𝐞 𝟏:* @${games[chatId].jids[0].split('@')[0]} ❌
*👤 𝐆𝐢𝐨𝐜𝐚𝐭𝐨𝐫𝐞 𝟐:* @${games[chatId].jids[1].split('@')[0]} ⭕

*▶️ 𝐓𝐨𝐜𝐜𝐚 𝐚:* @${games[chatId].jids[0].split('@')[0]}
*📝 𝐌𝐨𝐬𝐬𝐚:* ${usedPrefix}putris A1
*⏳ 𝐓𝐞𝐦𝐩𝐨:* 2 minuti`)

    startTurnTimer(chatId, conn)
    return
  }

  if (command === 'putris') {
    const game = games[chatId]
    if (!game) {
      return conn.sendMessage(chatId, {
        text: '*𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚. 𝐔𝐬𝐚 .tris*'
      }, { quoted: m })
    }

    const myNumber = getPhoneNumber(m.sender)
    const currentNumber = game.players[game.turn]

    if (myNumber !== currentNumber) {
      const currentPlayerJid = game.jids[game.turn]
      return conn.sendMessage(chatId, {
        text: `*╭━━━━━━━🚫━━━━━━━╮*
*✦ 𝐓𝐔𝐑𝐍𝐎 𝐄𝐑𝐑𝐀𝐓𝐎 ✦*
*╰━━━━━━━🚫━━━━━━━╯*

*▶️ 𝐓𝐨𝐜𝐜𝐚 𝐚:* @${currentPlayerJid.split('@')[0]}
*❗ 𝐒𝐢𝐦𝐛𝐨𝐥𝐨:* ${game.symbols[game.turn]}`,
        mentions: [currentPlayerJid]
      }, { quoted: m })
    }

    const move = S(text).trim().toUpperCase()
    const map = { A: 0, B: 1, C: 2 }
    const row = map[move[0]]
    const col = parseInt(move[1]) - 1

    if (row === undefined || isNaN(col) || col < 0 || col > 2) {
      return conn.sendMessage(chatId, {
        text: `*𝐌𝐨𝐬𝐬𝐚 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐚.*

*𝐄𝐬𝐞𝐦𝐩𝐢:*
${usedPrefix}putris A1
${usedPrefix}putris B2
${usedPrefix}putris C3`
      }, { quoted: m })
    }

    if (['❌', '⭕'].includes(game.board[row][col])) {
      return conn.sendMessage(chatId, {
        text: '*𝐂𝐚𝐬𝐞𝐥𝐥𝐚 𝐠𝐢à 𝐨𝐜𝐜𝐮𝐩𝐚𝐭𝐚.*'
      }, { quoted: m })
    }

    game.board[row][col] = game.symbols[game.turn]

    if (checkWinner(game.board)) {
      clearTimeout(game.timer)

      await sendBoard(chatId, conn, game, `*╭━━━━━━━🏆━━━━━━━╮*
*✦ 𝐕𝐈𝐓𝐓𝐎𝐑𝐈𝐀 ✦*
*╰━━━━━━━🏆━━━━━━━╯*

*🥇 𝐕𝐢𝐧𝐜𝐢𝐭𝐨𝐫𝐞:* @${m.sender.split('@')[0]}
*❗ 𝐒𝐢𝐦𝐛𝐨𝐥𝐨:* ${game.symbols[game.turn]}`)

      delete games[chatId]
      return
    }

    if (game.board.flat().every(cell => ['❌', '⭕'].includes(cell))) {
      clearTimeout(game.timer)

      await sendBoard(chatId, conn, game, `*╭━━━━━━━🤝━━━━━━━╮*
*✦ 𝐏𝐀𝐑𝐄𝐆𝐆𝐈𝐎 ✦*
*╰━━━━━━━🤝━━━━━━━╯*

*𝐍𝐞𝐬𝐬𝐮𝐧 𝐯𝐢𝐧𝐜𝐢𝐭𝐨𝐫𝐞.*`)

      delete games[chatId]
      return
    }

    game.turn = 1 - game.turn
    const nextPlayerJid = game.jids[game.turn]
    const nextSymbol = game.symbols[game.turn]

    await sendBoard(chatId, conn, game, `*╭━━━━━━━✅━━━━━━━╮*
*✦ 𝐌𝐎𝐒𝐒𝐀 𝐄𝐅𝐅𝐄𝐓𝐓𝐔𝐀𝐓𝐀 ✦*
*╰━━━━━━━✅━━━━━━━╯*

*▶️ 𝐓𝐨𝐜𝐜𝐚 𝐚:* @${nextPlayerJid.split('@')[0]}
*❗ 𝐒𝐢𝐦𝐛𝐨𝐥𝐨:* ${nextSymbol}
*📝 𝐌𝐨𝐬𝐬𝐚:* ${usedPrefix}putris [casella]`)

    startTurnTimer(chatId, conn)
    return
  }

  if (command === 'endtris') {
    if (games[chatId]) {
      clearTimeout(games[chatId].timer)
      const players = games[chatId].jids
      delete games[chatId]

      await conn.sendMessage(chatId, {
        text: '*𝐏𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐚.*',
        mentions: players
      })
    } else {
      await conn.sendMessage(chatId, {
        text: '*𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚.*'
      })
    }
    return
  }

  if (command === 'trishelp') {
    await conn.sendMessage(chatId, {
      text: `*╭━━━━━━━📘━━━━━━━╮*
*✦ 𝐆𝐔𝐈𝐃𝐀 𝐓𝐑𝐈𝐒 ✦*
*╰━━━━━━━📘━━━━━━━╯*

*𝐂𝐨𝐦𝐚𝐧𝐝𝐢:*
${usedPrefix}tris @utente
${usedPrefix}putris A1
${usedPrefix}endtris

*𝐎𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨:*
𝐅𝐚𝐫𝐞 𝟑 𝐬𝐢𝐦𝐛𝐨𝐥𝐢 𝐢𝐧 𝐟𝐢𝐥𝐚

*⏳ 𝐓𝐞𝐦𝐩𝐨 𝐭𝐮𝐫𝐧𝐨:* 2 minuti`
    }, { quoted: m })
  }
}

handler.command = /^(tris|putris|endtris|trishelp)$/i
handler.help = ['tris', 'putris', 'endtris', 'trishelp']
handler.tags = ['game']
handler.description = 'Gioco del Tris multiplayer'
handler.group = true

export default handler