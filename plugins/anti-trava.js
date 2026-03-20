let handler = m => m
const ZALGO_REGEX = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]{3,}/g;
function extractText(m) {
    if (!m) return '';
    let text = m.text || m.caption || '';
    if (m.message?.pollCreationMessageV3?.name) {
        text += ' ' + m.message.pollCreationMessageV3.name;
        m.message.pollCreationMessageV3.options?.forEach(opt => text += ' ' + opt.optionName);
    }
    if (m.message?.pollCreationMessage?.name) {
        text += ' ' + m.message.pollCreationMessage.name;
        m.message.pollCreationMessage.options?.forEach(opt => text += ' ' + opt.optionName);
    }
    return text;
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup || !m.sender) return false;
    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antitrava) return true;
    if (isAdmin || isOwner || isSam || m.fromMe) return true;
    const text = extractText(m);
    if (!text) return true;
    const isTooLong = text.length > 4000;
    const zalgoMatches = text.match(ZALGO_REGEX) || [];
    const isZalgo = zalgoMatches.length > 5;

    if (isTooLong || isZalgo) {
        await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});
        if (isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(console.error);
        }
        const userTag = m.sender.split('@')[0];
        const reason = isTooLong ? 'Messaggio troppo lungo' : 'Trava nel grande 2026';
        await conn.sendMessage(m.chat, {
            text: `『 🚫 』 \`Trava rilevato\`\n\n➤ \`Utente:\` @${userTag}\n➤ \`Azione:\` Rimosso dal gruppo\n➤ \`Motivo:\` ${reason}`,
            mentions: [m.sender]
        });

        return true;
    }

    return true;
}

export default handler;