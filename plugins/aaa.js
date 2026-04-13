Let isScraperReady = false;
let axios, cheerio;

try {
    axios = (await import('axios')).default;
    cheerio = await import('cheerio');
    isScraperReady = true;
} catch (e) {
    console.log("ERRORE VOIP: Librerie mancanti.");
}

const baseUrl = 'https://sms24.me';

const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const nazioni = [
    { id: '1', nome: 'Stati Uniti 🇺🇸', path: '/en/countries/us' },
    { id: '2', nome: 'Regno Unito 🇬🇧', path: '/en/countries/gb' },
    { id: '3', nome: 'Francia 🇫🇷', path: '/en/countries/fr' },
    { id: '4', nome: 'Svezia 🇸🇪', path: '/en/countries/se' },
    { id: '5', nome: 'Germania 🇩🇪', path: '/en/countries/de' },
    { id: '6', nome: 'Italia 🇮🇹', path: '/en/countries/it' },
    { id: '7', nome: 'Olanda 🇳🇱', path: '/en/countries/nl' },
    { id: '8', nome: 'Spagna 🇪🇸', path: '/en/countries/es' },
    { id: '9', nome: 'Canada 🇨🇦', path: '/en/countries/ca' },
    { id: '10', nome: 'Belgio 🇧🇪', path: '/en/countries/be' },
    { id: '11', nome: 'Austria 🇦🇹', path: '/en/countries/at' },
    { id: '12', nome: 'Danimarca 🇩🇰', path: '/en/countries/dk' },
    { id: '13', nome: 'Polonia 🇵🇱', path: '/en/countries/pl' },
    { id: '14', nome: 'Portogallo 🇵🇹', path: '/en/countries/pt' },
    { id: '15', nome: 'Russia 🇷🇺', path: '/en/countries/ru' },
    { id: '16', nome: 'Estonia 🇪🇪', path: '/en/countries/ee' },
    { id: '17', nome: 'Lettonia 🇱🇻', path: '/en/countries/lv' },
    { id: '18', nome: 'Lituania 🇱🇹', path: '/en/countries/lt' },
    { id: '19', nome: 'Rep. Ceca 🇨🇿', path: '/en/countries/cz' },
    { id: '20', nome: 'Romania 🇷🇴', path: '/en/countries/ro' },
    { id: '21', nome: 'Croazia 🇭🇷', path: '/en/countries/hr' },
    { id: '22', nome: 'Hong Kong 🇭🇰', path: '/en/countries/hk' },
    { id: '23', nome: 'Cina 🇨🇳', path: '/en/countries/cn' },
    { id: '24', nome: 'Malesia 🇲🇾', path: '/en/countries/my' },
    { id: '25', nome: 'Indonesia 🇮🇩', path: '/en/countries/id' },
    { id: '26', nome: 'Filippine 🇵🇭', path: '/en/countries/ph' },
    { id: '27', nome: 'Thailandia 🇹🇭', path: '/en/countries/th' },
    { id: '28', nome: 'Vietnam 🇻🇳', path: '/en/countries/vn' },
    { id: '29', nome: 'Sudafrica 🇿🇦', path: '/en/countries/za' },
    { id: '30', nome: 'Brasile 🇧🇷', path: '/en/countries/br' },
    { id: '31', nome: 'Messico 🇲🇽', path: '/en/countries/mx' },
    { id: '32', nome: 'India 🇮🇳', path: '/en/countries/in' },
    { id: '33', nome: 'Ucraina 🇺🇦', path: '/en/countries/ua' },
    { id: '34', nome: 'Svizzera 🇨🇭', path: '/en/countries/ch' },
    { id: '35', nome: 'Irlanda 🇮🇪', path: '/en/countries/ie' },
    { id: '36', nome: 'Norvegia 🇳🇴', path: '/en/countries/no' },
    { id: '37', nome: 'Australia 🇦🇺', path: '/en/countries/au' },
    { id: '38', nome: 'Israele 🇮🇱', path: '/en/countries/il' },
    { id: '39', nome: 'Kazakistan 🇰🇿', path: '/en/countries/kz' },
    { id: '40', nome: 'Finlandia 🇫🇮', path: '/en/countries/fi' }
];

async function fetchMessaggi(numeroTelefono) {
    try {
        const numUrl = `${baseUrl}/en/numbers/${numeroTelefono}?t=${Date.now()}`;
        const { data } = await axios.get(numUrl, { headers: getHeaders(), timeout: 10000 });
        const $ = cheerio.load(data);
        let messaggi = [];
        $('.shadow-sm, .list-group-item, .callout').each((i, el) => {
            let mittente = $(el).find('a').first().text().trim() || 'SCONOSCIUTO';
            let tempo = $(el).find('.text-info, .text-muted, small').first().text().trim() || 'ADESS0';
            let testo = $(el).text().replace(/\s+/g, ' ').replace(mittente, '').replace(tempo, '').trim();
            testo = testo.replace(/From:\s*[^\s]+/i, '').replace('Copy', '').trim();
            if (testo.length > 2 && !messaggi.some(m => m.testo === testo)) {
                messaggi.push({ mittente, tempo, testo });
            }
        });
        return messaggi;
    } catch (e) { return null; }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!isScraperReady) return m.reply("❌ *ERRORE:* Librerie mancanti.");
    const cmd = command.toLowerCase();
    const arg = args[0] ? args[0].toLowerCase() : null;

    // --- MENU PRINCIPALE ---
    if (cmd === 'menuvoip') {
        let menu = `┏━━━ « 📱 *VOIP PANEL* » ━━━┓\n┃\n`;
        menu += `┃ 🌍 *${usedPrefix}voip*\n┃ _Database 40 Nazioni_\n┃\n`;
        menu += `┃ 🔍 *${usedPrefix}voip <id>*\n┃ _Numeri filtrati per Paese_\n┃\n`;
        menu += `┃ 🔥 *${usedPrefix}lastvoips*\n┃ _Top 20 Numeri in tempo reale_\n┃\n`;
        menu += `┃ 📡 *${usedPrefix}regvoip <numero>*\n┃ _Radar Intercettazione Code_\n┃\n`;
        menu += `┃ 📩 *${usedPrefix}voip sms <numero>*\n┃ _Lettura manuale messaggi_\n┃\n`;
        menu += `┗━━━━━━━━━━━━━━━━━━━━━━┛`;
        return m.reply(menu);
    }

    // --- LASTVOIPS: PRENDE TUTTO QUELLO CHE C'E' DI NUOVO ---
    if (cmd === 'lastvoips') {
        let { key } = await conn.sendMessage(m.chat, { text: `📡 *SINCRONIZZAZIONE NUMERI RECENTI...*` });
        try {
            // Timestamp per forzare il refresh ed eliminare i vecchi dalla cache del provider
            const { data } = await axios.get(`${baseUrl}/en?t=${Date.now()}`, { headers: getHeaders() });
            const $ = cheerio.load(data);
            let nms = [];

            $('a').each((i, el) => {
                let t = $(el).text().trim();
                let n = t.replace(/[^0-9]/g, '');
                if (t.includes('+') && n.length >= 8 && !nms.some(x => x.n === n)) {
                    nms.push({ n, t });
                }
            });

            if (nms.length === 0) return m.reply("❌ Al momento non ci sono numeri nuovi disponibili.");

            let res = `🔥 *NUMERI RECENTI (LIVE)* 🔥\n\n`;
            // Mostra fino a 20 numeri (più possibile)
            nms.slice(0, 20).forEach((item, index) => {
                res += `*${index + 1}.* 📲 \`+${item.n}\`\n`;
            });
            res += `\n⚠️ _I numeri vecchi vengono rimossi automaticamente ad ogni scansione._`;
            return conn.sendMessage(m.chat, { text: res, edit: key });
        } catch { return m.reply("❌ Errore critico nel recupero dati."); }
    }

    // --- RADAR REGVOIP ---
    if (cmd === 'regvoip') {
        const num = args[0]?.replace('+', '').replace(/\s+/g, '');
        if (!num) return m.reply(`💡 *Uso:* ${usedPrefix}regvoip 447418312672`);

        let { key } = await conn.sendMessage(m.chat, { text: `🚀 *TARGET:* \`+${num}\`\n*STATO:* Inizializzazione Radar...` });
        let oldMsgs = await fetchMessaggi(num);
        let lastOld = oldMsgs && oldMsgs.length > 0 ? oldMsgs[0].testo : "NONE";

        await conn.sendMessage(m.chat, { text: `✅ *RADAR ATTIVO*\n\nIn attesa di nuovi SMS per \`+${num}\`...\nTempo rimasto: 3 minuti.`, edit: key });

        for (let i = 0; i < 18; i++) { // 18 cicli da 10 secondi = 3 minuti
            await sleep(10000);
            let current = await fetchMessaggi(num);
            if (current && current.length > 0 && current[0].testo !== lastOld) {
                let s = current[0];
                let alert = `🔔 *SMS INTERCETTATO!* 🔔\n\n`;
                alert += `📱 *TARGET:* \`+${num}\`\n`;
                alert += `👤 *DA:* ${s.mittente}\n`;
                alert += `💬 *MSG:* \n> ${s.testo}\n\n`;
                alert += `✨ _Operazione completata._`;
                return conn.sendMessage(m.chat, { text: alert, edit: key });
            }
        }
        return conn.sendMessage(m.chat, { text: `⌛ *RADAR TIMEOUT*\nNessun nuovo codice ricevuto per \`+${num}\`. Prova un altro numero con \`${usedPrefix}lastvoips\``, edit: key });
    }

    // --- DATABASE COMPLETO NAZIONI ---
    if (cmd === 'voip' && !arg) {
        let msg = `🌍 *DATABASE NAZIONI VoIP* 🌍\n\n`;
        for(let i=0; i<nazioni.length; i+=2) {
             let c1 = `*${nazioni[i].id}* ${nazioni[i].nome}`.padEnd(20);
             let c2 = nazioni[i+1] ? `*${nazioni[i+1].id}* ${nazioni[i+1].nome}` : '';
             msg += `${c1} ${c2}\n`;
        }
        msg += `\n💡 _Digita_ \`${usedPrefix}voip <id>\` _per estrarre i numeri._`;
        return m.reply(msg);
    }

    // --- VOIP SMS MANUALE ---
    if (cmd === 'voip' && arg === 'sms') {
        const num = args[1]?.replace('+', '');
        if (!num) return m.reply(`💡 *Esempio:* ${usedPrefix}voip sms 447418312672`);
        let { key } = await conn.sendMessage(m.chat, { text: `📨 *ESTRAZIONE MESSAGGI...*` });
        let msgs = await fetchMessaggi(num);
        if (!msgs || msgs.length === 0) return m.reply("❌ Nessun SMS trovato. Il numero potrebbe essere scaduto.");

        let res = `📩 *LOG MESSAGGI:* \`+${num}\`\n\n`;
        msgs.slice(0, 7).forEach(m => {
            res += `🕒 *${m.tempo}*\n`;
            res += `👤 *DA:* ${m.mittente}\n`;
            res += `📝 *MSG:* ${m.testo}\n`;
            res += ` ────────────────\n`;
        });
        return conn.sendMessage(m.chat, { text: res.trim(), edit: key });
    }

    // --- NUMERI PER NAZIONE (MASSIMIZZATI) ---
    if (cmd === 'voip' && arg && arg !== 'sms') {
        const naz = nazioni.find(n => n.id === arg);
        if (!naz) return m.reply("❌ ID Nazione non trovato nel database.");
        let { key } = await conn.sendMessage(m.chat, { text: `🔎 *SCANSIONE LIVE:* ${naz.nome}` });
        try {
            const { data } = await axios.get(`${baseUrl}${naz.path}?t=${Date.now()}`, { headers: getHeaders() });
            const $ = cheerio.load(data);
            let list = [];
            $('a').each((i, el) => {
                let t = $(el).text().trim();
                if (t.includes('+')) list.push(t.replace(/[^0-9]/g, ''));
            });

            let finalNumbers = [...new Set(list)];
            if (finalNumbers.length === 0) return m.reply("❌ Nessun numero attivo trovato per questa nazione.");

            let res = `🟢 *NUMERI ATTIVI: ${naz.nome.toUpperCase()}*\n\n`;
            finalNumbers.slice(0, 15).forEach(n => res += `• \`+${n}\`\n`);
            res += `\n📡 _Usa_ \`${usedPrefix}regvoip <numero>\` _per attivare il radar._`;
            return conn.sendMessage(m.chat, { text: res, edit: key });
        } catch { return m.reply("❌ Errore di connessione al provider."); }
    }
};

handler.help = ['voip', 'regvoip', 'lastvoips', 'menuvoip'];
handler.tags = ['strumenti'];
handler.command = /^(voip|regvoip|lastvoips|menuvoip)$/i;

export default handler;