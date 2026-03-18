// plugins/all-tools-meteo.js
import axios from "axios";

const API_KEY = "2d61a72574c11c4f36173b627f8cb177";

// BOLD UNICODE
function boldUnicode(s = '') {
  let o = '';
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0x41 && c <= 0x5A) o += String.fromCodePoint(0x1D400 + (c - 0x41));
    else if (c >= 0x61 && c <= 0x7A) o += String.fromCodePoint(0x1D41A + (c - 0x61));
    else if (c >= 0x30 && c <= 0x39) o += String.fromCodePoint(0x1D7CE + (c - 0x30));
    else o += ch;
  }
  return o;
}

// scarica la thumb (piccola, già ottimizzata)
const ICON_URL = "https://i.imgur.com/JbQ9mQK.png"
function fetchBuf (url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error('HTTP '+res.statusCode))
      const chunks = []
      res.on('data', d => chunks.push(d))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

// costruisce l’header con thumb a destra
async function buildHeaderWithThumb (title) {
  let thumb = null
  try { thumb = await fetchBuf(ICON_URL) } catch {}
  return {
    key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'CTX' },
    message: {
      locationMessage: {
        name: boldUnicode(title),
        ...(thumb ? { jpegThumbnail: thumb } : {})
      }
    },
    participant: '0@s.whatsapp.net'
  }
}


function getBody(m) {
  return (
    m?.message?.extendedTextMessage?.text ||
    m?.message?.conversation ||
    m?.text ||
    ""
  ).trim();
}

export default async function handler(m, { conn, text }) {
  const chat = m.chat || m.key?.remoteJid;
  if (!chat) return;

  let city = (text ?? "").trim();

  if (!city) {
    const body = getBody(m);
    city = body.replace(/^\.(?:meteo)\s*/i, "").trim();
  }

  if (!city) {
    const q = buildContextMsg("*meteo*");
    await conn.sendMessage(chat, {
      text: `${boldUnicode("*⚠️ Devi inserire una città.*")}\n\n${boldUnicode("Esempio:")}\n\`${boldUnicode(".meteo Roma")}\``
    }, { quoted: q });
    return;
  }

  try {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric&lang=it`;

    const res = await axios.get(url);
    const d = res.data;

    const header =
`╭━『 ☁️ ${boldUnicode("METEO")} 』━╮
📍 ${boldUnicode("Località:")} ${boldUnicode(d.name)}, ${boldUnicode(d.sys?.country || "")}
╰━━━━━━━━━━━━━━━━╯`;

    const msg = [
      header,
      ``,
      `${boldUnicode("*🌡 Temperatura:*")} ${Math.round(d.main.temp)}°C`,
      `${boldUnicode("*🌡 Percepita:*")} ${Math.round(d.main.feels_like)}°C`,
      `${boldUnicode("*🔺 Min / Max:*")} ${Math.round(d.main.temp_min)}°C • ${Math.round(d.main.temp_max)}°C`,
      `${boldUnicode("*💧 Umidità:*")} ${d.main.humidity}%`,
      `${boldUnicode("*☁ Condizioni:*")} ${boldUnicode(d.weather?.[0]?.main || "-")}`,
      `${boldUnicode("*🌫 Descrizione:*")} ${boldUnicode(d.weather?.[0]?.description || "-")}`,
      `${boldUnicode("*💨 Vento:*")} ${d.wind?.speed ?? 0} m/s`,
      `${boldUnicode("*🔽 Pressione:*")} ${d.main.pressure} hPa`,
      ``,
      `> ® ${boldUnicode("Dev by Bonzino")}`
    ].join("\n");

    const q = buildContextMsg("*meteo*");

await conn.sendMessage(
  chat,
  {
    text: msg,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      externalAdReply: {
        title: boldUnicode("Meteo aggiornato ☀️"),
        body: "",
        mediaType: 1,
        thumbnailUrl: "https://i.imgur.com/JbQ9mQK.png", 
        renderLargerThumbnail: false,
        showAdAttribution: false,
      }
    }
  },
  { quoted: m }
);


  } catch (e) {
    const q = buildContextMsg("*meteo*");

    if (e?.response?.status === 404) {
      await conn.sendMessage(chat, {
        text: boldUnicode("*🚫 Città non trovata. Controlla la scrittura e riprova.*")
      }, { quoted: q });
    } else {
      await conn.sendMessage(chat, {
        text: boldUnicode("*⚠️ Errore nel recupero dei dati. Riprova più tardi.*")
      }, { quoted: q });
    }
  }
}

export const command = /^(?:meteo)$/i;
export const help = ["meteo <città>"];
export const tags = ["tools"];
