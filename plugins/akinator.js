process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { Aki } from 'aki-api';

const sessions = new Map();

let handler = async (m, { conn, usedPrefix, command }) => {
    const chatId = m.chat;

    // --- GESTIONE RISPOSTE ---
    if (sessions.has(chatId)) {
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
                let txt = `✨ *HO INDOVINATO!*\n\n👤 *Nome:* ${guess.name}\n📝 *Descrizione:* ${guess.description}\n📊 *Precisione:* ${Math.floor(session.progress)}%`;

                await conn.sendMessage(chatId, {
                    image: { url: guess.absolute_picture_path },
                    caption: txt
                }, { quoted: m });
                sessions.delete(chatId);
            } else {
                let questionTxt = `🎮 *AKINATOR* - Domanda ${session.currentStep + 1}\n\n*${session.question}*\n\n1. Sì\n2. No\n3. Non lo so\n4. Probabilmente\n5. Probabilmente no`;
                await conn.sendMessage(chatId, { text: questionTxt }, { quoted: m });
            }
        } catch (e) {
            sessions.delete(chatId);
            m.reply("❌ Akinator mi ha bloccato o la sessione è scaduta.");
        }
        return;
    }

    // --- AVVIO PARTITA CON HEADERS PERSONALIZZATI ---
    try {
        m.reply("⏳ *Akinator sta verificando l'identità...*");

        // Simuliamo un browser reale per evitare l'errore 403
        const config = {
            region: 'it',
            childMode: false,
            proxy: undefined // Se hai un proxy puoi metterlo qui
        };

        const aki = new Aki(config);
        
        // Sovrascriviamo l'header dello User-Agent globalmente per Axios se possibile, 
        // ma aki-api purtroppo non lo espone facilmente. 
        // Se continua a darti 403, Akinator ha bannato l'IP del tuo server.
        
        await aki.start();
        sessions.set(chatId, aki);

        let startTxt = `🎮 *AKINATOR - INIZIAMO!*\n\n*Domanda 1:*\n${aki.question}\n\n_Rispondi con i numeri (1-5)_`;
        await conn.sendMessage(chatId, { text: startTxt }, { quoted: m });

    } catch (err) {
        console.error("ERRORE DETTAGLIATO:", err);
        if (err.response && err.response.status === 403) {
            m.reply("❌ *Errore 403:* Akinator ha bloccato l'indirizzo IP del tuo server. Prova a riavviare il bot o usa una VPN/Proxy se possibile.");
        } else {
            m.reply("❌ Errore durante l'avvio. Riprova più tardi.");
        }
    }
};

handler.help = ["akinator"];
handler.tags = ["fun"];
handler.command = /^(akinator|aki)$/i;

export default handler;
