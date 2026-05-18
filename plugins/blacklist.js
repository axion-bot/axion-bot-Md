// Configura qui il tuo numero di telefono (Owner) senza spazi o simboli, seguito da @s.whatsapp.net
const OWNER_NUMBER = '393780560229@s.whatsapp.net'; 

const handler = async (m, { conn, text, command }) => {
    // Inizializza la blacklist nel database se non esiste
    global.db.data.blacklist = global.db.data.blacklist || [];

    // Controllo di sicurezza: Solo l'owner
    if (m.sender !== OWNER_NUMBER) {
        return conn.sendMessage(m.chat, { text: '❌ Questo comando è riservato esclusivamente all\'owner del bot.' }, { quoted: m });
    }

    if (command === 'block') {
        if (!text) return conn.sendMessage(m.chat, { text: '⚠️ Uso corretto: *.block 39XXXXXXXXXX*' }, { quoted: m });

        // Estrae solo i numeri puliti (rimuove +, spazi, trattini)
        let cleanedNumber = text.replace(/\D/g, '');
        let target = cleanedNumber + '@s.whatsapp.net';

        if (global.db.data.blacklist.includes(target)) {
            return conn.sendMessage(m.chat, { text: 'ℹ️ Questo numero è già presente nella blacklist.' }, { quoted: m });
        }

        // Aggiunge al database permanente
        global.db.data.blacklist.push(target);
        await conn.sendMessage(m.chat, { text: `🚫 Numero *${cleanedNumber}* aggiunto alla blacklist con successo.` }, { quoted: m });

        // --- NUOVO CONTROLLO RETROATTIVO POTENZIATO ---
        await conn.sendMessage(m.chat, { text: `⏳ Scansione dei gruppi in corso per rimuovere l'utente...` }, { quoted: m });
        
        let kickCount = 0;
        try {
            // Recupera tutte le chat presenti nella memoria del bot
            const chats = Object.keys(conn.chats || {}) || [];
            
            for (let chatId of chats) {
                if (chatId.endsWith('@g.us')) {
                    try {
                        // Ottiene i dati aggiornati del gruppo direttamente da WhatsApp
                        let metadata = await conn.groupMetadata(chatId).catch(() => null);
                        if (!metadata) continue;
                        
                        // Controlla se l'utente bannato è un partecipante
                        let isPresent = metadata.participants.some(p => p.id === target);
                        
                        // Controlla se il bot è admin (altrimenti non può kikkare)
                        let botIsAdmin = metadata.participants.some(p => p.id === conn.decodeJid(conn.user.id) && (p.admin === 'admin' || p.admin === 'superadmin'));

                        if (isPresent && botIsAdmin) {
                            await conn.groupParticipantsUpdate(chatId, [target], 'remove');
                            await conn.sendMessage(chatId, { text: `⚡ *Axion Security:* Rilevato utente in blacklist globale. Espulso automaticamente.` });
                            kickCount++;
                        }
                    } catch (err) {
                        // Salta silenziosamente se c'è un errore su un singolo gruppo
                    }
                }
            }
            await conn.sendMessage(m.chat, { text: `✅ Scansione completata. Utente kikkato da *${kickCount}* gruppi.` }, { quoted: m });
        } catch (e) {
            console.error('Errore nel controllo retroattivo blacklist:', e);
        }
    }

    if (command === 'unblock') {
        if (!text) return conn.sendMessage(m.chat, { text: '⚠️ Uso corretto: *.unblock 39XXXXXXXXXX*' }, { quoted: m });

        let cleanedNumber = text.replace(/\D/g, '');
        let target = cleanedNumber + '@s.whatsapp.net';

        if (!global.db.data.blacklist.includes(target)) {
            return conn.sendMessage(m.chat, { text: 'ℹ️ Questo numero non è presente nella blacklist.' }, { quoted: m });
        }

        global.db.data.blacklist = global.db.data.blacklist.filter(num => num !== target);
        return conn.sendMessage(m.chat, { text: `✅ Numero *${cleanedNumber}* rimosso dalla blacklist.` }, { quoted: m });
    }
};

// --- CONTROLLO AUTOMATICO NUOVI INGRESSI ---
// Nota: Se l'handler del tuo bot usa un file separato per i partecipanti (es. groupUpdate),
// questa funzione viene comunque registrata globalmente.
handler.participantsUpdate = async (update, { conn }) => {
    const { id, participants, action } = update;
    if (action === 'add') {
        global.db.data.blacklist = global.db.data.blacklist || [];
        for (let participant of participants) {
            if (global.db.data.blacklist.includes(participant)) {
                try {
                    await conn.groupParticipantsUpdate(id, [participant], 'remove');
                    await conn.sendMessage(id, { text: `🚨 *Sicurezza Axion:* Un utente presente nella blacklist globale ha provato ad accedere ed è stato espulso.` });
                } catch (error) {
                    console.error(`Impossibile kikkare l'utente dal gruppo ${id}:`, error);
                }
            }
        }
    }
};

handler.command = ['block', 'unblock'];
handler.tags = ['owner'];
handler.help = ['block', 'unblock'];

export default handler;
