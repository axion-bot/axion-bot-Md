const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
        display_text: '⟲ Gioca Ancora',
        id: `.bandiera`
    })
}];

// ✨ AXION STYLE
const H = '╭━〔 ✦ 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 ✦ 〕━⬣';
const F = '╰━━━━━━━━━━━━━━━━━━⬣';

// 🧠 NORMALIZE
function normalizeString(str) {
    return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

// 🎯 SIMILARITY
function similarity(a, b) {
    if (a === b) return true;
    if (a.includes(b) || b.includes(a)) return true;
    return false;
}

let handler = async (m, { conn, isAdmin }) => {

    let frasi = [
        '🧠 Metti alla prova la tua mente!',
        '🌍 Riconosci questa bandiera?',
        '🎯 Solo i veri esperti indovinano!',
        '🔍 Osserva bene ogni dettaglio...',
        '⚡ Sfida attiva!'
    ];

    // SKIP
    if (m.text?.toLowerCase() === '.skipbandiera') {
        if (!m.isGroup) return m.reply('⚠️ Solo nei gruppi!');
        if (!global.bandieraGame?.[m.chat]) return m.reply('⚠️ Nessuna partita attiva!');
        if (!isAdmin && !m.fromMe) return m.reply('❌ Solo admin!');

        clearTimeout(global.bandieraGame[m.chat].timeout);

        let txt = `${H}
┃ ⛔ 𝐏𝐀𝐑𝐓𝐈𝐓𝐀 𝐈𝐍𝐓𝐄𝐑𝐑𝐎𝐓𝐓𝐀
┃
┃ 🏳️ Risposta:
┃ ➤ ${global.bandieraGame[m.chat].rispostaOriginale}
┃
┃ 👑 Azione admin
${F}`;

        await conn.sendMessage(m.chat, {
            text: txt,
            interactiveButtons: playAgainButtons()
        }, { quoted: m });

        delete global.bandieraGame[m.chat];
        return;
    }

    if (global.bandieraGame?.[m.chat]) {
        return m.reply('⚠️ Gioco già attivo!');
    }

    // 🌍 LISTA COMPLETA (LA TUA ORIGINALE)
    let bandiere = [
        { url: 'https://flagcdn.com/w320/it.png', nome: 'Italia' },
        { url: 'https://flagcdn.com/w320/fr.png', nome: 'Francia' },
        { url: 'https://flagcdn.com/w320/de.png', nome: 'Germania' },
        { url: 'https://flagcdn.com/w320/gb.png', nome: 'Regno Unito' },
        { url: 'https://flagcdn.com/w320/es.png', nome: 'Spagna' },
        { url: 'https://flagcdn.com/w320/se.png', nome: 'Svezia' },
        { url: 'https://flagcdn.com/w320/no.png', nome: 'Norvegia' },
        { url: 'https://flagcdn.com/w320/fi.png', nome: 'Finlandia' },
        { url: 'https://flagcdn.com/w320/dk.png', nome: 'Danimarca' },
        { url: 'https://flagcdn.com/w320/pl.png', nome: 'Polonia' },
        { url: 'https://flagcdn.com/w320/pt.png', nome: 'Portogallo' },
        { url: 'https://flagcdn.com/w320/gr.png', nome: 'Grecia' },
        { url: 'https://flagcdn.com/w320/ch.png', nome: 'Svizzera' },
        { url: 'https://flagcdn.com/w320/at.png', nome: 'Austria' },
        { url: 'https://flagcdn.com/w320/be.png', nome: 'Belgio' },
        { url: 'https://flagcdn.com/w320/nl.png', nome: 'Paesi Bassi' },
        { url: 'https://flagcdn.com/w320/ua.png', nome: 'Ucraina' },
        { url: 'https://flagcdn.com/w320/ro.png', nome: 'Romania' },
        { url: 'https://flagcdn.com/w320/hu.png', nome: 'Ungheria' },
        { url: 'https://flagcdn.com/w320/cz.png', nome: 'Repubblica Ceca' },
        { url: 'https://flagcdn.com/w320/ie.png', nome: 'Irlanda' },
        { url: 'https://flagcdn.com/w320/bg.png', nome: 'Bulgaria' },
        { url: 'https://flagcdn.com/w320/md.png', nome: 'Moldavia' },
        { url: 'https://flagcdn.com/w320/us.png', nome: 'Stati Uniti' },
        { url: 'https://flagcdn.com/w320/ca.png', nome: 'Canada' },
        { url: 'https://flagcdn.com/w320/mx.png', nome: 'Messico' },
        { url: 'https://flagcdn.com/w320/br.png', nome: 'Brasile' },
        { url: 'https://flagcdn.com/w320/ar.png', nome: 'Argentina' },
        { url: 'https://flagcdn.com/w320/cl.png', nome: 'Cile' },
        { url: 'https://flagcdn.com/w320/co.png', nome: 'Colombia' },
        { url: 'https://flagcdn.com/w320/pe.png', nome: 'Perù' },
        { url: 'https://flagcdn.com/w320/ve.png', nome: 'Venezuela' },
        { url: 'https://flagcdn.com/w320/cu.png', nome: 'Cuba' },
        { url: 'https://flagcdn.com/w320/au.png', nome: 'Australia' },
        { url: 'https://flagcdn.com/w320/nz.png', nome: 'Nuova Zelanda' },
        { url: 'https://flagcdn.com/w320/cn.png', nome: 'Cina' },
        { url: 'https://flagcdn.com/w320/jp.png', nome: 'Giappone' },
        { url: 'https://flagcdn.com/w320/in.png', nome: 'India' },
        { url: 'https://flagcdn.com/w320/kr.png', nome: 'Corea del Sud' },
        { url: 'https://flagcdn.com/w320/th.png', nome: 'Thailandia' },
        { url: 'https://flagcdn.com/w320/vn.png', nome: 'Vietnam' },
        { url: 'https://flagcdn.com/w320/id.png', nome: 'Indonesia' },
        { url: 'https://flagcdn.com/w320/ph.png', nome: 'Filippine' },
        { url: 'https://flagcdn.com/w320/my.png', nome: 'Malesia' },
        { url: 'https://flagcdn.com/w320/sg.png', nome: 'Singapore' },
        { url: 'https://flagcdn.com/w320/pk.png', nome: 'Pakistan' },
        { url: 'https://flagcdn.com/w320/af.png', nome: 'Afghanistan' },
        { url: 'https://flagcdn.com/w320/ir.png', nome: 'Iran' },
        { url: 'https://flagcdn.com/w320/iq.png', nome: 'Iraq' },
        { url: 'https://flagcdn.com/w320/tr.png', nome: 'Turchia' },
        { url: 'https://flagcdn.com/w320/il.png', nome: 'Israele' },
        { url: 'https://flagcdn.com/w320/sa.png', nome: 'Arabia Saudita' },
        { url: 'https://flagcdn.com/w320/ae.png', nome: 'Emirati Arabi Uniti' },
        { url: 'https://flagcdn.com/w320/qa.png', nome: 'Qatar' },
        { url: 'https://flagcdn.com/w320/eg.png', nome: 'Egitto' },
        { url: 'https://flagcdn.com/w320/ng.png', nome: 'Nigeria' },
        { url: 'https://flagcdn.com/w320/ma.png', nome: 'Marocco' },
        { url: 'https://flagcdn.com/w320/tn.png', nome: 'Tunisia' },
        { url: 'https://flagcdn.com/w320/ke.png', nome: 'Kenya' },
        { url: 'https://flagcdn.com/w320/et.png', nome: 'Etiopia' },
        { url: 'https://flagcdn.com/w320/gh.png', nome: 'Ghana' },
        { url: 'https://flagcdn.com/w320/cm.png', nome: 'Camerun' },
        { url: 'https://flagcdn.com/w320/ci.png', nome: "Costa d'Avorio" },
        { url: 'https://flagcdn.com/w320/sn.png', nome: 'Senegal' },
        { url: 'https://flagcdn.com/w320/za.png', nome: 'Sudafrica' },
        { url: 'https://flagcdn.com/w320/dz.png', nome: 'Algeria' },
        { url: 'https://flagcdn.com/w320/sd.png', nome: 'Sudan' },
        { url: 'https://flagcdn.com/w320/cd.png', nome: 'Repubblica Democratica del Congo' },
        { url: 'https://flagcdn.com/w320/ao.png', nome: 'Angola' },
        { url: 'https://flagcdn.com/w320/mg.png', nome: 'Madagascar' },
        { url: 'https://flagcdn.com/w320/tz.png', nome: 'Tanzania' },
        { url: 'https://flagcdn.com/w320/ug.png', nome: 'Uganda' }
    ];

    let scelta = bandiere[Math.floor(Math.random() * bandiere.length)];
    let frase = frasi[Math.floor(Math.random() * frasi.length)];

    let caption = `${H}
┃ 🌍 𝐆𝐈𝐎𝐂𝐎 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐀
┃
┃ ${frase}
┃
┃ 🏳️ Indovina la nazione
┃ ⏱️ Tempo: 30s
${F}`;

    let msg = await conn.sendMessage(m.chat, {
        image: { url: scelta.url },
        caption
    }, { quoted: m });

    global.bandieraGame = global.bandieraGame || {};
    global.bandieraGame[m.chat] = {
        id: msg.key.id,
        risposta: normalizeString(scelta.nome),
        rispostaOriginale: scelta.nome,
        tentativi: {},
        suggerito: false,
        startTime: Date.now(),
        timeout: setTimeout(async () => {

            if (!global.bandieraGame?.[m.chat]) return;

            let txt = `${H}
┃ ⏰ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎
┃
┃ 🏳️ ${scelta.nome}
${F}`;

            await conn.sendMessage(m.chat, {
                text: txt,
                interactiveButtons: playAgainButtons()
            });

            delete global.bandieraGame[m.chat];

        }, 30000)
    };
};

// RISPOSTE
handler.before = async (m, { conn }) => {
    const game = global.bandieraGame?.[m.chat];
    if (!game || !m.quoted || m.quoted.id !== game.id) return;

    let user = normalizeString(m.text || '');
    if (!user) return;

    if (similarity(user, game.risposta)) {

        clearTimeout(game.timeout);

        let time = Math.floor((Date.now() - game.startTime) / 1000);
        let reward = Math.floor(Math.random() * 30) + 20;

        let txt = `${H}
┃ ✅ 𝐂𝐎𝐑𝐑𝐄𝐓𝐓𝐎!
┃
┃ 🏳️ ${game.rispostaOriginale}
┃ ⏱️ ${time}s
┃
┃ 💰 +${reward}€
┃ ✨ +150 EXP
${F}`;

        await conn.sendMessage(m.chat, {
            text: txt,
            interactiveButtons: playAgainButtons()
        }, { quoted: m });

        delete global.bandieraGame[m.chat];

    } else {
        game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1;
        let left = 3 - game.tentativi[m.sender];

        if (left <= 0) {
            await conn.sendMessage(m.chat, {
                text: `${H}
┃ 🚫 Tentativi finiti
┃ 🏳️ ${game.rispostaOriginale}
${F}`
            });
            delete global.bandieraGame[m.chat];
        } else {
            await conn.reply(m.chat, `${H}
┃ ❌ Sbagliato
┃ 📝 Tentativi: ${left}
${F}`, m);
        }
    }
};

handler.command = /^(bandiera|skipbandiera)$/i;
handler.group = true;

export default handler;