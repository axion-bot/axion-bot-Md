let handler = async (m, { conn }) => {
    // 1. Funzione interna per la data (così non serve getTodayKey esterna)
    const getToday = () => {
        const d = new Date();
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    };

    const today = getToday();
    
    // 2. Controllo di sicurezza database
    if (!global.db.data.toptimeDaily) global.db.data.toptimeDaily = { days: {} };
    if (!global.db.data.toptimeDaily.days[today]) global.db.data.toptimeDaily.days[today] = { chats: {} };
    if (!global.db.data.toptimeDaily.days[today].chats[m.chat]) global.db.data.toptimeDaily.days[today].chats[m.chat] = {};
    
    const chatData = global.db.data.toptimeDaily.days[today].chats[m.chat];
    const user = chatData[m.sender] || { time: 0 };

    // 3. Calcolo
    const timeMs = user.time || 0;
    const h = Math.floor(timeMs / 3600000);
    const m_ = Math.floor((timeMs % 3600000) / 60000);
    const s = Math.floor((timeMs % 60000) / 1000);

    let caption = `🕒 *Tempo Online Oggi*\n👤 @${m.sender.split('@')[0]}\n⏱️ *${h}h ${m_}m ${s}s*`;

    await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m });
}

handler.command = /^(tempo)$/i;
export default handler;
