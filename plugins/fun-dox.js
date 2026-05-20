const handler = async (m, { conn, text }) => {
  const target = getTarget(text, m);
  const nome = text || await conn.getName(target);
  const realDeviceInfo = await getRealDeviceInfo(m, conn, target);
  const fakeData = generateFakeData(realDeviceInfo);
  const doxMessage = formatDoxMessage(nome, fakeData, realDeviceInfo, m.sender);

  await conn.sendMessage(m.chat, {
    text: doxMessage,
    mentions: [target, m.sender]
  }, { quoted: m });
};

handler.help = ['dox'];
handler.tags = ['giochi'];
handler.command = /^dox/i;
handler.rowner = false;

export default handler;

async function getRealDeviceInfo(m, conn, target) {
  let numeroTelefono = 'N/D';
  let tipoDispositivo = 'Sconosciuto';
  let versioneWA = 'N/D';
  let presenza = 'N/D';
  let hasPic = false;

  try {
    const phoneNumber = target.replace('@s.whatsapp.net', '');
    if (phoneNumber && phoneNumber !== target) {
      numeroTelefono = phoneNumber.startsWith('39') && phoneNumber.length >= 12 ? 
        `+39 ${phoneNumber.substring(2,5)} ${phoneNumber.substring(5,8)} ${phoneNumber.substring(8)}` : `+${phoneNumber}`;
    }

    const msgId = m.quoted?.id || m.quoted?.key?.id || m.key.id;
    if (msgId) {
      if (msgId.startsWith('false_') || msgId.startsWith('true_')) tipoDispositivo = 'WhatsApp Web (Chrome)';
      else if (msgId.includes(':')) tipoDispositivo = 'WhatsApp Desktop Windows';
      else if (/^[A-Z0-9]{20,25}$/i.test(msgId) && !msgId.startsWith('3EB0')) tipoDispositivo = 'iPhone 15 Pro';
      else tipoDispositivo = 'Samsung Galaxy S23';
    }

    try {
      const presenceData = await conn.fetchStatus(target);
      if (presenceData?.[0]) presenza = presenceData[0].status || 'N/D';
    } catch (e) {}

    try {
      const pic = await conn.profilePictureUrl(target);
      if (pic) hasPic = true;
    } catch (e) {}

    versioneWA = tipoDispositivo.includes('Web') ? '2.2347.52' : tipoDispositivo.includes('iPhone') ? '2.23.24.14' : '2.23.24.76';
  } catch (error) {}

  return { numeroTelefono, tipoDispositivo, versioneWA, presenza, hasPic };
}

function getTarget(text, m) {
  if (text?.replace(/[^0-9]/g, '')) return text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  return m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
}

function generateFakeData(realInfo) {
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    speed: (Math.random() * 0.5 + 0.1).toFixed(2),
    ip: `92.28.${randomInt(1, 254)}.${randomInt(1, 254)}`,
    cf: Array.from({length: 16}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[randomInt(0, 35)]).join(''),
    isp: pickRandom(['Vodafone', 'TIM', 'WindTre', 'Fastweb', 'Iliad']),
    regione: pickRandom(['Lazio', 'Lombardia', 'Campania', 'Piemonte', 'Sicilia']),
    citta: pickRandom(['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo']),
    os: realInfo.tipoDispositivo.includes('iPhone') ? 'iOS 17' : realInfo.tipoDispositivo.includes('Web') ? 'Windows 11' : 'Android 14',
    lat: (41.9 + Math.random() * 2).toFixed(4),
    lon: (12.5 + Math.random() * 2).toFixed(4)
  };
}

function formatDoxMessage(nome, data, realInfo, sender) {
  const senderNumber = sender.split('@')[0];
  return `*[ ✔ ] DOX COMPLETATO!*
⏳ Tempo impiegato: ${data.speed} secondi

*🎯 INFORMAZIONI PERSONALI:*
• Nome: ${nome}
• Telefono: ${realInfo.numeroTelefono}
• Codice Fiscale: ${data.cf}

*📱 DISPOSITIVO WHATSAPP:*
• Dispositivo: ${realInfo.tipoDispositivo}
• Sistema Operativo: ${data.os}
• Versione WA: ${realInfo.versioneWA}
• Stato: ${realInfo.presenza}
• Immagine Profilo: ${realInfo.hasPic ? '✅' : '❌'}

*🌐 INFORMAZIONI DI RETE:*
• IP: ${data.ip}
• ISP: ${data.isp}

*📍 GEOLOCALIZZAZIONE:*
• Paese: Italia
• Regione: ${data.regione}
• Città: ${data.citta}
• Coordinate: ${data.lat}°N, ${data.lon}°E

*🕵️‍♂️ DOX BY:* @${senderNumber}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`;
}
