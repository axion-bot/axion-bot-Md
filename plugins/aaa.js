let axios, cheerio;
let ready = false;

try {
  axios = (await import('axios')).default;
  cheerio = await import('cheerio');
  ready = true;
} catch (e) {
  console.log("Errore librerie");
}

const baseUrl = 'https://receive-sms-online.info';

const headers = {
  'User-Agent': 'Mozilla/5.0'
};

const countries = [
  { name: 'USA 🇺🇸', path: '/us' },
  { name: 'UK 🇬🇧', path: '/uk' },
  { name: 'Francia 🇫🇷', path: '/fr' },
  { name: 'Germania 🇩🇪', path: '/de' },
  { name: 'Spagna 🇪🇸', path: '/es' }
];

async function getNumbers(path) {
  try {
    const { data } = await axios.get(baseUrl + path, { headers });
    const $ = cheerio.load(data);

    let nums = [];

    $('a').each((i, el) => {
      let t = $(el).text().trim();
      if (t.includes('+')) {
        nums.push(t.replace(/[^0-9]/g, ''));
      }
    });

    return [...new Set(nums)];
  } catch {
    return [];
  }
}

async function getSMS(num) {
  try {
    const { data } = await axios.get(`${baseUrl}/${num}`, { headers });
    const $ = cheerio.load(data);

    let msgs = [];

    $('table tr').each((i, el) => {
      let from = $(el).find('td').eq(0).text().trim();
      let text = $(el).find('td').eq(1).text().trim();
      let time = $(el).find('td').eq(2).text().trim();

      if (text) msgs.push({ from, text, time });
    });

    return msgs;
  } catch {
    return [];
  }
}

let sessions = {}; 

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!ready) return m.reply("❌ Librerie mancanti.");

  let user = m.sender;

  // 🌍 MENU PAESI
  if (!args[0]) {
    let txt = `🌍 *SCEGLI PAESE*\n\n`;
    countries.forEach((c, i) => {
      txt += `${i + 1}. ${c.name}\n`;
    });

    txt += `\n💡 Usa: ${usedPrefix}voip <numero paese>`;

    return m.reply(txt);
  }

  if (!isNaN(args[0])) {
    let index = parseInt(args[0]) - 1;
    let country = countries[index];

    if (!country) return m.reply("❌ Paese non valido");

    let nums = await getNumbers(country.path);
    if (nums.length === 0) return m.reply("❌ Nessun numero");

    sessions[user] = {
      country,
      nums,
      current: 0
    };

    let num = nums[0];

    return conn.sendMessage(m.chat, {
      text: `📱 *NUMERO ATTIVO*\n\n🌍 ${country.name}\n📲 +${num}`,
      buttons: [
        { buttonId: `${usedPrefix}voip next`, buttonText: { displayText: '🔄 Cambia Numero' }, type: 1 },
        { buttonId: `${usedPrefix}voip sms`, buttonText: { displayText: '📩 Controlla SMS' }, type: 1 },
        { buttonId: `${usedPrefix}voip`, buttonText: { displayText: '🌍 Cambia Paese' }, type: 1 }
      ],
      headerType: 1
    });
  }

  if (args[0] === 'next') {
    let session = sessions[user];
    if (!session) return m.reply("❌ Seleziona prima un paese");

    session.current++;
    if (session.current >= session.nums.length) session.current = 0;

    let num = session.nums[session.current];

    return conn.sendMessage(m.chat, {
      text: `📱 *NUOVO NUMERO*\n\n🌍 ${session.country.name}\n📲 +${num}`,
      buttons: [
        { buttonId: `${usedPrefix}voip next`, buttonText: { displayText: '🔄 Cambia Numero' }, type: 1 },
        { buttonId: `${usedPrefix}voip sms`, buttonText: { displayText: '📩 Controlla SMS' }, type: 1 },
        { buttonId: `${usedPrefix}voip`, buttonText: { displayText: '🌍 Cambia Paese' }, type: 1 }
      ],
      headerType: 1
    });
  }

  if (args[0] === 'sms') {
    let session = sessions[user];
    if (!session) return m.reply("❌ Nessuna sessione");

    let num = session.nums[session.current];
    let msgs = await getSMS(num);

    if (msgs.length === 0) return m.reply("❌ Nessun SMS");

    let txt = `📩 *SMS +${num}*\n\n`;

    msgs.slice(0, 5).forEach(m => {
      txt += `👤 ${m.from}\n💬 ${m.text}\n🕒 ${m.time}\n──────\n`;
    });

    return m.reply(txt);
  }
};

handler.help = ['voip'];
handler.tags = ['tools'];
handler.command = /^(voip)$/i;

export default handler;