import axios from 'axios';
import as cheerio from 'cheerio';

const baseUrl = 'https://sms24.me';

const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Referer': 'https://sms24.me/',
    'Cache-Control': 'no-cache'
});

const nazioni = [
    { id: '1', nome: 'Stati Uniti 🇺🇸', path: '/en/countries/us' },
    { id: '2', nome: 'Regno Unito 🇬🇧', path: '/en/countries/gb' },
    { id: '3', nome: 'Francia 🇫🇷', path: '/en/countries/fr' },
    { id: '4', nome: 'Svezia 🇸🇪', path: '/en/countries/se' },
    { id: '5', nome: 'Germania 🇩🇪', path: '/en/countries/de' },
    { id: '6', nome: 'Italia 🇮🇹', path: '/en/countries/it' },
    { id: '7', nome: 'Olanda 🇳🇱', path: '/en/countries/nl' },
    { id: '8', nome: 'Spagna 🇪🇸', path: '/en/countries/es' }
];

async function fetchMessaggi(numeroTelefono) {
    try {
        const { data } = await axios.get(`${baseUrl}/en/numbers/${numeroTelefono}?t=${Date.now()}`, { headers: getHeaders(), timeout: 10000 });
        const $ = cheerio.load(data);
        let messaggi = [];
        $('.shadow-sm, .list-group-item').each((i, el) => {
            let mittente = $(el).find('a').first().text().trim() || 'SCONOSCIUTO';
            let testo = $(el).text().replace(/\s+/g, ' ').replace(mittente, '').replace('Copy', '').trim();
            if (testo.length > 2) messaggi.push({ mittente, testo });
        });
        return messaggi;
    } catch { return null; }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const cmd = command.toLowerCase();
    const arg = args[0];

    if (cmd === 'voip' && !arg) {
        let msg = `*✅ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕𝐎𝐈𝐏: 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄*\n\n`;
        for (let i = 0; i < nazioni.length; i++) {
            msg += `*${nazioni[i].id}* ➜ ${nazioni[i].nome}\n`;
        }
        msg += `\n💡 _Digita_ \`${usedPrefix}voip <id>\` _per estrarre i numeri._`;
        return m.reply(msg);
    }

    if (cmd === 'voip' && arg && !isNaN(arg)) {
        const naz = nazioni.find(n => n.id === arg);
        if (!naz) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* ID nazione non trovato.");

        let { key } = await conn.sendMessage(m.chat, { text: `📡 *✅ 𝐒𝐂𝐀𝐍𝐒𝐈𝐎𝐍𝐄 𝐋𝐈𝐕𝐄:* ${naz.nome}` });

        try {
            const { data } = await axios.get(`${baseUrl}${naz.path}?t=${Date.now()}`, { headers: getHeaders() });
            const $ = cheerio.load(data);
            let list = [];
            $('a').each((i, el) => {
                let t = $(el).text().trim();
                if (t.includes('+')) list.push(t.replace(/[^0-9]/g, ''));
            });

            let finalNumbers = [...new Set(list)].sort(() => 0.5 - Math.random()).slice(0, 6);
            if (finalNumbers.length === 0) return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun numero attivo.", edit: key });

            let res = `*✅ 𝐍𝐔𝐌𝐄𝐑𝐈 ATTIVI: ${naz.nome.toUpperCase()}*\n\n`;
            let buttons = [];

            finalNumbers.forEach(n => {
                res += `🔹 \`${usedPrefix}check ${n}\`\n`;
                buttons.push({ buttonId: `${usedPrefix}check ${n}`, buttonText: { displayText: `💬 Check +${n}` }, type: 1 });
            });

            buttons.push({ buttonId: `${usedPrefix}voip ${arg}`, buttonText: { displayText: `🔄 𝐂𝐀𝐌𝐁𝐈𝐀 𝐍𝐔𝐌𝐄𝐑𝐈` }, type: 1 });

            return conn.sendMessage(m.chat, { text: res, footer: "Seleziona un numero o cambia lista", buttons, headerType: 1, edit: key });
        } catch { return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Connessione fallita.", edit: key }); }
    }

    if (cmd === 'check') {
        let num = arg?.replace('+', '');
        if (!num) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Inserisci un numero.");

        let { key } = await conn.sendMessage(m.chat, { text: `📨 *✅ 𝐋𝐄𝐓𝐓𝐔𝐑𝐀 𝐒𝐌𝐒:* \`+${num}\`` });
        let msgs = await fetchMessaggi(num);

        if (!msgs || msgs.length === 0) return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun SMS trovato.", edit: key });

        let res = `*✅ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐈:* \`+${num}\`\n\n`;
        msgs.slice(0, 3).forEach(s => {
            res += `👤 *${s.mittente}*\n💬 ${s.testo}\n\n────────────────\n`;
        });

        const buttons = [
            { buttonId: `${usedPrefix}check ${num}`, buttonText: { displayText: `🔄 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀 𝐒𝐌𝐒` }, type: 1 },
            { buttonId: `${usedPrefix}voip`, buttonText: { displayText: `📱 𝐓𝐎𝐑𝐍𝐀 𝐀𝐋 𝐌𝐄𝐍𝐔` }, type: 1 }
        ];

        return conn.sendMessage(m.chat, { text: res, footer: `Update: ${new Date().toLocaleTimeString()}`, buttons, headerType: 1, edit: key });
    }
};

handler.command = /^(voip|check)$/i;
export default handler;
