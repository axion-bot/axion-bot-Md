import fs from 'fs';

// Configura qui il tuo numero di telefono (Owner) senza spazi o simboli, seguito da @s.whatsapp.net
const OWNER_NUMBER = '393780560229@s.whatsapp.net'; 
const OWNER_NUMBER = '212784392820@s.whatsapp.net'; 
const OWNER_NUMBER = '639350468907@s.whatsapp.net'; 

const handler = async (m, { conn, text, command, args }) => {
    // Inizializza la blacklist nel database se non esiste
    global.db.data.blacklist = global.db.data.blacklist || [];

    // Controllo di sicurezza: Solo l'owner può usare questo comando
    if (m.sender !== OWNER_NUMBER) {
        return conn.sendMessage(m.chat, { text: '❌ Questo comando è riservato esclusivamente all\'owner del bot.' }, { quoted: m });
    }

    if (command === 'block') {
        if (!text) return conn.sendMessage(m.chat, { text: '⚠️ Uso corretto: *.block 39XXXXXXXXXX*' }, { quoted: m });

        // Pulisce il numero inserito
        let target = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        if (global.db.data.blacklist.includes(target)) {
            return conn.sendMessage(m.chat, { text: 'ℹ️ Questo numero è già presente nella blacklist.' }, { quoted: m });
        }

        // Aggiunge al database (Salvataggio permanente)
        global.db.data.blacklist.push(target);
        await conn.sendMessage(m.chat, { text: `🚫 Numero *${text.trim()}* aggiunto alla blacklist con successo.` }, { quoted: m });

        // --- CONTROLLO RETROATTIVO ---
        // Cerca l'utente in tutti i gruppi in cui si trova il bot e lo kikka immediatamente
        try {
            const chats = Object.keys(global.db.data.chats || {});
            for (let chatId of chats) {
                if (chatId.endsWith('@g.us')) {
                    try {
                        let metadata = await conn.groupMetadata(chatId).catch(() => null);
                        if (!metadata) continue;
                        
                        let isPresent = metadata.participants.some(p => p.id === target);
                        if (isPresent) {
                            await conn.groupParticipantsUpdate(chatId, [target], 'remove');
                            await conn.sendMessage(chatId, { text: `⚡ _Rilevato utente in blacklist. Espulso automaticamente._` });
                        }
                    } catch {
                        // Salta se il bot non è admin nel gruppo
                    }
                }
            }
        } catch (e) {
            console.error('Errore nel controllo retroattivo blacklist:', e);
        }
    }

    if (command === 'unblock') {
        if (!text) return conn.sendMessage(m.chat, { text: '⚠️ Uso corretto: *.unblock 39XXXXXXXXXX*' }, { quoted: m });

        let target = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        if (!global.db.data.blacklist.includes(target)) {
            return conn.sendMessage(m.chat, { text: 'ℹ️ Questo numero non è presente nella blacklist.' }, { quoted: m });
        }

        // Rimuove dal database
        global.db.data.blacklist = global.db.data.blacklist.filter(num => num !== target);
        return conn.sendMessage(m.chat, { text: `✅ Numero *${text.trim()}* rimosso dalla blacklist.` }, { quoted: m });
    }
};

// --- CONTROLLO AUTOMATICO INGRESSI ---
// Questa funzione viene triggerata dal tuo 'handler.js' quando qualcuno entra in un gruppo
handler.participantsUpdate = async (update, { conn }) => {
    const { id, participants, action } = update;
    
    // Controlliamo solo se l'azione è un ingresso ('add')
    if (action === 'add') {
        global.db.data.blacklist = global.db.data.blacklist || [];
        
        for (let participant of participants) {
            if (global.db.data.blacklist.includes(participant)) {
                try {
                    // Kikka l'utente immediatamente
                    await conn.groupParticipantsUpdate(id, [participant], 'remove');
                    // Invia un avviso nel gruppo
                    await conn.sendMessage(id, { text: `🚨 *Sicurezza Axion:* Un utente presente nella blacklist globale ha provato ad accedere ed è stato espulso.` });
                } catch (error) {
                    console.error(`Impossibile kikkare l'utente ${participant} dal gruppo ${id}. Il bot è admin?`);
                }
            }
        }
    }
};

// Configurazione dei comandi per il caricamento del bot
handler.command = ['block', 'unblock'];
handler.tags = ['owner'];
handler.help = ['block', 'unblock'];

export default handler;
