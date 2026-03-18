let handler = async (m, { conn, command, text }) => {
    let width = Math.floor(Math.random() * 31);
    let finalPhrase = width >= 8 
        ? "🔥 Complimenti, siamo su livelli impressionanti!"
        : "😅 Un risultato discreto, c'è sempre margine di miglioramento!";

    let message = `
━━━━━━━━━━━━━━━━
📏 CALCOLATORE DI APERTURA 📏
━━━━━━━━━━━━━━━━
🔍 ${text} ha un'apertura stimata di:  
👉 ${width} cm!  
━━━━━━━━━━━━━━━━
${finalPhrase}
`.trim();

    const messageOptions = {
        contextInfo: {
            forwardingScore: 0,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '0029Vb8MQ3U1CYoMEtU1832d@newsletter',
                serverMessageId: '',
                newsletterName: `${conn.user.name}`
            }
        }
    };

    // Inoltra il messaggio generato senza rispondere al comando
    await conn.sendMessage(m.chat, { text: message, ...messageOptions });
};

handler.command = /^(figa)$/i;

export default handler;