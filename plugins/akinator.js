import { Aki } from 'aki-api';

const sessions = new Map();

let handler = async (m, { conn, text }) => {
  const chatId = m.chat;

  // 1. Handle active session answers
  if (sessions.has(chatId)) {
    const session = sessions.get(chatId);
    let answer = m.text.trim().toLowerCase();
    
    // Map numbers to Aki indices if user types "1" instead of "yes"
    const answersMap = { '1': 0, '0': 0, '2': 1, '3': 2, '4': 3, '5': 4 };
    if (answersMap[answer] !== undefined) answer = answersMap[answer];

    try {
      await session.step(answer);

      if (session.progress >= 70 || session.currentStep >= 30) {
        await session.win();
        const guess = session.answers[0];
        await conn.sendMessage(chatId, {
          image: { url: guess.absolute_picture_path },
          caption: `✨ Penso che tu stia pensando a: *${guess.name}*\n_${guess.description}_`
        });
        sessions.delete(chatId);
      } else {
        await conn.sendMessage(chatId, {
          text: `*Domanda ${session.currentStep + 1}*:\n\n${session.question}\n\n` +
                `1. Sì\n2. No\n3. Non lo so\n4. Probabilmente\n5. Probabilmente no`
        });
      }
    } catch (e) {
      sessions.delete(chatId);
      m.reply("❌ Sessione scaduta o errore tecnico.");
    }
    return;
  }

  // 2. Start new game
  const region = 'it'; // Set to Italian
  const aki = new Aki({ region });
  await aki.start();

  sessions.set(chatId, aki);

  await conn.sendMessage(chatId, {
    text: `🎮 *Akinator Iniziato!*\n\n*Domanda 1*:\n${aki.question}\n\n` +
          `Rispondi ai messaggi successivi con i numeri o le parole.`
  });
};

handler.help = ["akinator"];
handler.tags = ["fun"];
handler.command = /^(akinator)$/i;

export default handler;
