// Risolve l'errore 'unable to get local issuer certificate'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Aki } from 'aki-api';

// Mappa per gestire le sessioni attive in base alla chat
const sessions = new Map();

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chatId = m.chat;

  // --- LOGICA GESTIONE RISPOSTE ---
  if (sessions.has(chatId)) {
    // Se l'utente scrive un altro comando mentre gioca, ignoriamo Akinator
    if (m.text.startsWith(usedPrefix) && !m.text.includes(command)) return;

    const session = sessions.get(chatId);
    let answer = m.text.trim().toLowerCase();
    
    // Mappatura flessibile: l'utente può rispondere con numeri o parole
    const answersMap = {
      '1': 0, 'si': 0, 'sì': 0,
      '2': 1, 'no': 1,
      '3': 2, 'non lo so': 2, 'boh': 2,
      '4': 3, 'probabilmente': 3, 'forse si': 3,
      '5': 4, 'probabilmente no': 4, 'forse no': 4
    };

    // Se la risposta non è valida tra quelle mappate, non fare nulla (lascia che altri plugin leggano il messaggio)
    if (!(answer in answersMap)) return;

    try {
      await session.step(answersMap[answer]);

      // Controllo vittoria: se il progresso è >= 80% o Akinator ha fatto molte domande
      if (session.progress >= 80 || session.currentStep >= 35) {
        await session.win();
        const guess = session.answers[0]; // Prende la prima ipotesi (la più probabile)
        
        let txt = `✨ *HO INDOVINATO!* ✨\n\n`;
        txt += `👤 *Nome:* ${guess.name}\n`;
        txt += `📝 *Descrizione:* ${guess.description}\n`;
        txt += `📊 *Precisione:* ${Math.floor(session.progress)}%\n\n`;
        txt += `_Scrivi *${usedPrefix + command}* per giocare ancora!_`;

        await conn.sendMessage(chatId, {
          image: { url: guess.absolute_picture_path },
          caption: txt
        }, { quoted: m });

        sessions.delete(chatId);
      } else {
        // Continua con la domanda successiva
        let questionTxt = `🎮 *AKINATOR* - Domanda ${session.currentStep + 1}\n`;
        questionTxt += `Progressi: ${Math.floor(session.progress)}%\n`;
        questionTxt += `\n*${session.question}*\n\n`;
        questionTxt += `1. Sì\n`;
        questionTxt += `2. No\n`;
        questionTxt += `3. Non lo so\n`;
        questionTxt += `4. Probabilmente\n`;
        questionTxt += `5. Probabilmente no`;

        await conn.sendMessage(chatId, { text: questionTxt }, { quoted: m });
      }
    } catch (e) {
      console.error(e);
      sessions.delete(chatId);
      m.reply("❌ La sessione è scaduta o si è verificato un errore di rete.");
    }
    return;
  }

  // --- LOGICA AVVIO PARTITA ---
  try {
    m.reply("⏳ *Akinator si sta svegliando...*");
    
    const region = 'it'; // Lingua italiana
    const aki = new Aki({ region });
    await aki.start();

    sessions.set(chatId, aki);

    let startTxt = `🎮 *AKINATOR - PARTITA INIZIATA*\n\n`;
    startTxt += `Pensa a un personaggio reale o immaginario.\n\n`;
    startTxt += `*Domanda 1:*\n${aki.question}\n\n`;
    startTxt += `_Rispondi con i numeri (1-5) o scrivendo la risposta._`;

    await conn.sendMessage(chatId, { text: startTxt }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply("❌ Impossibile avviare Akinator. Riprova più tardi.");
  }
};

handler.help = ["akinator"];
handler.tags = ["fun"];
handler.command = /^(akinator|aki)$/i; // Risponde a .akinator o .aki

export default handler;
