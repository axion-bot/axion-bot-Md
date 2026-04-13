import axios from 'axios';
import * as cheerio from 'cheerio';

const baseUrl = 'https://sms24.me';

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

async function fetchData(url) {
    return await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://google.com',
            'Cache-Control': 'no-cache'
        },
        timeout: 15000
    });
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const cmd = command.toLowerCase();
    const arg = args[0];

    if (cmd === 'voip' && !arg) {
        let menu = `*✅ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕𝐎𝐈𝐏: 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄*\n\n`;
        nazioni.forEach(n => menu += `*${n.id}* ➜ ${n.nome}\n`);
        menu += `\n💡 _Usa_ \`${usedPrefix}voip <id>\` _per i numeri._`;
        return m.reply(menu);
    }

    if (cmd === 'voip' && arg && !isNaN(arg)) {
        const naz = nazioni.find(n => n.id === arg);
        if (!naz) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* ID non valido.");

        let { key } = await conn.sendMessage(m.chat, { text: `📡 *✅ 𝐒𝐂𝐀𝐍𝐒𝐈𝐎𝐍𝐄 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎:* ${naz.nome}` });

        try {
            const { data } = await fetchData(`${baseUrl}${naz.path}?t=${Date.now()}`);
            const $ = cheerio.load(data);
            let nums = [];
            
            $('a[href*="/en/numbers/"]').each((i, el) => {
                let val = $(el).text().trim().replace(/[^0-9]/g, '');
                if (val.length > 5) nums.push(val);
            });

            let final = [...new Set(nums)].sort(() => 0.5 - Math.random()).slice(0, 6);
            if (!final.length) return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun numero trovato.", edit: key });

            let res = `*✅ 𝐍𝐔𝐌𝐄𝐑𝐈 ATTIVI: ${naz.nome.toUpperCase()}*\n\n`;
            let buttons = [];

            final.forEach(n => {
                res += `🔹 \`+${n}\`\n`;
                buttons.push({ buttonId: `${usedPrefix}check ${n}`, buttonText: { displayText: `💬 Check +${n}` }, type: 1 });
            });

            buttons.push({ buttonId: `${usedPrefix}voip ${arg}`, buttonText: { displayText: `🔄 𝐂𝐀𝐌𝐁𝐈𝐀 𝐍𝐔𝐌𝐄𝐑𝐈` }, type: 1 });

            return conn.sendMessage(m.chat, { 
                text: res, 
                footer: "Seleziona un numero o cambia lista", 
                buttons, 
                headerType: 1, 
                edit: key 
            }, { quoted: m });

        } catch { 
            return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Connessione fallita. La VPS è bloccata da Cloudflare.", edit: key }); 
        }
    }

    if (cmd === 'check') {
        let num = arg?.replace('+', '');
        if (!num) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Numero mancante.");

        let { key } = await conn.sendMessage(m.chat, { text: `📨 *✅ 𝐋𝐄𝐓𝐓𝐔𝐑𝐀 𝐒𝐌𝐒:* \`+${num}\`` });

        try {
            const { data } = await fetchData(`${baseUrl}/en/numbers/${num}?t=${Date.now()}`);
            const $ = cheerio.load(data);
            let logs = [];

            $('.shadow-sm').each((i, el) => {
                let user = $(el).find('a').first().text().trim() || 'SCONOSCIUTO';
                let txt = $(el).text().split('ago')[1]?.replace('Copy', '').trim();
                if (txt) logs.push({ user, txt });
            });

            if (!logs.length) return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun SMS trovato.", edit: key });

            let res = `*✅ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐈:* \`+${num}\`\n\n`;
            logs.slice(0, 3).forEach(l => res += `👤 *${l.user}*\n💬 ${l.txt}\n\n────────────────\n`);

            const btns = [
                { buttonId: `${usedPrefix}check ${num}`, buttonText: { displayText: `🔄 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀 𝐒𝐌𝐒` }, type: 1 },
                { buttonId: `${usedPrefix}voip`, buttonText: { displayText: `📱 𝐓𝐎𝐑𝐍𝐀 𝐀𝐋 𝐌𝐄𝐍𝐔` }, type: 1 }
            ];

            return conn.sendMessage(m.chat, { 
                text: res, 
                footer: `Update: ${new Date().toLocaleTimeString()}`, 
                buttons: btns, 
                headerType: 1, 
                edit: key 
            }, { quoted: m });

        } catch { 
            return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Impossibile leggere gli SMS.", edit: key }); 
        }
    }
};

handler.command = /^(voip|check)$/i;
export default handler;
