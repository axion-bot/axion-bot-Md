import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('⚠️ Questo comando può essere usato solo nei gruppi!');
  }

  // Lista di persone "sconosciute" nelle community WhatsApp
  const unknownPeople = [
    { 
      name: "👤 Marco92", 
      desc: "quello che ha l'immagine predefinita da 3 anni",
      community: "Gruppi di scambio",
      lastSeen: "10 minuti fa"
    },
    { 
      name: "👤 Giulia__", 
      desc: "legge ma non risponde mai",
      community: "Community libri",
      lastSeen: "2 ore fa" 
    },
    { 
      name: "👤 User12345", 
      desc: "il classico numero internazionale",
      community: "Gruppi spam",
      lastSeen: "ieri" 
    },
    { 
      name: "👤 Alessandro", 
      desc: "ha la spunta blu ma non si sa chi sia",
      community: "Vari gruppi",
      lastSeen: "3 giorni fa" 
    },
    { 
      name: "👤 Sara", 
      desc: "cambia foto profilo ogni settimana",
      community: "Community gossip",
      lastSeen: "online ora" 
    },
    { 
      name: "👤 +39 *** *** **90", 
      desc: "numero nascosto, nessuno lo conosce",
      community: "Mistero totale",
      lastSeen: "mai online" 
    },
    { 
      name: "👤 Luca", 
      desc: "manda solo auguri a Natale",
      community: "Parenti lontani",
      lastSeen: "8 mesi fa" 
    },
    { 
      name: "👤 Fra", 
      desc: "quello che c'è in 100 gruppi",
      community: "Tutte le community",
      lastSeen: "sempre online" 
    },
    { 
      name: "👤 Anonimo", 
      desc: "ha disattivato l'ultimo accesso",
      community: "Ghost mode",
      lastSeen: "nascosto" 
    },
    { 
      name: "👤 Nonno_45", 
      desc: "manda buongiorno ogni mattina",
      community: "Gruppi famiglia",
      lastSeen: "5 minuti fa" 
    },
    { 
      name: "👤 _unknown_", 
      desc: "nome utente tutto in minuscolo",
      community: "Community tech",
      lastSeen: "2 settimane fa" 
    },
    { 
      name: "👤 Missim", 
      desc: "quello che ti compare nei suggeriti",
      community: "Contatti suggeriti",
      lastSeen: "sconosciuto" 
    },
    { 
      name: "👤 Silvia", 
      desc: "ha 2 spunte blu ma non parla mai",
      community: "Gruppi silenziosi",
      lastSeen: "letto" 
    }
  ];

  // Seleziona una persona casuale
  const randomUnknown = unknownPeople[Math.floor(Math.random() * unknownPeople.length)];

  // Genera percentuale di "mistero" casuale
  const mysteryPercent = Math.floor(Math.random() * 101);

  // Genera numeri casuali per info WhatsApp
  const groupsCount = Math.floor(Math.random() * 50) + 1;
  const mutualGroups = Math.floor(Math.random() * groupsCount);
  const commonContacts = Math.floor(Math.random() * 20);

  // Crea la barra di caricamento
  const loadingBar = createLoadingBar(mysteryPercent, 15);

  // Messaggio iniziale con barra
  const initialMsg = `
╔══════════════════════╗
   🕵️ *WHATSAPP UNKNOWN* 🕵️
╚══════════════════════╝

🔎 *Scansionando community...*
📱 *Analizzando partecipanti...*

${loadingBar}

📊 *Mistero rilevato:* ${mysteryPercent}%
👥 *Gruppi analizzati:* ${groupsCount}
  `;

  const sentMsg = await conn.sendMessage(m.chat, { 
    text: initialMsg,
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '🔍 SISTEMA DI RICERCA',
        body: 'Cercando utenti misteriosi...',
        mediaType: 1,
        renderLargerThumbnail: false,
        thumbnailUrl: 'https://telegra.ph/file/9e123d8b0b9c9a7d3b5f4.jpg' // Metti un'immagine carina
      }
    }
  }, { quoted: m });

  // Simula elaborazione
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Calcola statistiche basate sulla percentuale
  const activityLevel = getActivityLevel(mysteryPercent);
  const riskLevel = getRiskLevel(mysteryPercent);
  const mysteryEmoji = getMysteryEmoji(mysteryPercent);

  // Risultato finale
  const resultMessage = `
╔══════════════════════╗
   🕵️ *UTENTE TROVATO* 🕵️
╚══════════════════════╝

📱 *PROFILO:*
${randomUnknown.name} │ ${randomUnknown.desc}

━━━━━━━━━━━━━━━━━━━
📊 *STATISTICHE WHATSAPP:*

👥 *Gruppi in comune:* ${mutualGroups}
👤 *Contatti in comune:* ${commonContacts}
🏘️ *Community principale:* ${randomUnknown.community}
⏰ *Ultimo accesso:* ${randomUnknown.lastSeen}

━━━━━━━━━━━━━━━━━━━
🔮 *LIVELLO MISTERO:* ${mysteryPercent}% ${mysteryEmoji}
${getMysteryDescription(mysteryPercent)}

📈 *Attività:* ${activityLevel}
⚠️ *Rischio ghost:* ${riskLevel}

━━━━━━━━━━━━━━━━━━━
💬 *COSA DICE LA COMMUNITY:*

"${getWhatsAppGossip(randomUnknown.name, mysteryPercent)}"

${getRandomHashtag()}
  `.trim();

  // Bottoni interattivi
  const buttons = [
    { 
      buttonId: `${usedPrefix}random`, 
      buttonText: { displayText: '🔄 NUOVO MISTERO' }, 
      type: 1 
    },
    { 
      buttonId: `${usedPrefix}randomprofile`, 
      buttonText: { displayText: '🔍 VEDI FOTO PROFILO' }, 
      type: 1 
    },
    { 
      buttonId: `${usedPrefix}randomstory`, 
      buttonText: { displayText: '📖 STORIA COMPLETA' }, 
      type: 1 
    }
  ];

  const buttonMessage = {
    text: resultMessage,
    footer: '🕵️ Unknown WhatsApp - Scopri chi si nasconde nei gruppi',
    buttons: buttons,
    headerType: 1,
    mentions: [m.sender]
  };

  await conn.sendMessage(m.chat, buttonMessage, { quoted: sentMsg });
};

// Comando per vedere la "foto profilo" (descrizione divertente)
const profileHandler = async (m, { conn }) => {
  const profiles = [
    "📸 *FOTO PROFILO:* Una silhouette nera, classico profilo misterioso",
    "📸 *FOTO PROFILO:* Il sole su una spiaggia, probabilmente presa da Google",
    "📸 *FOTO PROFILO:* Un gatto nero, 99% non è il suo gatto",
    "📸 *FOTO PROFILO:* Fiore viola, molto basic",
    "📸 *FOTO PROFILO:* Icona predefinita di WhatsApp, il vero mistero",
    "📸 *FOTO PROFILO:* Famoso attore, probabilmente ci prova",
    "📸 *FOTO PROFILO:* Paesaggio montano, cerca avventure",
    "📸 *FOTO PROFILO:* Emoji gigante, nulla di che"
  ];

  const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];

  await m.reply(`🕵️ *PROFILO MISTERIOSO*\n\n${randomProfile}`);
};

// Comando per la "storia completa"
const storyHandler = async (m, { conn }) => {
  const stories = [
    "📖 Questo utente è stato aggiunto a 50 gruppi nel 2020 e da allora non ha mai detto una parola. Leggenda vuole che sia ancora in ascolto...",
    "📖 Si unisce ai gruppi, legge tutto, salva i media, e sparisce. Il fantasma di WhatsApp.",
    "📖 Ha la foto profilo di una persona famosa, nessuno sa chi sia veramente. Alcuni dicono sia un bot.",
    "📖 Era attivissimo nel 2019, poi un giorno scomparve. Il suo ultimo messaggio fu 'ciao'.",
    "📖 Compare solo nei gruppi di scambio libri, ma non ha mai letto un libro in vita sua.",
    "📖 Ha 3 numeri di telefono diversi e in ogni gruppo ne usa uno diverso."
  ];

  const randomStory = stories[Math.floor(Math.random() * stories.length)];

  await m.reply(`${randomStory}`);
};

// Funzioni di supporto
function createLoadingBar(percent, length = 15) {
  const filledLength = Math.round((percent / 100) * length);
  const emptyLength = length - filledLength;

  const filledBar = '█'.repeat(filledLength);
  const emptyBar = '░'.repeat(emptyLength);

  return `┃${filledBar}${emptyBar}┃`;
}

function getMysteryEmoji(percent) {
  if (percent >= 80) return '👻';
  if (percent >= 60) return '🕵️';
  if (percent >= 40) return '🤔';
  if (percent >= 20) return '😐';
  return '😎';
}

function getMysteryDescription(percent) {
  if (percent >= 80) return '└ *LEGGENDA:* Nessuno sa chi sia veramente';
  if (percent >= 60) return '└ *MISTERO:* Pochi lo hanno visto online';
  if (percent >= 40) return '└ *NORMALE:* Utente standard di WhatsApp';
  if (percent >= 20) return '└ *CHIARO:* Si vede spesso in giro';
  return '└ *NOTO:* Praticamente una celebrità';
}

function getActivityLevel(percent) {
  if (percent >= 80) return '💤 *Spento* - Mai online';
  if (percent >= 60) return '🌙 *Ghost* - Solo notte fonda';
  if (percent >= 40) return '📱 *Moderato* - Ogni tanto si vede';
  if (percent >= 20) return '☀️ *Attivo* - Risponde sempre';
  return '⚡ *Super attivo* - 24/7 online';
}

function getRiskLevel(percent) {
  if (percent >= 80) return '🔴 *Altissimo* - Fantasma totale';
  if (percent >= 60) return '🟠 *Alto* - Quasi invisibile';
  if (percent >= 40) return '🟡 *Medio* - Si fa vedere';
  if (percent >= 20) return '🟢 *Basso* - Profilo chiaro';
  return '🔵 *Minimo* - Troppo conosciuto';
}

function getWhatsAppGossip(name, percent) {
  const gossips = [
    `"Ho visto ${name} in 15 gruppi diversi, non parla mai ma c'è sempre"`,
    `"Dicono che ${name} abbia 3 account WhatsApp diversi"`,
    `"La foto profilo di ${name} è la stessa da 5 anni, rispetto"`,
    `"Qualcuno ha mai ricevuto un messaggio da ${name}? Io no"`,
    `"${name} è il classico utente che aggiungi e poi dimentichi"`,
    `"Secondo me ${name} è un bot creato da WhatsApp per monitorare i gruppi"`,
    `"Ho sognato ${name} una volta, ci ha parlato? No"`,
    `"Si dice che ${name} sappia tutto di tutti, ma nessuno sa nulla di lui/lei"`,
    `"Mio cugino conosce ${name}, ma non vuole dirmi chi è"`,
    `"Se guardi bene, ${name} è in tutti i gruppi da cui sei uscito"`,
    `"La vera domanda è: ${name} esiste veramente?"`
  ];

  if (percent > 90) {
    return `🚨 *ALLARME MISTERO:* ${gossips[Math.floor(Math.random() * gossips.length)]}`;
  }

  return gossips[Math.floor(Math.random() * gossips.length)];
}

function getRandomHashtag() {
  const hashtags = [
    '#UtenteMisterioso', '#WhatsAppGhost', '#MaiVistoOnline',
    '#ChiSaràMai', '#LeggendaWhatsApp', '#ProfiloMistero',
    '#Sconosciuto', '#GhostMode', '#SoloInGruppo',
    '#MisteroDellaFede', '#MaiUnaParola', '#LettoreSilenzioso',
    '#PresenteMaAssente', '#Enigma', '#ChiÈCostui'
  ];

  return `\n${hashtags[Math.floor(Math.random() * hashtags.length)]}`;
}

// Handler principale
handler.help = ['random - Scopri un utente misterioso delle community WhatsApp'];
handler.tags = ['fun'];
handler.command = ['random', 'randomprofile', 'randomstory'];
handler.group = true;

// Gestione sottocomandi
handler.execute = async (m, { conn, usedPrefix, command }) => {
  if (command === 'randomprofile') {
    await profileHandler(m, { conn });
  } else if (command === 'randomstory') {
    await storyHandler(m, { conn });
  } else {
    await handler(m, { conn, usedPrefix, command });
  }
};

export default handler;