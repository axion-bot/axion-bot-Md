import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = 'USf7330ed821df3dc9a3212aefaa1425b8';
const TWILIO_AUTH_TOKEN = '755Q2TFN611F39CX6AVZLR8S';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*🔍 USO:* ${usedPrefix}${command} <numero>\n*Esempio:* ${usedPrefix}${command} +393471234567`);
  }

  let phoneNumber = args.join(' ').trim().replace(/[\s\-\(\)]/g, '');
  if (!phoneNumber.startsWith('+')) {
    if (phoneNumber.startsWith('3') && phoneNumber.length === 10) {
      phoneNumber = '+39' + phoneNumber;
    } else {
      return m.reply('*⚠️ Specifica il prefisso internazionale.* Es: `+39347...`');
    }
  }

  await m.react('⏳');

  try {
    const lookup = await client.lookups.v2.phoneNumbers(phoneNumber).fetch({
      fields: ['line_type_intelligence', 'identity_match']
    });

    const carrierData = lookup.lineTypeIntelligence || {};
    const identityData = lookup.identityMatch || {};

    let replyMsg = `*📱 OSINT LOOKUP v2*\n`;
    replyMsg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    replyMsg += `• *Numero Formattato:* \`${lookup.phoneNumber}\`\n\n`;

    replyMsg += `*📊 INTELLIGENCE LINEA:*\n`;
    replyMsg += `• *Operatore (Carrier):* ${carrierData.carrier_name || 'Non disponibile'}\n`;
    replyMsg += `• *Tipo di Linea:* ${carrierData.line_type || 'Sconosciuto'} _(mobile, landline, voip)_\n`;
    replyMsg += `• *Codice Paese:* ${lookup.countryCode || 'N/A'}\n`;
    replyMsg += `• *Codice Mobile Nazionale (MNC):* ${carrierData.mobile_network_code || 'N/A'}\n`;
    replyMsg += `• *Codice Paese Mobile (MCC):* ${carrierData.mobile_country_code || 'N/A'}\n\n`;

    replyMsg += `*👤 ANAGRAFICA REALE (Se disponibile):*\n`;
    replyMsg += `• *Intestatario stimato:* ${identityData.first_name || ''} ${identityData.last_name || 'Non censito o Privato'}\n`;
    replyMsg += `• *Tipo di entità:* ${identityData.type || 'N/A'} _(individuale / business)_\n\n`;

    replyMsg += `*🌐 COPERTURA SOCIAL NETWORK:*\n`;
    replyMsg += `• *Nota:* Le API di telefonia non espongono account Instagram/Telegram per motivi di privacy.\n`;
    replyMsg += `💡 _Consiglio OSINT:_ Per verificare manualmente i social, puoi provare a salvare il numero in rubrica per vedere se appare su Telegram/WhatsApp o simulare un recupero password su Instagram.\n\n`;

    replyMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    replyMsg += `> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`;

    await m.reply(replyMsg.trim());
    await m.react('✅');

  } catch (error) {
    console.error(error);
    await m.react('❌');
    m.reply(`*❌ Errore durante il lookup Twilio:* ${error.message}\n_(Verifica che le credenziali SID/Token siano valide e che il numero sia nel formato corretto)_`);
  }
};

handler.help = ['twlookup'];
handler.tags = ['tools', 'osint'];
handler.command = /^(twlookup|twilio-check|osintnum)$/i;

export default handler;
