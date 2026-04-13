import axios from 'axios';
import * as cheerio from 'cheerio';

const baseUrl = 'https://sms24.me';
const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Cache-Control': 'no-cache'
});

const nazioni = { 
    'it': { nome: '🇮🇹 𝐈𝐭𝐚', path: '/en/countries/it' }, 
    'us': { nome: '🇺🇸 𝐔𝐬𝐚', path: '/en/countries/us' }, 
    'gb': { nome: '🇬🇧 𝐔𝐤', path: '/en/countries/gb' }, 
    'fr': { nome: '🇫🇷 𝐅𝐫𝐚', path: '/en/countries/fr' }, 
    'de': { nome: '🇩🇪 𝐆𝐞𝐫', path: '/en/countries/de' } 
};

async function fetchMessaggi(num) {
    try {
        const { data } = await axios.get(`${baseUrl}/en/numbers/${num}?t=${Date.now()}`, { headers: getHeaders(), timeout: 10000 });
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

    if (cmd === 'voip') {
        const code = args[0]?.toLowerCase();
        
        if (!code || !nazioni[code]) {
            let txt = `*✅ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕𝐎𝐈𝐏*\n\n`;
            for (let id in nazioni) txt += `• \`${usedPrefix}voip ${id}\` ➜ ${nazioni[id].nome}\n`;
            return m.reply(txt);
        }

        let { key } = await conn.sendMessage(m.chat, { text: `📡 *𝐒𝐂𝐀𝐍𝐒𝐈𝐎𝐍𝐄 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎...*` });

        try {
            const { data } = await axios.get(`${baseUrl}${nazioni[code].path}?t=${Date.now()}`, { headers: getHeaders() });
            const $ = cheerio.load(data);
            let nums = [];
            $('a').each((i, el) => {
                let t = $(el).text().trim();
                if (t.includes('+')) nums.push(t.replace(/[^0-9]/g, ''));
            });

            let finalNums = [...new Set(nums)].sort(() => 0.5 - Math.random()).slice(0, 6);
            let res = `*✅ 𝐍𝐔𝐌𝐄𝐑𝐈 ${code.toUpperCase()}*\n\n`;
            let buttons = [];

            finalNums.forEach(n => {
                res += `🔹 \`${usedPrefix}check ${n}\`\n`;
                buttons.push({ buttonId: `${usedPrefix}check ${n}`, buttonText: { displayText: `💬 Check +${n}` }, type: 1 });
            });

            buttons.push({ buttonId: `${usedPrefix}voip ${code}`, buttonText: { displayText: `🔄 𝐂𝐀𝐌𝐁𝐈𝐀 𝐍𝐔𝐌𝐄𝐑𝐈` }, type: 1 });

            return conn.sendMessage(m.chat, { text: res, footer: "Seleziona un numero", buttons, headerType: 1, edit: key });
        } catch { return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Connessione fallita.", edit: key }); }
    }

    if (cmd === 'check') {
        let num = args[0]?.replace('+', '');
        if (!num) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Numero mancante.");

        let { key } = await conn.sendMessage(m.chat, { text: `📨 *𝐋𝐄𝐓𝐓𝐔𝐑𝐀 𝐒𝐌𝐒...* \`+${num}\`` });
        let msgs = await fetchMessaggi(num);

        if (!msgs || msgs.length === 0) return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun messaggio trovato.", edit: key });

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
