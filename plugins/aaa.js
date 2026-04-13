import axios from 'axios';
import * as cheerio from 'cheerio';

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

const getHeaders = () => {
    const uas = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    ];
    return {
        'User-Agent': uas[Math.floor(Math.random() * uas.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache'
    };
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const cmd = command.toLowerCase();
    const arg = args[0];

    if (cmd === 'voip' && !arg) {
        let menu = `*✅ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕𝐎𝐈𝐏: 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄*\n\n`;
        nazioni.forEach(n => menu += `*${n.id}* ➜ ${n.nome}\n`);
        menu += `\n💡 _Digita_ \`${usedPrefix}voip <id>\` _per i numeri._`;
        return m.reply(menu);
    }

    if (cmd === 'voip' && arg && !isNaN(arg)) {
        const naz = nazioni.find(n => n.id === arg);
        if (!naz) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* ID non valido.");

        let { key } = await conn.sendMessage(m.chat, { text: `📡 *✅ 𝐒𝐂𝐀𝐍𝐒𝐈𝐎𝐍𝐄 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎...*` });

        try {
            const { data } = await axios.get(`https://sms24.me${naz.path}`, { headers: getHeaders(), timeout: 15000 });
            const $ = cheerio.load(data);
            
            if ($('title').text().includes('Cloudflare') || $('title').text().includes('Just a moment')) {
                return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* VPS rilevata. Cloudflare ha bloccato la richiesta automatica.", edit: key });
            }

            let nums = [];
            $('a[href*="/en/numbers/"]').each((i, el) => {
                let n = $(el).text().trim().replace(/[^0-9]/g, '');
                if (n.length > 5) nums.push(n);
            });

            let final = [...new Set(nums)].sort(() => 0.5 - Math.random()).slice(0, 5);
            if (!final.length) return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun numero trovato nella pagina.", edit: key });

            let res = `*✅ 𝐍𝐔𝐌𝐄𝐑𝐈 ATTIVI: ${naz.nome.toUpperCase()}*\n\n`;
            let buttons = [];

            final.forEach(n => {
                res += `🔹 \`+${n}\`\n`;
                buttons.push({ buttonId: `${usedPrefix}check ${n}`, buttonText: { displayText: `💬 Check +${n}` }, type: 1 });
            });

            buttons.push({ buttonId: `${usedPrefix}voip ${arg}`, buttonText: { displayText: `🔄 𝐂𝐀𝐌𝐁𝐈𝐀 𝐍𝐔𝐌𝐄𝐑𝐈` }, type: 1 });

            return conn.sendMessage(m.chat, { text: res, footer: "Tocca un numero per vedere gli SMS", buttons, headerType: 1, edit: key });

        } catch (e) {
            return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Timeout connessione. Il sito non risponde.", edit: key });
        }
    }

    if (cmd === 'check') {
        let num = arg?.replace('+', '');
        if (!num) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Numero mancante.");

        let { key } = await conn.sendMessage(m.chat, { text: `📨 *✅ 𝐋𝐄𝐓𝐓𝐔𝐑𝐀 𝐒𝐌𝐒:* \`+${num}\`` });

        try {
            const { data } = await axios.get(`https://sms24.me/en/numbers/${num}`, { headers: getHeaders(), timeout: 15000 });
            const $ = cheerio.load(data);
            let logs = [];

            $('.shadow-sm').each((i, el) => {
                let user = $(el).find('a').first().text().trim() || 'SCONOSCIUTO';
                let txt = $(el).text().split('ago')[1]?.replace('Copy', '').trim();
                if (txt) logs.push({ user, txt });
            });

            if (!logs.length) return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun messaggio trovato. Riprova tra 10 secondi.", edit: key });

            let res = `*✅ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐈:* \`+${num}\`\n\n`;
            logs.slice(0, 3).forEach(l => res += `👤 *${l.user}*\n💬 ${l.txt}\n\n────────────────\n`);

            const btns = [
                { buttonId: `${usedPrefix}check ${num}`, buttonText: { displayText: `🔄 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀 𝐒𝐌𝐒` }, type: 1 },
                { buttonId: `${usedPrefix}voip`, buttonText: { displayText: `📱 𝐓𝐎𝐑𝐍𝐀 𝐀𝐋 𝐌𝐄𝐍𝐔` }, type: 1 }
            ];

            return conn.sendMessage(m.chat, { text: res, footer: `Aggiornato alle: ${new Date().toLocaleTimeString()}`, buttons: btns, headerType: 1, edit: key });

        } catch (e) {
            return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Errore durante il caricamento degli SMS.", edit: key });
        }
    }
};

handler.command = /^(voip|check)$/i;
export default handler;
