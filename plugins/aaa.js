let isScraperReady = false;
let axios, cheerio;

try {
    axios = (await import('axios')).default;
    cheerio = await import('cheerio');
    isScraperReady = true;
} catch (e) {
    console.log("ERRORE VOIP: Mancano axios o cheerio.");
}

const baseUrl = 'https://sms24.me';

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15'
];

const getHeaders = () => {
    return {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
    };
};

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

// Dizionario per riconoscere le nazioni in inglese dalla homepage
const nazioniEng = {
    'united states': 'Stati Uniti 🇺🇸', 'united kingdom': 'Regno Unito 🇬🇧', 'france': 'Francia 🇫🇷', 
    'sweden': 'Svezia 🇸🇪', 'germany': 'Germania 🇩🇪', 'italy': 'Italia 🇮🇹', 'netherlands': 'Olanda 🇳🇱', 
    'spain': 'Spagna 🇪🇸', 'canada': 'Canada 🇨🇦', 'belgium': 'Belgio 🇧🇪', 'austria': 'Austria 🇦🇹', 
    'denmark': 'Danimarca 🇩🇰', 'poland': 'Polonia 🇵🇱', 'portugal': 'Portogallo 🇵🇹', 'russia': 'Russia 🇷🇺', 
    'estonia': 'Estonia 🇪🇪', 'latvia': 'Lettonia 🇱🇻', 'lithuania': 'Lituania 🇱🇹', 'czech': 'Rep. Ceca 🇨🇿', 
    'romania': 'Romania 🇷🇴', 'croatia': 'Croazia 🇭🇷', 'hong kong': 'Hong Kong 🇭🇰', 'china': 'Cina 🇨🇳', 
    'malaysia': 'Malesia 🇲🇾', 'indonesia': 'Indonesia 🇮🇩', 'philippines': 'Filippine 🇵🇭', 'thailand': 'Thailandia 🇹🇭', 
    'vietnam': 'Vietnam 🇻🇳', 'south africa': 'Sudafrica 🇿🇦', 'brazil': 'Brasile 🇧🇷', 'mexico': 'Messico 🇲🇽', 
    'india': 'India 🇮🇳', 'ukraine': 'Ucraina 🇺🇦', 'switzerland': 'Svizzera 🇨🇭', 'ireland': 'Irlanda 🇮🇪', 
    'norway': 'Norvegia 🇳🇴', 'australia': 'Australia 🇦🇺', 'israel': 'Israele 🇮🇱', 'kazakhstan': 'Kazakistan 🇰🇿', 
    'finland': 'Finlandia 🇫🇮'
};

async function fetchMessaggi(numeroTelefono) {
    try {
        const numUrl = `${baseUrl}/en/numbers/${numeroTelefono}`;
        const { data } = await axios.get(numUrl, { headers: getHeaders(), timeout: 10000 });
        const $ = cheerio.load(data);
        let messaggi = [];
        $('.shadow-sm, .list-group-item, .callout, .message-row').each((i, el) => {
            let mittente = $(el).find('a').first().text().trim() || 'Sconosciuto';
            let tempo = $(el).find('.text-info, .text-muted, small').first().text().trim() || 'Recente';
            let testo = $(el).text().replace(/\s+/g, ' ').replace(mittente, '').replace(tempo, '').trim();
            testo = testo.replace(/From:\s*[^\s]+/i, '').replace('Copy', '').trim();
            if (testo.length > 2 && !messaggi.some(m => m.testo === testo)) {
                messaggi.push({ mittente, tempo, testo });
            }
        });
        return messaggi;
    } catch (e) {
        return null;
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!isScraperReady) return m.reply("Errore di sistema: librerie mancanti.");

    const cmd = command.toLowerCase();
    const argomento = args[0] ? args[0].toLowerCase() : null;

    // ==========================================
    // 📖 COMANDO: !menuvoip (GUIDA COMPLETA)
    // ==========================================
    if (cmd === 'menuvoip') {
        let menu = `*-- 📱 PANNELLO DI CONTROLLO VoIP 📱 --*\n\n`;
        menu += `_Strumenti avanzati per l'intercettazione SMS_\n\n`;
        menu += `🌍 *${usedPrefix}voip*\nMostra il database con tutte le 40 nazioni.\n\n`;
        menu += `🔍 *${usedPrefix}voip <ID>*\nEstrae i numeri attivi per una nazione (es. *${usedPrefix}voip 2*).\n\n`;
        menu += `🔥 *${usedPrefix}lastvoips*\nRecupera in assoluto i 10 numeri più freschi a livello globale.\n\n`;
        menu += `📡 *${usedPrefix}regvoip <numero>*\n*(CONSIGLIATO)* Attiva il Radar in ascolto per i nuovi SMS in tempo reale.\n\n`;
        menu += `📩 *${usedPrefix}voip sms <numero>*\nLista manuale. Legge gli ultimi 5 SMS in chiaro.\n`;
        return m.reply(menu);
    }

    // ==========================================
    // 🚀 COMANDO: !lastvoips (GLI ULTIMI 10) - METODO INFALLIBILE
    // ==========================================
    if (cmd === 'lastvoips') {
        let { key } = await conn.sendMessage(m.chat, { text: `🌍 Scansione globale... Cerco i numeri più recenti...` });

        try {
            const { data } = await axios.get(baseUrl, { headers: getHeaders(), timeout: 10000 });
            const $ = cheerio.load(data);

            let ultimiNumeri = [];

            // METODO BULLETPROOF: Scansiona TUTTI i link che sembrano numeri di telefono
            $('a').each((i, el) => {
                let testoLink = $(el).text().trim();
                let numero = testoLink.replace(/[^0-9]/g, '');

                // Se il link contiene il "+" ed è un numero di telefono lungo a sufficienza
                if (testoLink.includes('+') && numero.length >= 8 && !ultimiNumeri.some(n => n.numero === numero)) {

                    // Risali al contenitore genitore per capire a che nazione appartiene
                    let testoContenitore = $(el).parent().parent().text().toLowerCase();
                    let nazioneBella = "Sconosciuta 🌐";

                    // Cerca il nome inglese nel nostro dizionario
                    for (const [eng, ita] of Object.entries(nazioniEng)) {
                        if (testoContenitore.includes(eng)) {
                            nazioneBella = ita;
                            break;
                        }
                    }

                    ultimiNumeri.push({ numero, nazione: nazioneBella });
                }
            });

            if (ultimiNumeri.length === 0) {
                return conn.sendMessage(m.chat, { text: `❌ I server non stanno rispondendo. Riprova.`, edit: key });
            }

            let numeriSelezionati = ultimiNumeri.slice(0, 10);

            let responseText = `-- 🔥 I 10 PIÙ FRESCHI DEL PIANETA 🔥 --\n\n`;

            numeriSelezionati.forEach((item, index) => {
                responseText += `[${index + 1}] ${item.nazione}\n`;
                responseText += `➤ +${item.numero}\n\n`;
            });

            responseText += `*ATTIVA IL RADAR:*\n`;
            responseText += `*${usedPrefix}regvoip <numero>*`;

            return conn.sendMessage(m.chat, { text: responseText, edit: key });

        } catch (error) {
            return conn.sendMessage(m.chat, { text: `❌ Errore di rete globale.`, edit: key });
        }
    }

    // ==========================================
    // 🎯 COMANDO: !regvoip (RADAR AUTO-LISTENER)
    // ==========================================
    if (cmd === 'regvoip') {
        const numeroTelefono = args[0]?.replace('+', '').replace(/\s+/g, '');
        if (!numeroTelefono) return m.reply(`Inserisci il numero da mettere in ascolto.\nEsempio: *${usedPrefix}regvoip 447418312672*`);

        let { key } = await conn.sendMessage(m.chat, { text: `📡 Avvio RADAR per +${numeroTelefono}...\nScatto fotografia dei vecchi messaggi...` });

        let messaggiIniziali = await fetchMessaggi(numeroTelefono);
        let testoIniziale = (messaggiIniziali && messaggiIniziali.length > 0) ? messaggiIniziali[0].testo : "VUOTO";

        await conn.sendMessage(m.chat, { text: `🟢 *RADAR ATTIVO SU +${numeroTelefono}*\n\nVai sull'app o sito, inserisci il numero e invia l'SMS.\nIl bot è in ascolto per i prossimi *3 minuti*...`, edit: key });

        let tentativi = 0;
        const maxTentativi = 18; 

        while (tentativi < maxTentativi) {
            await sleep(10000); 
            tentativi++;

            let messaggiAttuali = await fetchMessaggi(numeroTelefono);
            if (!messaggiAttuali || messaggiAttuali.length === 0) continue; 

            let statoAttuale = messaggiAttuali[0];

            if (statoAttuale.testo !== testoIniziale && statoAttuale.testo.length > 3) {
                let successMsg = `🎉 *NUOVO SMS INTERCETTATO!* 🎉\n\n`;
                successMsg += `📱 *Numero:* +${numeroTelefono}\n`;
                successMsg += `🏢 *Mittente:* ${statoAttuale.mittente}\n`;
                successMsg += `🕒 *Arrivato:* ${statoAttuale.tempo}\n`;
                successMsg += `💬 *Messaggio:* ${statoAttuale.testo}\n\n`;
                successMsg += `_Radar disattivato._`;

                return conn.sendMessage(m.chat, { text: successMsg, edit: key });
            }
        }

        return conn.sendMessage(m.chat, { text: `❌ *TIMEOUT RADAR*\n\nNessun nuovo SMS in 3 minuti per +${numeroTelefono}.\n\n_Il firewall dell'app bersaglio potrebbe aver bloccato il numero VoIP._`, edit: key });
    }

    // ==========================================
    // 🌍 COMANDO: !voip (MENU NAZIONI)
    // ==========================================
    if (cmd === 'voip' && !argomento) {
        let menu = `*-- DATABASE NAZIONI GLOBALI --*\n\n`;
        for(let i=0; i<nazioni.length; i+=2) {
             let col1 = `${nazioni[i].id}. ${nazioni[i].nome}`.padEnd(18);
             let col2 = nazioni[i+1] ? `${nazioni[i+1].id}. ${nazioni[i+1].nome}` : '';
             menu += `${col1} ${col2}\n`;
        }
        menu += `\n💡 *Non sai come procedere?*\nDigita *${usedPrefix}menuvoip* per la guida ai comandi.`;
        return m.reply(menu);
    }

    // ==========================================
    // 📩 COMANDO: !voip sms <numero> (MANUALE)
    // ==========================================
    if (cmd === 'voip' && argomento === 'sms') {
        const numeroTelefono = args[1]?.replace('+', '');
        if (!numeroTelefono) return m.reply(`Devi inserire il numero.\nEsempio: *${usedPrefix}voip sms 447418312672*`);

        let { key } = await conn.sendMessage(m.chat, { text: `⏳ Recupero la lista degli SMS per +${numeroTelefono}...` });

        let messaggi = await fetchMessaggi(numeroTelefono);

        if (!messaggi || messaggi.length === 0) {
            return conn.sendMessage(m.chat, { text: `❌ Nessun SMS recente trovato per +${numeroTelefono}.`, edit: key });
        }

        let responseText = `-- ULTIMI SMS RICEVUTI --\nNumero: +${numeroTelefono}\n\n`;
        messaggi.slice(0, 5).forEach((msg) => {
            responseText += `🕒 *${msg.tempo}*\n`;
            responseText += `Da: ${msg.mittente}\n`;
            responseText += `Messaggio: ${msg.testo}\n`;
            responseText += `----------------------\n`;
        });
        return conn.sendMessage(m.chat, { text: responseText.trim(), edit: key });
    }

    // ==========================================
    // 🔍 COMANDO: !voip <id> (GENERAZIONE NUMERI NAZIONE)
    // ==========================================
    if (cmd === 'voip' && argomento && argomento !== 'sms') {
        const nazioneScelta = nazioni.find(n => n.id === argomento);
        if (nazioneScelta) {
            let { key } = await conn.sendMessage(m.chat, { text: `🔍 Cerco i numeri disponibili in ${nazioneScelta.nome}...` });

            try {
                const urlNazione = `${baseUrl}${nazioneScelta.path}`;
                const { data } = await axios.get(urlNazione, { headers: getHeaders(), timeout: 10000 });
                const $ = cheerio.load(data);

                let numeriTrovati = [];

                // METODO BULLETPROOF ANCHE QUI
                $('a').each((i, el) => {
                    let testoLink = $(el).text().trim();
                    let numero = testoLink.replace(/[^0-9]/g, '');
                    if (testoLink.includes('+') && numero.length >= 8 && !numeriTrovati.includes(numero)) {
                        numeriTrovati.push(numero);
                    }
                });

                if (numeriTrovati.length === 0) {
                    return conn.sendMessage(m.chat, { text: `❌ I server di questa nazione non hanno numeri attivi in questo momento.`, edit: key });
                }

                let numeriSelezionati = numeriTrovati.slice(0, 4);
                let responseText = `-- NUMERI DISPONIBILI --\nNazione: ${nazioneScelta.nome}\n\n`;
                numeriSelezionati.forEach(num => {
                    responseText += `➤ +${num}\n`;
                });

                responseText += `\n*CONTROLLO SMS:*\n`;
                responseText += `Radar: *${usedPrefix}regvoip <numero>*\n`;
                responseText += `Manuale: *${usedPrefix}voip sms <numero>*`;

                return conn.sendMessage(m.chat, { text: responseText, edit: key });

            } catch (error) {
                return conn.sendMessage(m.chat, { text: `❌ Errore connessione provider. Riprova.`, edit: key });
            }
        }
        return m.reply(`ID Nazione non valido. Usa ${usedPrefix}voip per vedere l'elenco.`);
    }
};

handler.help = ['voip', 'regvoip', 'lastvoips', 'menuvoip'];
handler.tags = ['strumenti'];
handler.command = /^(voip|regvoip|lastvoips|menuvoip)$/i;

export default handler;