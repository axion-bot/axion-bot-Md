let hangmanGames = {}; // Giochi attivi per chat

let categories = {
  oggetti: ["casa", "porta", "tavolo", "sedia", "letto", "finestra", "chiave", "zaino"],
  cibo: ["pizza", "pasta", "pane", "formaggio", "gelato", "cioccolato", "biscotto"],
  animali: ["cane", "gatto", "leone", "tigre", "cavallo", "pesce", "orso"],
  natura: ["mare", "sole", "luna", "stella", "montagna", "albero", "fiore"],
  persone: ["mamma", "papa", "amico", "bambino", "insegnante", "dottore"],
  tech: ["telefono", "computer", "internet", "email", "video", "gioco"]
};

function getRandomWord() {
  let keys = Object.keys(categories);
  let category = keys[Math.floor(Math.random() * keys.length)];
  let words = categories[category];
  let word = words[Math.floor(Math.random() * words.length)];
  return { word, category };
}

let handler = async (m, { conn, command }) => {
  let chat = m.chat;

  if (command === 'impiccato') {
    if (hangmanGames[chat]) {
      return m.reply('❌ C’è già una partita in corso!');
    }

    let { word, category } = getRandomWord();

    hangmanGames[chat] = {
      word,
      category,
      guessed: Array(word.length).fill('_'),
      wrong: [],
      attempts: 6
    };

    return conn.sendMessage(chat, {
      text:
`🎮 *IMPIICCATO* 🎮

📂 Categoria: *${category}*

${hangmanGames[chat].guessed.join(' ')}

❤️ Tentativi: 6
❌ Errori: Nessuno

📩 Scrivi una lettera o indovina la parola!`
    });
  }

  if (command === 'skipimpiccato') {
    if (!hangmanGames[chat]) {
      return m.reply('❌ Nessuna partita da saltare.');
    }
    delete hangmanGames[chat];
    return m.reply('⏩ Partita saltata!');
  }
};

// Gestione input utenti
handler.before = async (m, { conn }) => {
  let chat = m.chat;
  let game = hangmanGames[chat];
  if (!game) return;
  if (!m.text) return;

  let input = m.text.toLowerCase().trim();

  // Indovina parola intera
  if (input.length > 1) {
    if (input === game.word) {
      delete hangmanGames[chat];
      return conn.reply(chat, `🎉 *VINTO!* La parola era *${game.word}*`);
    } else {
      game.attempts--;
    }
  } else {
    // Lettera singola
    if (game.guessed.includes(input) || game.wrong.includes(input)) {
      return;
    }

    if (game.word.includes(input)) {
      for (let i = 0; i < game.word.length; i++) {
        if (game.word[i] === input) {
          game.guessed[i] = input;
        }
      }
    } else {
      game.wrong.push(input);
      game.attempts--;
    }
  }

  // Vittoria
  if (game.guessed.join('') === game.word) {
    delete hangmanGames[chat];
    return conn.reply(chat, `🎉 *VINTO!* La parola era *${game.word}*`);
  }

  // Sconfitta
  if (game.attempts <= 0) {
    delete hangmanGames[chat];
    return conn.reply(chat, `💀 *PERSO!* La parola era *${game.word}*`);
  }

  // Aggiornamento gioco
  await conn.sendMessage(chat, {
    text:
`🎮 *IMPIICCATO* 🎮

📂 Categoria: *${game.category}*

${game.guessed.join(' ')}

❤️ Tentativi: ${game.attempts}
❌ Errori: ${game.wrong.join(', ') || 'Nessuno'}

📩 Scrivi una lettera o indovina la parola!`
  });
};

handler.command = ['impiccato', 'skipimpiccato'];
handler.tags = ['game'];
handler.help = ['impiccato', 'skipimpiccato'];

export default handler;