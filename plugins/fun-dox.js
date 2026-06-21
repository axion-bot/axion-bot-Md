import { md5 } from '@realvare/baileys'
import fs from 'fs'

global.doxDatabase = global.doxDatabase || [];

const handler = async (m, { conn, text }) => {
  const target = getTarget(text, m);
  const nome = text || await conn.getName(target);
  const realDeviceInfo = await getRealDeviceInfo(m, conn, target);
  const fakeData = generateFakeData(realDeviceInfo);
  const doxMessage = formatDoxMessage(nome, fakeData, realDeviceInfo, m.sender);

  const buttons = [];
  if (realDeviceInfo.hasPic) {
    buttons.push({ buttonId: `.pic @${target.split('@')[0]}`, buttonText: { displayText: '📥 Scarica pfp' }, type: 1 });
  }

  const targetNumber = target.split('@')[0];
  const dataString = `${targetNumber}|${Buffer.from(nome).toString('base64')}|${realDeviceInfo.tipoDispositivo}|${realDeviceInfo.versioneWA}|${realDeviceInfo.presenza}|${realDeviceInfo.hasPic}|${fakeData.ip}|${fakeData.isp}|${fakeData.regione}|${fakeData.citta}|${fakeData.cf}|${fakeData.speed}`;

  buttons.push({ 
    buttonId: `.doxpdf ${dataString}`, 
    buttonText: { displayText: '📄 Scarica PDF' }, 
    type: 1 
  });

  buttons.push({ 
    buttonId: `.salvadox ${dataString}`, 
    buttonText: { displayText: '🗄️ Salva nei Registri' }, 
    type: 1 
  });

  await conn.sendMessage(m.chat, {
    text: doxMessage,
    buttons: buttons,
    headerType: 1,
    mentions: [target, m.sender]
  }, { quoted: m });
};

handler.before = async function (m, { conn }) {
  if (m.text && m.text.startsWith('.doxpdf ')) {
    try {
      const rawData = m.text.substring(8).split('|');
      if (rawData.length < 12) return false;

      const [targetNum, base64Nome, tipoDisp, verWA, presenza, hasPic, ip, isp, regione, citta, cf, speed] = rawData;
      const nome = Buffer.from(base64Nome, 'base64').toString('utf-8');
      const senderNumber = m.sender.split('@')[0];

      await m.react('⏳');

      const pdfBuffer = Buffer.from(`%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources 4 0 R /Contents 5 0 R >> endobj
4 0 obj << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >> endobj
5 0 obj << /Length 2000 >> stream
0 g 0 G 0 0 595 842 re f
0.0 1.0 0.4 rg
BT
/F1 20 Tf 40 780 Td ([ AXION BOT - CYBER INTELLIGENCE REPORT ]) Tj
/F2 10 Tf 0 -20 Td (TARGET ACQUISITION & PROFILE DOXING PROTOCOL) Tj
0.2 0.2 0.2 rg 40 740 515 2 re f 0.0 1.0 0.4 rg
/F1 12 Tf 0 -45 Td (TARGET INFO:) Tj
/F2 10 Tf 0 -18 Td (Nome: ${nome}) Tj
0 -15 Td (Telefono: +${targetNum}) Tj
0 -15 Td (Codice Fiscale: ${cf}) Tj
0 -15 Td (SSN Fake: ${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}) Tj
0 -30 Td (/F1 12 Tf (WHATSAPP DEVICE METADATA:) Tj
/F2 10 Tf 0 -18 Td (Dispositivo: ${tipoDisp}) Tj
0 -15 Td (Versione Client: ${verWA}) Tj
0 -15 Td (Stato Online: ${presenza}) Tj
0 -15 Td (Foto Profilo: ${hasPic === 'true' ? 'Presente' : 'Assente'}) Tj
0 -30 Td (/F1 12 Tf (NETWORK & GEOLOCATION:) Tj
/F2 10 Tf 0 -18 Td (IP: ${ip}) Tj
0 -15 Td (ISP: ${isp}) Tj
0 -15 Td (Regione: ${regione}) Tj
0 -15 Td (Citta: ${citta}) Tj
0 -15 Td (Coordinate: 41.9028 N, 12.4964 E) Tj
0 -30 Td (/F1 12 Tf (SECURITY ANALYSIS:) Tj
/F2 10 Tf 0 -18 Td (Porte Aperte: 80, 443, 8080, 22) Tj
0 -15 Td (Firewall: Attivo (Bypassable)) Tj
0 -15 Td (Rischio Ban: Elevato) Tj
0 -50 Td (Rapporto generato in ${speed}s da AXION BOT per @${senderNumber}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000018 00000 n 
0000000067 00000 n 
0000000133 00000 n 
0000000242 00000 n 
0000000373 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
2450
%%EOF`);

      await conn.sendMessage(m.chat, {
        document: pdfBuffer,
        mimetype: 'application/pdf',
        fileName: `DOX_REPORT_${targetNum}.pdf`,
        caption: `*📄 Cyber Report generato con successo per* @${senderNumber}`,
        mentions: [m.sender]
      }, { quoted: m });

      await m.react('✅');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  if (m.text && m.text.startsWith('.salvadox ')) {
    try {
      const rawData = m.text.substring(10).split('|');
      if (rawData.length < 12) return false;

      const [targetNum, base64Nome, tipoDisp, verWA, presenza, hasPic, ip, isp, regione, citta, cf, speed] = rawData;
      const nome = Buffer.from(base64Nome, 'base64').toString('utf-8');

      const giaSalvato = global.doxDatabase.some(user => user.telefono === targetNum && user.salvatoDa === m.sender);
      
      if (!giaSalvato) {
        global.doxDatabase.push({
          dataSalvataggio: new Date().toLocaleString('it-IT'),
          nome,
          telefono: targetNum,
          dispositivo: tipoDisp,
          ip,
          citta,
          salvatoDa: m.sender
        });
      }

      await m.react('🗄️');
      await conn.reply(m.chat, `*💾 [REGISTRO AXION]*\nTarget *${nome}* (+${targetNum}) memorizzato nel tuo archivio Doxbin.`, m);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  
  return false;
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
    os: realInfo.tipoDispositivo.includes('iPhone') ? 'iOS 17' : realInfo.tipoDispositivo.includes('Web') ? 'Windows 11' : 'Android 14'
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

*🕵️‍♂️ DOX BY:* @${senderNumber}

> *𝛥𝐗𝐈𝚶𝚩 𝚩𝚯𝐓*`;
}
