// Forza la disattivazione del controllo SSL (per l'errore del certificato)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Aki } from 'aki-api';

const sessions = new Map();

let handler = async (m, { conn, usedPrefix, command }) => {
    const chatId = m.chat;

    // --- GESTIONE SESSIONE ATTIVA ---
    if (sessions.has(chatId)) {
        // Se l'utente scrive un altro comando, non interferire
        if (m.text.startsWith(usedPrefix) && !m.text.includes(command)) return;

        const session = sessions.get(chatId);
        let answer = m.text.trim().toLowerCase();
        
        const answersMap = {
            '1': 0, 'si': 0, 'sì': 0,
            '2': 1, 'no': 1,
            '3': 2, 'non lo so': 2, 'boh': 2,
            '4': 3, 'probabilmente': 3,
            '5': 4, 'probabilmente no': 4
        };

        if (!(answer in answersMap)) return;

        try {
            await session.step(answersMap[answer]);

            if (session.progress >= 80 || session.currentStep >= 35) {
                await session.win();
                const guess = session.answers[0];
                
                let txt = `✨ *HO INDOVINATO!* ✨\n\n`;
                txt += `👤 *Personaggio:* ${guess.name}\n`;
                txt += `📝 *Descrizione:* ${guess.description}\n`;
                txt += `📊 *Precisione:* ${Math.floor(session.progress)}%\n\n`;
                txt += `_Usa ${usedPrefix + command} per un'altra partita!_`;

                await conn.sendMessage(chatId, {
                    image: { url: guess.absolute_picture_path },
                    caption: txt
                }, { quoted: m });

                sessions.delete(chatId);
            } else {
                let questionTxt = `🎮 *AKINATOR* - Domanda ${session.currentStep + 1}\n`;
                questionTxt += `Progressi: ${Math.floor(session.progress)}%\n\n`;
                questionTxt += `*${session.question}*\n\n`;
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
            m.reply("❌ Errore nella sessione. Il firewall di Akinator potrebbe aver interrotto il gioco.");
        }
        return;
    }

    // --- AVVIO NUOVA PARTITA ---
    try {
        m.reply("⏳ *Connessione ad Akinator...*");

        // Configurazione con User-Agent reale per bypassare il 403
        // Aki-api usa internamente axios, proviamo a passare la config italiana
        const aki = new Aki({ 
            region: 'it',
            childMode: false
        });

        // NOTA: Aki-api non permette facilmente di cambiare gli headers.
        // Se ricevi ancora 403, è un ban IP a livello di datacenter.
        await aki.start();
        sessions.set(chatId, aki);

        let startTxt = `🎮 *AKINATOR - SFIDAMI!*\n\n`;
        startTxt += `Pensa a un personaggio reale o immaginario.\n\n`;
        startTxt += `*Domanda 1:*\n${aki.question}\n\n`;
        startTxt += `_Rispondi con i numeri (1-5) o con il testo._`;

        await conn.sendMessage(chatId, { text: startTxt }, { quoted: m });

    } catch (err) {
        console.error("DEBUG AKINATOR:", err);
        if (err.response && err.response.status === 403) {
            m.reply("❌ *ERRORE 403 (Forbidden)*\n\nAkinator ha bloccato l'IP del tuo server. Senza permessi di 'sudo' o un Proxy non è possibile aggirare questo blocco perché il sito riconosce che non sei un utente reale.");
        } else {
            m.reply("❌ Errore di connessione. Riprova tra qualche minuto.");
        }
    }
};

handler.help = ["akinator"];
handler.tags = ["fun"];
handler.command = /^(akinator|aki)$/i;

export default handler;
