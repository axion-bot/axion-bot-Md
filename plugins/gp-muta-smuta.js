import { createCanvas, loadImage } from 'canvas';

const handler = async (m, { conn, command, text, isAdmin }) => {
  const BOT_OWNERS = (global.owner || []).map(o => o[0] + '@s.whatsapp.net');
  let mentionedJid = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!mentionedJid && text) {
    let number = text.replace(/[^0-9]/g, '');
    if (number.length >= 8) mentionedJid = number + '@s.whatsapp.net';
  }

  const chatId = m.chat;
  const botNumber = conn.user.jid;

  let groupOwner = null;
  try {
    const metadata = await conn.groupMetadata(chatId);
    groupOwner = metadata.owner;
  } catch { groupOwner = null }

  if (!isAdmin) throw '⚠️ Solo gli amministratori possono usare questo comando.';
  if (!mentionedJid) return m.reply(`💡 *Esempio:* .${command} @tag`);

  if ([groupOwner, botNumber, ...BOT_OWNERS].includes(mentionedJid))
    throw '🛡️ *ERRORE:* Impossibile mutare un superiore (Owner/Bot).';

  if (!global.db.data.users[mentionedJid]) global.db.data.users[mentionedJid] = { muto: false };
  const user = global.db.data.users[mentionedJid];
  const isMute = command === 'muta';
  const tag = '@' + mentionedJid.split('@')[0];

  if (isMute) {
    if (user.muto) throw '🔇 L\'utente è già mutato.';
    user.muto = true;
  } else {
    if (!user.muto) throw '🔊 L\'utente non è mutato.';
    user.muto = false;
  }

  // --- GENERAZIONE CANVAS ---
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // Sfondo scuro elegante
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, 800, 300);

  // Barra laterale colorata (Rosso per mute, Verde per smuta)
  ctx.fillStyle = isMute ? '#ff4b5c' : '#4bffb3';
  ctx.fillRect(0, 0, 15, 300);

  // Caricamento Foto Profilo
  let pp;
  try { pp = await conn.profilePictureUrl(mentionedJid, 'image') } catch { pp = 'https://i.imgur.com/8K9mXz4.png' }
  const avatar = await loadImage(pp);
  
  // Maschera Circolare per la foto
  ctx.save();
  ctx.beginPath();
  ctx.arc(160, 150, 90, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 70, 60, 180, 180);
  ctx.restore();

  // Testo Principale
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px sans-serif';
  ctx.fillText(isMute ? 'MUTE ATTIVATO' : 'MUTE RIMOSSO', 300, 110);
  
  // Info Utente
  ctx.font = '30px sans-serif';
  ctx.fillStyle = '#bbbbbb';
  ctx.fillText(`Utente: ${mentionedJid.split('@')[0]}`, 300, 165);
  
  // Badge Stato (Sostituito l'emoji con un pallino pieno per evitare bug grafici)
  ctx.fillStyle = isMute ? '#ff4b5c' : '#4bffb3';
  ctx.beginPath();
  ctx.arc(315, 220, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(isMute ? 'SILENZIATO' : 'ATTIVO', 345, 235);

  // --- INVIO ---
  const caption = isMute 
    ? `『 *SISTEMA MODERAZIONE* 』\n\n🛑 *Utente:* ${tag}\n⚖️ *Stato:* Silenziato\n🛡️ *Admin:* @${m.sender.split('@')[0]}`
    : `『 *SISTEMA MODERAZIONE* 』\n\n✅ *Utente:* ${tag}\n⚖️ *Stato:* Riabilitato\n🔔 *Info:* Può tornare a scrivere.`;

  await conn.sendMessage(chatId, { 
    image: canvas.toBuffer(), 
    caption: caption,
    mentions: [mentionedJid, m.sender]
  }, { quoted: m });
};

handler.command = /^(muta|smuta)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
