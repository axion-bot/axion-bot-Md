const playAgainButtons = (prefix) => [
    {
        buttonId: `${prefix}cibo`,
        buttonText: { displayText: '🍽️ Gioca Ancora!' },
        type: 1
    }
];

let handler = async (m, { conn, usedPrefix, isAdmin }) => {

    let frasi = [
        `🍽️ *INDOVINA IL CIBO!*`,
        `😋 *Sai che piatto è questo?*`,
        `👨‍🍳 *Riconosci questa specialità?*`,
        `🍴 *Sfida culinaria!*`,
        `🔥 *Che cibo è questo?*`,
        `🌍 *Indovina il nome del piatto!*`,
    ];

    if (m.text?.toLowerCase() === '.skipcibo') {
        if (!m.isGroup) return m.reply('『 ⚠️ 』- Questo comando funziona solo nei gruppi!');
        if (!global.ciboGame?.[m.chat]) return m.reply('『 ⚠️ 』- Nessuna partita attiva!');
        if (!isAdmin && !m.fromMe) return m.reply('『 ❌ 』 - Solo gli admin possono interrompere!');

        clearTimeout(global.ciboGame[m.chat].timeout);
        await conn.sendMessage(m.chat, {
            text: `『 🛑 』 - Gioco interrotto\n✨ _La risposta era:_ *${global.ciboGame[m.chat].rispostaOriginale}*`,
            buttons: playAgainButtons(usedPrefix),
            headerType: 1
        }, { quoted: m });

        delete global.ciboGame[m.chat];
        return;
    }

    if (global.ciboGame?.[m.chat])
        return m.reply('『 ⚠️ 』 - C\'è già una partita attiva!');

    const cooldownKey = `cibo_${m.chat}`;
    const now = Date.now();
    const lastGame = global.cooldowns?.[cooldownKey] || 0;
    const cooldownTime = 10000;

    if (now - lastGame < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
        return m.reply(`⏳ Aspetta ${remaining} secondi!`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    let cibi = [
        { nome: 'Pizza', url: 'https://images.unsplash.com/photo-1601924582975-7e7eaa20f9c4' },
        { nome: 'Sushi', url: 'https://images.unsplash.com/photo-1553621042-f6e147245754' },
        { nome: 'Hamburger', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349' },
        { nome: 'Carbonara', url: 'https://images.unsplash.com/photo-1589307004391-1c6b6f77c9d1' },
        { nome: 'Lasagna', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b' },
        { nome: 'Tiramisù', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9' },
        { nome: 'Paella', url: 'https://images.unsplash.com/photo-1604908176997-4318a4f4b0c8' },
        { nome: 'Ramen', url: 'https://images.unsplash.com/photo-1604908554025-15b0c37f3c5e' },
        { nome: 'Hot Dog', url: 'https://images.unsplash.com/photo-1550547660-8d7f5f1c36c5' },
        { nome: 'Gelato', url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625' },
    ];

    let scelta = cibi[Math.floor(Math.random() * cibi.length)];
    let frase = frasi[Math.floor(Math.random() * frasi.length)];

    try {
        let msg = await conn.sendMessage(m.chat, {
            image: { url: scelta.url },
            caption: `${frase}

🍽️ *Rispondi con il nome del cibo!*
⏱️ *Tempo disponibile:* 30 secondi

> 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓`,
            quoted: m
        });

        global.ciboGame = global.ciboGame || {};
        global.ciboGame[m.chat] = {
            id: msg.key.id,
            risposta: scelta.nome.toLowerCase(),
            rispostaOriginale: scelta.nome,
            tentativi: {},
            suggerito: false,
            startTime: Date.now(),
            timeout: setTimeout(async () => {
                if (global.ciboGame?.[m.chat]) {
                    await conn.sendMessage(m.chat, {
                        text: `⏳ Tempo scaduto!\n\n🍽️ Era: *${scelta.nome}*`,
                        buttons: playAgainButtons(usedPrefix),
                        headerType: 1
                    }, { quoted: msg });

                    delete global.ciboGame[m.chat];
                }
            }, 30000)
        };

    } catch (err) {
        console.error(err);
        m.reply('❌ Errore nell\'avvio del gioco');
    }
};

function normalizeString(str) {
    return str?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

handler.before = async (m, { conn, usedPrefix }) => {
    const game = global.ciboGame?.[m.chat];
    if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return;

    const userAnswer = normalizeString(m.text || '');
    const correctAnswer = normalizeString(game.risposta);

    if (!userAnswer) return;

    if (userAnswer === correctAnswer) {
        clearTimeout(game.timeout);

        let reward = Math.floor(Math.random() * 31) + 20;
        let exp = 500;

        if (!global.db.data.users[m.sender])
            global.db.data.users[m.sender] = {};

        global.db.data.users[m.sender].euro =
            (global.db.data.users[m.sender].euro || 0) + reward;

        global.db.data.users[m.sender].exp =
            (global.db.data.users[m.sender].exp || 0) + exp;

        await conn.sendMessage(m.chat, {
            text: `🎉 *RISPOSTA CORRETTA!*\n\n🍽️ Era: *${game.rispostaOriginale}*\n\n🎁 +${reward} 💰\n🆙 +${exp} EXP`,
            buttons: playAgainButtons(usedPrefix),
            headerType: 1
        }, { quoted: m });

        delete global.ciboGame[m.chat];
    } else {
        game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1;
        let rimasti = 3 - game.tentativi[m.sender];

        if (rimasti <= 0) {
            await conn.sendMessage(m.chat, {
                text: `❌ Tentativi finiti!\n\nEra: *${game.rispostaOriginale}*`,
                buttons: playAgainButtons(usedPrefix),
                headerType: 1
            }, { quoted: m });

            delete global.ciboGame[m.chat];
        } else {
            await conn.reply(m.chat, `❌ Sbagliato!\nTentativi rimasti: ${rimasti}`, m);
        }
    }
};

handler.help = ['cibo'];
handler.tags = ['giochi'];
handler.command = /^(cibo|skipcibo)$/i;
handler.group = true;

export default handler;