import cron from 'node-cron';
import fs from 'fs';

// Funzione sicura per caricare i promemoria
const loadReminders = () => {
    try {
        if (!fs.existsSync('./reminders.json')) {
            fs.writeFileSync('./reminders.json', '[]');
            return [];
        }
        return JSON.parse(fs.readFileSync('./reminders.json', 'utf8') || '[]');
    } catch (e) {
        return [];
    }
};

let reminders = loadReminders();

let handler = async (m, { conn, text }) => {
    let [time, ...msg] = text.split(' ');
    if (!time || !msg.length) return m.reply("Uso: .ricorda [HH:MM] [messaggio]");

    let reminder = { time, text: msg.join(' '), chat: m.chat };
    reminders.push(reminder);
    fs.writeFileSync('./reminders.json', JSON.stringify(reminders));

    m.react('🧠');
    m.reply(`『 🧠 』- *Promemoria impostato per le ${time}!*\n𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 terrà traccia.`);
};

handler.command = ['ricorda'];
export default handler;

// Schedulatore
cron.schedule('* * * * *', async () => {
    let now = new Date();
    let currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');

    let toKeep = [];
    for (let r of reminders) {
        if (r.time === currentTime) {
            if (global.conn) {
                await global.conn.sendMessage(r.chat, { text: `『 ⏰ 』- *Promemoria per 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓:*\n${r.text}` });
            }
        } else {
            toKeep.push(r);
        }
    }

    if (toKeep.length !== reminders.length) {
        reminders = toKeep;
        fs.writeFileSync('./reminders.json', JSON.stringify(reminders));
    }
});
