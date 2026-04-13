import axios from 'axios';
import * as cheerio from 'cheerio';

const config = { 
    url: 'https://sms24.me', 
    headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Referer': 'https://sms24.me/'
    },
    timeout: 10000
};

const nazioni = { 'it': '🇮🇹 𝐈𝐭𝐚', 'us': '🇺🇸 𝐔𝐬𝐚', 'gb': '🇬🇧 𝐔𝐤', 'fr': '🇫🇷 𝐅𝐫𝐚', 'de': '🇩🇪 𝐆𝐞𝐫' };

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const cmd = command.toLowerCase();

    if (cmd === 'voip') {
        const code = args[0]?.toLowerCase();
        
        if (!code || !nazioni[code]) {
            let txt = `*✅ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕𝐎𝐈𝐏*\n\n`;
            for (let id in nazioni) txt += `• \`${usedPrefix}voip ${id}\` ➜ ${nazioni[id]}\n`;
            return m.reply(txt);
        }

        try {
            const { data } = await axios.get(`${config.url}/en/countries/${code}`, { headers: config.headers, timeout: config.timeout });
            const $ = cheerio.load(data);
            let nums = [];
            $('a[href*="/en/numbers/"]').each((i, e) => {
                let n = $(e).text().replace(/[^0-9+]/g, '');
                if (n.startsWith('+')) nums.push(n);
            });

            if (nums.length === 0) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun numero trovato.");

            let randomNums = [...new Set(nums)].sort(() => Math.random() - 0.5).slice(0, 6);
            let res = `*✅ 𝐍𝐔𝐌𝐄𝐑𝐈 ${code.toUpperCase()}*\n\n`;
            
            let buttons = [];
            randomNums.forEach(n => {
                let clean = n.replace('+', '');
                res += `🔹 \`${usedPrefix}check ${clean}\`\n`;
                buttons.push({ buttonId: `${usedPrefix}check ${clean}`, buttonText: { displayText: `💬 Check ${n}` }, type: 1 });
            });

            buttons.push({ buttonId: `${usedPrefix}voip ${code}`, buttonText: { displayText: `🔄 𝐂𝐀𝐌𝐁𝐈𝐀 𝐍𝐔𝐌𝐄𝐑𝐈` }, type: 1 });

            return conn.sendMessage(m.chat, {
                text: res,
                footer: "Seleziona un numero o cambia lista",
                buttons: buttons,
                headerType: 1
            }, { quoted: m });
        } catch (e) { 
            return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Impossibile connettersi al servizio."); 
        }
    }

    if (cmd === 'check') {
        let num = args[0]?.replace('+', '');
        if (!num) return m.reply("*✅ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:* Inserisci un numero.");
        
        try {
            const { data } = await axios.get(`${config.url}/en/numbers/${num}`, { headers: config.headers, timeout: config.timeout });
            const $ = cheerio.load(data);
            let txt = `*✅ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐈:* \`+${num}\`\n\n`;
            
            let found = false;
            $('.shadow-sm').slice(0, 3).each((i, e) => {
                found = true;
                let f = $(e).find('a').first().text().trim();
                let msg = $(e).text().split('ago')[1]?.replace('Copy', '').trim();
                if (f) txt += `👤 *${f}*\n💬 ${msg}\n\n`;
            });

            if (!found) txt += "📭 Nessun messaggio ricevuto.";

            const checkBtn = [
                { buttonId: `${usedPrefix}check ${num}`, buttonText: { displayText: `🔄 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀 𝐒𝐌𝐒` }, type: 1 },
                { buttonId: `${usedPrefix}voip`, buttonText: { displayText: `📱 𝐓𝐎𝐑𝐍𝐀 𝐀𝐈 𝐏𝐀𝐄𝐒𝐈` }, type: 1 }
            ];

            return conn.sendMessage(m.chat, {
                text: txt,
                footer: `Update: ${new Date().toLocaleTimeString()}`,
                buttons: checkBtn,
                headerType: 1
            }, { quoted: m });
        } catch (e) { 
            return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Numero non valido o timeout."); 
        }
    }
};

handler.command = /^(voip|check)$/i;
export default handler;
