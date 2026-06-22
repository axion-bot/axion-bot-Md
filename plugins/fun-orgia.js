/* plugin orgia by blood
   edit by Bonzino */
   
import fs from 'fs'
import path from 'path'

global.orgiaLobby = global.orgiaLobby || {}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const pickRandom = arr =>
  arr[Math.floor(Math.random() * arr.length)]

const tag = jid =>
  '@' + String(jid || '').split('@')[0]

const randomEvent = players => {
  let a = pickRandom(players)
  let b = pickRandom(players.filter(x => x !== a))

  const eventi = [
    `*💦 𝐒𝐎𝐑𝐏𝐑𝐄𝐒𝐀 𝐀𝐍𝐀𝐋𝐄: ${tag(a)} sbaglia buco e infila un vibratore XXL a ${tag(b)} senza lubrificante!*`,
    `*👅 𝐋𝐄𝐂𝐂𝐀𝐓𝐀 𝐒𝐄𝐋𝐕𝐀𝐆𝐆𝐈𝐀: ${tag(a)} si fionda a lingua spiegata sulle palle di ${tag(b)} come se non ci fosse un domani!*`,
    `*🍑 𝐒𝐏𝐀𝐍𝐊𝐈𝐍𝐆: ${tag(a)} tira uno schiaffone sul culo di ${tag(b)} che lascia il segno rosso per i prossimi tre giorni!*`,
    `*😮 𝐆𝐎𝐋𝐀 𝐏𝐑𝐎𝐅𝐎𝐍𝐃𝐀: ${tag(a)} fa un pompino atomico a ${tag(b)} fino a farsi venire i lacrimoni agli occhi!*`,
    `*🥖 𝐃𝐎𝐏𝐏𝐈𝐀 𝐏𝐄𝐍𝐄𝐓𝐑𝐀𝐙𝐈𝐎𝐍𝐄: ${tag(a)} e ${tag(b)} si coordinano per sfondare lo stesso orifizio contemporaneamente!*`,
    `*💦 𝐒𝐐𝐔𝐈𝐑𝐓𝐈𝐍𝐆 𝐎𝐕𝐔𝐍𝐐𝐔𝐄: ${tag(a)} squirta con la potenza di un idrante bagnando completamente la faccia di ${tag(b)}!*`,
    `*🧎 𝟔𝟗 𝐀𝐂𝐑𝐎𝐁𝐀𝐓𝐈𝐂𝐎: ${tag(a)} e ${tag(b)} si incastrano in un 69 così violentemente che serve l'intervento del 118!*`,
    `*🧴 𝐅𝐄𝐓𝐈𝐂𝐇 𝐄𝐒𝐓𝐑𝐄𝐌𝐎: ${tag(a)} si fa pisciare addosso da ${tag(b)} urlando che è l'estasi dell'oro calco!*`,
    `*🔥 𝐂𝐎𝐌𝐎𝐃𝐈𝐍𝐎 𝐃𝐄𝐋 𝐏𝐀𝐍𝐈𝐂𝐎: ${tag(a)} tira fuori le manette e lega ${tag(b)} alla testata del letto sferzandolo col frustino!*`,
    `*💥 𝐒𝐅𝐎𝐍𝐃𝐀𝐌𝐄𝐍𝐓𝐎: ${tag(a)} spinge così forte dentro ${tag(b)} da fargli sbattere la testa contro il muro!*`,
    `*🍌 𝐒𝐔𝐂𝐂𝐇𝐈𝐎𝐍𝐄: ${tag(a)} divora la cappella di ${tag(b)} come se fosse un Chupa Chups al gusto porno!*`,
    `*🥵 𝐀𝐍𝐀𝐋 𝐓𝐑𝐀𝐈𝐍: ${tag(a)} si accoda dietro ${tag(b)} creando un trenino umano di penetrazioni a catena!*`,
    `*👃 𝐅𝐀𝐂𝐄𝐒𝐈𝐓𝐓𝐈𝐍𝐆: ${tag(a)} si siede con tutta la passera bagnata sulla bocca di ${tag(b)} impedendogli di respirare!*`,
    `*🥛 𝐒𝐁𝐎𝐑𝐑𝐀𝐓𝐀 𝐈𝐍 𝐅𝐀𝐂𝐂𝐈𝐀: ${tag(a)} viene con un getto potentissimo dritto sugli occhi di ${tag(b)} accecandolo!*`,
    `*👉 𝐅𝐈𝐒𝐓𝐈𝐍𝐆 𝐀𝐓𝐓𝐀𝐂𝐊: ${tag(a)} si infila i guanti di lattice e prova a infilare tutta la mano dentro ${tag(b)}!*`,
    `*🤐 𝐈𝐍𝐆𝐎𝐈𝐎 𝐓𝐎𝐓𝐀𝐋𝐄: ${tag(a)} ripulisce fino all'ultima goccia il liquido seminale di ${tag(b)} senza sputare nulla!*`,
    `*🚨 𝐑𝐎𝐓𝐓𝐔𝐑𝐀 𝐂𝐎𝐍𝐃𝐎𝐌: ${tag(a)} sente un "CRACK" dentro ${tag(b)}: il preservativo si è rotto, è panico da fecondazione!*`,
    `*🤤 𝐂𝐔𝐌𝐒𝐋𝐔𝐓: ${tag(a)} implora ${tag(b)} di sborrargli sul petto per poi usarla come crema idratante!*`,
    `*🎭 𝐒𝐀𝐃𝐎𝐌𝐀𝐒𝐎: ${tag(a)} infila un plug anale con la coda da volpe a ${tag(b)} e lo frusta sulle chiappe nude!*`,
    `*🤫 𝐃𝐈𝐕𝐎𝐑𝐀𝐓𝐎𝐑𝐈: ${tag(a)} affonda la faccia nell'ano di ${tag(b)} praticando un rimming da campionato mondiale!*`,
    `*🤰 𝐒𝐄𝐌𝐄 𝐋𝐈𝐁𝐄𝐑𝐎: ${tag(a)} viene dentro ${tag(b)} senza pietà urlando: "Questo giro lo teniamo!"*`,
    `*🔮 𝐆𝐈𝐎𝐂𝐇𝐈 𝐃𝐈 𝐋𝐈𝐍𝐆𝐔𝐀: ${tag(a)} stimola il clitoride di ${tag(b)} a una velocità tale da fargli vedere la Madonna!*`,
    `*🦵 𝐆𝐀𝐌𝐁𝐄 𝐀𝐈 𝐏𝐈𝐙𝐙𝐈: ${tag(a)} piega le gambe di ${tag(b)} dietro le orecchie per pompare più a fondo!*`,
    `*🍾 𝐒𝐓𝐀𝐏𝐏𝐎 𝐄𝐑𝐎𝐓𝐈𝐂𝐎: ${tag(a)} usa il collo di una bottiglia di spumante per allargare le velleità di ${tag(b)}!*`,
    `*🤮 𝐆𝐀𝐆 𝐑𝐄𝐅𝐋𝐄𝐗: ${tag(a)} infila la mazza così in fondo a ${tag(b)} da fargli rimettere l'aperitivo sul letto!*`,
    `*🐆 𝐏𝐎𝐒𝐈𝐙𝐈𝐎𝐍𝐄 𝐃𝐄𝐋 𝐂𝐀𝐍𝐄: ${tag(a)} prende da dietro ${tag(b)} a ritmo di techno pesante spingendo come un toro!*`,
    `*🧴 𝐋𝐔𝐁𝐑𝐈𝐅𝐈𝐂𝐀𝐍𝐓𝐄 𝐀𝐋 𝐏𝐄𝐏𝐄𝐑𝐎𝐍𝐂𝐈𝐍𝐎: ${tag(a)} sbaglia gel e brucia letteralmente le mucose intime di ${tag(b)}!*`,
    `*👀 𝐕𝐎𝐘𝐄𝐔𝐑: ${tag(a)} si masturba furiosamente guardando ${tag(b)} mentre viene violentemente posseduto!*`,
    `*💦 𝐂𝐔𝐌𝐒𝐇𝐎𝐓 𝐂𝐎𝐋𝐋𝐄𝐓𝐓𝐈𝐕𝐎: ${tag(a)} raccoglie la sborra di tutti e la spalma sulla schiena di ${tag(b)}!*`,
    `*🩲 𝐒𝐓𝐑𝐀𝐏𝐏𝐎 𝐂𝐎𝐋 𝐃𝐄𝐍𝐓𝐄: ${tag(a)} strappa col morso il perizoma di pizzo di ${tag(b)} sputando i fili di nylon!*`,
    `*🍆 𝐄𝐑𝐄𝐙𝐈𝐎𝐍𝐄 𝐌𝐎𝐍𝐒𝐓𝐄𝐑: ${tag(a)} sfoggia un'asta così venosa e gonfia che ${tag(b)} trema solo a vederla!*`,
    `*🎪 𝐊𝐀𝐌𝐀𝐒𝐔𝐓𝐑𝐀 𝐂𝐈𝐑𝐂𝐄𝐍𝐒𝐄: ${tag(a)} tenta un ribaltamento erotico su ${tag(b)} ma finisce per bloccarsi la schiena dentro di lui!*`,
    `*🍓 𝐂𝐀𝐏𝐄𝐙𝐙𝐎𝐋𝐈 𝐃𝐈 𝐅𝐔𝐎𝐂𝐎: ${tag(a)} morde e tasta i capezzoli di ${tag(b)} fino a fargli cacciare urla da porno asiatico!*`,
    `*🤯 𝐎𝐑𝐆𝐀𝐒𝐌𝐎 𝐒𝐇𝐎𝐂𝐊: ${tag(a)} viene così duro dentro ${tag(b)} che entrambi svengono sul materasso per 30 secondi!*`,
    `*🌊 𝐌𝐀𝐑𝐄𝐀 𝐃𝐈 𝐒𝐔𝐂𝐇𝐈: ${tag(a)} lascia una scia di succhielli viola sulla fessa e sulle cosce di ${tag(b)}!*`,
    `*👅 𝐁𝐀𝐂𝐈𝐎 𝐀𝐋𝐋𝐀 𝐅𝐑𝐀𝐍𝐂𝐄𝐒𝐄... 𝐆𝐈𝐔̀: ${tag(a)} infila la lingua fin dentro l'utero di ${tag(b)} cercando petrolio!*`,
    `*🛒 𝐒𝐄𝐗 𝐓𝐎𝐘 𝐒𝐀𝐁𝐎𝐓𝐀𝐆𝐄: ${tag(a)} spinge il vibratore telecomandato di ${tag(b)} alla massima potenza facendolo sobbalzare!*`,
`*🥵 𝐒𝐂𝐀𝐌𝐁𝐈𝐎 𝐃𝐈 𝐅𝐋𝐔𝐈𝐃𝐈: ${tag(a)} sputa la sborra di un altro direttamente nella bocca aperta di ${tag(b)}!*`,
`*👊 𝐒𝐏𝐀𝐍𝐊 𝐌𝐄 𝐇𝐀𝐑𝐃𝐄𝐑: ${tag(a)} implora ${tag(b)} di prenderlo a schiaffi sulla nerchia finché non diventa viola!*`,
`*🧬 𝐒𝐄𝐌𝐄 𝐍𝐄𝐋𝐋'𝐎𝐂𝐂𝐇𝐈𝐎: ${tag(a)} spara il carico estatico dritto nella cornea di ${tag(b)} causando un principio di cecità!*`,
`*🤫 𝐆𝐄𝐌𝐈𝐓𝐈 𝐌𝐎𝐋𝐄𝐒𝐓𝐈: ${tag(a)} urla insulti porno pesantissimi nell'eccitazione di ${tag(b)} durante l'atto!*`,
`*🦪 𝐂𝐀𝐂𝐂𝐈𝐀 𝐀𝐋𝐋𝐀 𝐏𝐄𝐑𝐋𝐀: ${tag(a)} infila due dita bagnate nel retrobottega di ${tag(b)} cercando il punto G anale!*`,
`*🛋️ 𝐒𝐔𝐋 𝐃𝐈𝐕𝐀𝐍𝐎: ${tag(a)} ribalta ${tag(b)} sui braccioli e comincia a pompare con la foga di un attore di Pornhub!*`,
`*💦 𝐒𝐐𝐔𝐈𝐑𝐓 𝐓𝐒𝐔𝐍𝐀𝐌𝐈: ${tag(a)} lancia un getto vaginale così violento che lava letteralmente la faccia a ${tag(b)}!*`,
`*🧴 𝐁𝐔𝐂𝐎 𝐔𝐍𝐓𝐎: ${tag(a)} svuota un intero flacone di vaselina sul fondoschiena di ${tag(b)} ed entra senza bussare!*`,
`*🍌 𝐃𝐄𝐄𝐏𝐓𝐇𝐑𝐎𝐀𝐓 𝐂𝐇𝐀𝐋𝐋𝐄𝐍𝐆𝐄: ${tag(a)} inghiotte l'uccello di ${tag(b)} fino alla base, rischiando il soffocamento!*`,
`*🥵 𝐌𝐎𝐒𝐒𝐀 𝐃𝐄𝐋𝐋'𝐄𝐋𝐈𝐂𝐎𝐓𝐓𝐄𝐑𝐎: ${tag(a)} gira la nerchia in aria e colpisce la faccia di ${tag(b)} a mo' di schiaffo bagnato!*`,
`*🤤 𝐆𝐎𝐂𝐂𝐈𝐎𝐋𝐀𝐌𝐄𝐍𝐓𝐎: ${tag(a)} lascia colare i propri liquidi intimi sulla bocca bramosa di ${tag(b)}!*`,
`*👑 𝐑𝐄 𝐃𝐄𝐋 𝐏𝐄𝐆𝐆𝐈𝐍𝐆: ${tag(a)} indossa uno strap-on gigantesco e punisce brutalmente il culo di ${tag(b)}!*`,
    `*🔥 𝐒𝐓𝐑𝐀𝐆𝐄 𝐃𝐈 𝐎𝐑𝐆𝐀𝐒𝐌𝐈: ${tag(a)} e ${tag(b)} vengono insieme gridando come ossessi e bagnando tutto il pavimento!*`,
    
    `*🛸 𝐓𝐑𝐈𝐎 𝐒𝐏𝐀𝐙𝐈𝐀𝐋𝐄:* ${tag(a)} e ${tag(b)} si uniscono per fare un sandwich umano devastante a ${tag(players.filter(x => x !== a && x !== b)[0] || b)}!`,
    `*🚅 𝐓𝐑𝐄𝐍𝐈𝐍𝐎 𝐀𝐋𝐓𝐀 𝐕𝐄𝐋𝐎𝐂𝐈𝐓𝐀̀: ${tag(a)} spinge dentro ${tag(b)}, che a sua volta è penetrato da ${tag(players.filter(x => x !== a && x !== b)[0] || a)}, creando un convoglio di puro piacere!`,
    `*💦 𝐄𝐑𝐔𝐙𝐈𝐎𝐍𝐄 𝐂𝐎𝐋𝐋𝐄𝐓𝐓𝐈𝐕𝐀: ${tag(a)}, ${tag(b)} e ${tag(players.filter(x => x !== a && x !== b)[0] || a)} circondano ${tag(players.filter(x => x !== a && x !== b)[1] || b)} sborrandogli contemporaneamente sul viso!`,
    `*🌀 𝐈𝐋 𝐕𝐎𝐑𝐓𝐈𝐂𝐄 𝐃𝐈 𝐋𝐈𝐍𝐆𝐔𝐄: ${tag(a)}, ${tag(b)}, ${tag(players.filter(x => x !== a && x !== b)[0] || a)} e ${tag(players.filter(x => x !== a && x !== b)[1] || b)} si incastrano in un cerchio perfetto leccandosi a vicenda senza sosta!`,
    `*🎰 𝐉𝐀𝐂𝐊𝐏𝐎𝐓 𝐄𝐑𝐎𝐓𝐈𝐂𝐎: ${tag(a)} tiene fermo ${tag(b)} mentre ${tag(players.filter(x => x !== a && x !== b)[0] || a)} e ${tag(players.filter(x => x !== a && x !== b)[1] || b)} lo riempiono di sex toys da ogni lato!`,
    `*🧬 𝐌𝐀𝐗𝐈-𝐀𝐌𝐌𝐔𝐂𝐂𝐇𝐈𝐀𝐓𝐀:* L'intero gruppo composto da ${tag(a)}, ${tag(b)}, ${tag(players.filter(x => x !== a && x !== b)[0] || a)}, ${tag(players.filter(x => x !== a && x !== b)[1] || b)} e ${tag(players.filter(x => x !== a && x !== b)[2] || a)} crolla sul letto in un ammasso informe di sperma e sudore!*`,
    `*🤹 𝐌𝐄𝐍𝐀𝐆𝐄 𝐀 𝐐𝐔𝐀𝐓𝐓𝐑𝐎:* ${tag(a)} e ${tag(b)} si alternano freneticamente a penetrare ${tag(players.filter(x => x !== a && x !== b)[0] || a)} sotto gli incitamenti perversi di ${tag(players.filter(x => x !== a && x !== b)[1] || b)}!`,
    `*🏯 𝐓𝐎𝐑𝐑𝐄 𝐃𝐈 𝐏𝐈𝐒𝐀:* ${tag(a)} sale sulla sedia e salta a bomba sul pacco di ${tag(b)}, mentre ${tag(players.filter(x => x !== a && x !== b)[0] || a)} fotografa la scena col flash attivato!`,
    `*🍕 𝐆𝐈𝐎𝐂𝐎 𝐃𝐄𝐋𝐋𝐀 𝐏𝐈𝐙𝐙𝐀:* ${tag(a)} spalma del formaggio fuso sulla schiena di ${tag(b)}, costringendo ${tag(players.filter(x => x !== a && x !== b)[0] || a)} e ${tag(players.filter(x => x !== a && x !== b)[1] || b)} a ripulire tutto a colpi di lingua bagnata!`,
    `*🤸 𝐎𝐑𝐆𝐈𝐀 𝐀𝐂𝐑𝐎𝐁𝐀𝐓𝐈𝐂𝐀:* ${tag(a)} viene sollevato in aria da ${tag(b)} e ${tag(players.filter(x => x !== a && x !== b)[0] || a)} per permettere a ${tag(players.filter(x => x !== a && x !== b)[1] || b)} un inserimento al millimetro!`,
    `*🚿 𝐃𝐎𝐂𝐂𝐈𝐀 𝐃'𝐎𝐑𝐎 𝐃𝐈 𝐆𝐑𝐔𝐏𝐏𝐎:* ${tag(a)}, ${tag(b)} e ${tag(players.filter(x => x !== a && x !== b)[0] || a)} aprono i rubinetti intimi in contemporanea allagando il corpo di ${tag(players.filter(x => x !== a && x !== b)[1] || b)}!`,
    `*🧴 𝐁𝐔𝐅𝐅𝐄𝐓 𝐄𝐑𝐎𝐓𝐈𝐂𝐎:* Il fondoschiena di ${tag(a)} diventa un vassoio di panna spray da cui mangiano famelici ${tag(b)}, ${tag(players.filter(x => x !== a && x !== b)[0] || a)} e ${tag(players.filter(x => x !== a && x !== b)[1] || b)}!`,
    `*🐙 𝐋'𝐎𝐓𝐓𝐎𝐏𝐎𝐃𝐄:* ${tag(a)}, ${tag(b)}, ${tag(players.filter(x => x !== a && x !== b)[0] || a)} e ${tag(players.filter(x => x !== a && x !== b)[1] || b)} avvolgono ${tag(players.filter(x => x !== a && x !== b)[2] || a)} con venti mani diverse palpandolo ovunque!`,
    `*🏋️ 𝐒𝐌𝐀𝐒𝐇 𝐁𝐑𝐎𝐓𝐇𝐄𝐑𝐒:* ${tag(a)} e ${tag(b)} placcano sul materasso ${tag(players.filter(x => x !== a && x !== b)[0] || a)} per lasciare via libera alla sborrata atomica di ${tag(players.filter(x => x !== a && x !== b)[1] || b)}!`,
    `*🍧 𝐂𝐄𝐍𝐓𝐑𝐎𝐓𝐀𝐕𝐎𝐋𝐎:* ${tag(a)} si sdraia al centro della stanza mentre ${tag(b)}, ${tag(players.filter(x => x !== a && x !== b)[0] || a)}, ${tag(players.filter(x => x !== a && x !== b)[1] || b)} e ${tag(players.filter(x => x !== a && x !== b)[2] || a)} fanno a gara a chi lo cavalca più velocemente!`,
    `*🎪 𝐂𝐈𝐑𝐂𝐎 𝐌𝐀𝐒𝐒𝐈𝐌𝐎:* Un groviglio totale a 5 vie dove ${tag(a)}, ${tag(b)}, ${tag(players.filter(x => x !== a && x !== b)[0] || a)}, ${tag(players.filter(x => x !== a && x !== b)[1] || b)} e ${tag(players.filter(x => x !== a && x !== b)[2] || a)} perdono il conto di chi sta penetrando chi!`,
    `*🌪️ 𝐓𝐎𝐑𝐍𝐀𝐃𝐎 𝐃𝐈 𝐒𝐁𝐎𝐑𝐑𝐀:* ${tag(a)} coordina un attacco sincronizzato con ${tag(b)} e ${tag(players.filter(x => x !== a && x !== b)[0] || a)} creando una pioggia di sperma su tutto il letto!`,
    `*🎭 𝐒𝐀𝐃𝐎 𝐅𝐄𝐒𝐓 𝐆𝐑𝐔𝐏𝐏𝐎:* ${tag(a)} e ${tag(b)} legano con corde di nylon ${tag(players.filter(x => x !== a && x !== b)[0] || a)} e ${tag(players.filter(x => x !== a && x !== b)[1] || b)} frustando le loro chiappe a turno!`,
    `*👑 𝐆𝐀𝐍𝐆𝐁𝐀𝐍𝐆 𝐑𝐎𝐘𝐀𝐋𝐄:* ${tag(a)} viene incoronato re del set mentre ${tag(b)}, ${tag(players.filter(x => x !== a && x !== b)[0] || a)}, ${tag(players.filter(x => x !== a && x !== b)[1] || b)} e ${tag(players.filter(x => x !== a && x !== b)[2] || a)} abusano felicemente delle sue fessure!`,
    `*🧨 𝐂𝐀𝐏𝐎𝐃𝐀𝐍𝐍𝐎 𝐏𝐎𝐑𝐍𝐎:* Lo spumante erotico esplode: ${tag(a)}, ${tag(b)}, ${tag(players.filter(x => x !== a && x !== b)[0] || a)} e ${tag(players.filter(x => x !== a && x !== b)[1] || b)} urlano all'unisono raggiungendo l'orgasmo finale insieme!`
  ]

  let e = pickRandom(eventi)

const match = e.match(/^\*(.*?)\*\s*$/s)

if (!match) return e

const contenuto = match[1]
const idx = contenuto.indexOf(': ')

if (idx === -1) return e

const titolo = contenuto.slice(0, idx + 1)
const testo = contenuto.slice(idx + 2)

return `*${titolo}*\n\n${testo}`
}

let handler = async (m, { conn, text, command, participants }) => {
  const chatId = m.chat
  if (!chatId) return

  const modeText = (text || '').toLowerCase()

  const isPartecipa = modeText.includes('azione_partecipa')
  const isInizia = modeText.includes('azione_inizia')
  const isPartecipaCmd = /^partecipaorgia$/i.test(command)

  if (/casuale|random/i.test(command)) {
    let groupMembers = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid)

    let randomCount =
      Math.floor(Math.random() * (20 - 3 + 1)) + 3

    let finalCount =
      Math.min(randomCount, groupMembers.length)

    if (finalCount < 3) {
      return conn.sendMessage(chatId, {
        text: '*❌ 𝐄𝐫𝐫𝐨𝐫𝐞: 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐩𝐚𝐫𝐭𝐞𝐜𝐢𝐩𝐚𝐧𝐭𝐢 𝐩𝐞𝐫 𝐥\'𝐨𝐫𝐠𝐢𝐚 𝐝𝐢 𝐠𝐫𝐮𝐩𝐩𝐨!*'
      }, { quoted: m })
    }

    let casualMentions = groupMembers
      .sort(() => Math.random() - 0.5)
      .slice(0, finalCount)

    return runOrgia(
      conn,
      chatId,
      m,
      casualMentions,
      true
    )
  }

if (isPartecipa || isPartecipaCmd) {
    if (!global.orgiaLobby[chatId]) {
      return conn.sendMessage(chatId, {
        text: '*❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐨𝐫𝐠𝐢𝐚 𝐚𝐭𝐭𝐢𝐯𝐚!*'
      }, { quoted: m })
    }

    let lobby = global.orgiaLobby[chatId]
    let clicker = m.sender

    if (lobby.players.includes(clicker)) {
      return conn.sendMessage(chatId, {
        text: `*⚠️ ${tag(clicker)} 𝐞̀ 𝐠𝐢𝐚̀ 𝐢𝐬𝐜𝐫𝐢𝐭𝐭𝐨 𝐚𝐥𝐥'𝐨𝐫𝐠𝐢𝐚!*`
      }, { quoted: m })
    }

    if (lobby.players.length >= 20) {
      return conn.sendMessage(chatId, {
        text: '*🚫 𝐋𝐨𝐛𝐛𝐲 𝐏𝐢𝐞𝐧𝐚! (𝐓𝐫𝐨𝐩𝐩𝐨 𝐚𝐟𝐟𝐨𝐥𝐥𝐚𝐦𝐞𝐧𝐭𝐨 𝐧𝐞𝐥 𝐥𝐞𝐭𝐭𝐨)*'
      }, { quoted: m })
    }

    lobby.players.push(clicker)

    let mancanti = 3 - lobby.players.length

    let statusText =
`*✅ ${tag(clicker)} 𝐬𝐢 𝐞̀ 𝐮𝐧𝐢𝐭𝐨 𝐚𝐥𝐥'𝐨𝐫𝐠𝐢𝐚! 𝐒𝐯𝐞𝐬𝐭𝐢𝐭𝐢!*

*👥 𝐏𝐚𝐫𝐭𝐞𝐜𝐢𝐩𝐚𝐧𝐭𝐢 𝐚𝐥𝐥'𝐀𝐦𝐦𝐮𝐜𝐜𝐡𝐢𝐚𝐭𝐚 (${lobby.players.length}/20):*
${lobby.players.map(p => `• ${tag(p)}`).join('\n')}

${mancanti > 0
? `*⏳ 𝐌𝐚𝐧𝐜𝐚𝐧𝐨 ${mancanti} 𝐩𝐚𝐫𝐭𝐞𝐜𝐢𝐩𝐚𝐧𝐭𝐢 𝐩𝐞𝐫 𝐢𝐥 𝐤𝐚𝐦𝐚𝐬𝐮𝐭𝐫𝐚.*`
: '*🔥 𝐓𝐮𝐭𝐭𝐢 𝐧𝐮𝐝𝐢 𝐞 𝐩𝐫𝐨𝐧𝐭𝐢 𝐚𝐥 𝐜𝐚𝐨𝐬!*'}`

    return conn.sendMessage(chatId,{
      text: statusText,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
buttons: [
  {
    buttonId: '.orgia azione_inizia',
    buttonText: { displayText: '🔥 Inizia Orgia' },
    type: 1
  }
      ],
      headerType: 1,
      mentions: lobby.players
    }, { quoted: m })
  }
  if (isInizia || /iniziaorgia|avviaorgia/i.test(command)) {
    if (!global.orgiaLobby[chatId]) {
      return conn.sendMessage(chatId, {
        text: '*❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐨𝐫𝐠𝐢𝐚 𝐚𝐭𝐭𝐢𝐯𝐚!*'
      }, { quoted: m })
    }

    let lobby = global.orgiaLobby[chatId]
    if (m.sender !== lobby.owner) {
  return conn.sendMessage(chatId, {
    text: `*❌ 𝐒𝐨𝐥𝐨 𝐥'𝐎𝐫𝐠𝐚𝐧𝐢𝐳𝐳𝐚𝐭𝐨𝐫𝐞 ${tag(lobby.owner)} 𝐩𝐮𝐨̀ 𝐚𝐯𝐯𝐢𝐚𝐫𝐞 𝐥'𝐞𝐯𝐞𝐧𝐭𝐨!*`,
    mentions: [lobby.owner]
  }, { quoted: m })
}

    if (lobby.players.length < 3) {
      return conn.sendMessage(chatId, {
        text: `*❌ 𝐒𝐞𝐫𝐯𝐨𝐧𝐨 𝐚𝐥𝐦𝐞𝐧𝐨 𝟑 𝐩𝐞𝐫𝐬𝐨𝐧𝐞 𝐩𝐞𝐫 𝐟𝐚𝐫𝐞 𝐜𝐨𝐬𝐞 𝐚𝐬𝐬𝐮𝐫𝐝𝐞! (${lobby.players.length}/3)*`
      }, { quoted: m })
    }

    let partecipantiFinali = [...lobby.players]

    delete global.orgiaLobby[chatId]

    return runOrgia(
      conn,
      chatId,
      m,
      partecipantiFinali,
      false
    )
  }

  if (global.orgiaLobby[chatId]) {
    return conn.sendMessage(chatId, {
      text: '*⚠️ 𝐄𝐬𝐢𝐬𝐭𝐞 𝐠𝐢𝐚̀ 𝐮𝐧\'𝐨𝐫𝐠𝐢𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨! 𝐍𝐨𝐧 𝐜𝐨𝐧𝐠𝐞𝐬𝐭𝐢𝐨𝐧𝐚𝐫𝐞 𝐢𝐥 𝐥𝐞𝐭𝐭𝐨!*'
    }, { quoted: m })
  }

  global.orgiaLobby[chatId] = {
  owner: m.sender,
  players: [m.sender]
}

  let infoLobby =
`*🍓 𝐋𝐎𝐁𝐁𝐘 𝐃𝐄𝐋𝐋'𝐎𝐑𝐆𝐈𝐀 𝐃𝐈 𝐆𝐑𝐔𝐏𝐏𝐎 🍓*

*𝐈𝐥 𝐥𝐞𝐭𝐭𝐨𝐧𝐞 𝐚 𝐭𝐫𝐞𝐦𝐢𝐥𝐚 𝐩𝐢𝐚𝐳𝐳𝐞 𝐞̀ 𝐩𝐫𝐨𝐧𝐭𝐨!*

*📋 𝐑𝐄𝐆𝐎𝐋𝐄 𝐃𝐄𝐋𝐋'𝐀𝐌𝐌𝐔𝐂𝐂𝐇𝐈𝐀𝐓𝐀*

*• 𝐌𝐢𝐧𝐢𝐦𝐨 𝟑 𝐩𝐚𝐫𝐭𝐞𝐜𝐢𝐩𝐚𝐧𝐭𝐢*
*• 𝐌𝐚𝐬𝐬𝐢𝐦𝐨 𝟐𝟎 𝐩𝐚𝐫𝐭𝐞𝐜𝐢𝐩𝐚𝐧𝐭𝐢 (𝐩𝐞𝐫 𝐦𝐨𝐭𝐢𝐯𝐢 𝐝𝐢 𝐬𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚)*
*• 𝐔𝐬𝐚 .partecipaorgia 𝐩𝐞𝐫 𝐬𝐩𝐨𝐠𝐥𝐢𝐚𝐫𝐭𝐢*

*👑 𝐎𝐫𝐠𝐚𝐧𝐢𝐳𝐳𝐚𝐭𝐨𝐫𝐞:* ${tag(m.sender)}

*🔥 𝐒𝐨𝐥𝐨 𝐥'𝐨𝐫𝐠𝐚𝐧𝐢𝐳𝐳𝐚𝐭𝐨𝐫𝐞 𝐩𝐮𝐨̀ 𝐚𝐯𝐯𝐢𝐚𝐫𝐞 𝐥'𝐞𝐯𝐞𝐧𝐭𝐨.*`

  await conn.sendMessage(chatId, {
    text: infoLobby,
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
   buttons: [
  {
    buttonId: '.orgia azione_inizia',
    buttonText: { displayText: '🔥 Inizia Orgia' },
    type: 1
  }
],
    headerType: 1,
    mentions: [m.sender]
  }, { quoted: m })
}

async function runOrgia(conn, chatId, m, mentions, isCasual) {
  const players = [...mentions]

  const winner = pickRandom(players)

let log =
`*🥵 𝐋'𝐎𝐑𝐆𝐈𝐀 𝐃𝐄𝐌𝐄𝐍𝐙𝐈𝐀𝐋𝐄 𝐄̀ 𝐈𝐍𝐈𝐙𝐈𝐀𝐓𝐀 🥵*

*👥 𝐂𝐨𝐫𝐩𝐢 𝐢𝐧 𝐚𝐳𝐢𝐨𝐧𝐞:* ${players.length}

*🔥 𝐂𝐡𝐞 𝐢𝐥 𝐟𝐥𝐮𝐢𝐝𝐨 𝐜𝐚𝐨𝐭𝐢𝐜𝐨 𝐚𝐛𝐛𝐢𝐚 𝐢𝐧𝐢𝐳𝐢𝐨! 𝐒𝐩𝐞𝐠𝐧𝐞𝐭𝐞 𝐥𝐞 𝐥𝐮𝐜𝐢!*`

const sent = await conn.sendMessage(chatId, {
  text: log,
  mentions: players
}, { quoted: m })

await delay(4000)

const numeroEventi =
  Math.floor(Math.random() * 3) + 8

let penultimoEvento = null
let ultimoEvento = null

for (let i = 0; i < numeroEventi; i++) {

  penultimoEvento = ultimoEvento

  ultimoEvento = await conn.sendMessage(chatId, {
    text: randomEvent(players),
    mentions: players
  })

  await delay(2500)
}

const msgFinale = await conn.sendMessage(chatId, {
  text:
`*💦 𝐈 𝐂𝐎𝐑𝐏𝐈 𝐂𝐎𝐌𝐈𝐍𝐂𝐈𝐀𝐍𝐎 𝐀 𝐂𝐄𝐃𝐄𝐑𝐄...*

*😮‍💨 𝐈 𝐑𝐄𝐒𝐏𝐈𝐑𝐈 𝐒𝐎𝐍𝐎 𝐎𝐑𝐌𝐀𝐈 𝐏𝐄𝐒𝐀𝐍𝐓𝐈...*

*🔥 𝐋'𝐔𝐋𝐓𝐈𝐌𝐀 𝐎𝐍𝐃𝐀 𝐃𝐈 𝐅𝐎𝐋𝐋𝐈𝐀 𝐒𝐓𝐀 𝐏𝐄𝐑 𝐀𝐁𝐁𝐀𝐓𝐓𝐄𝐑𝐒𝐈 𝐒𝐔𝐋 𝐆𝐑𝐔𝐏𝐏𝐎...*`,
  mentions: players
})

await delay(4000)

  const finale =
`*🏆 𝐑𝐄𝐂𝐄𝐍𝐒𝐈𝐎𝐍𝐄 𝐃𝐄𝐋𝐋'𝐀𝐌𝐌𝐔𝐂𝐂𝐇𝐈𝐀𝐓𝐀 𝐓𝐑𝐀𝐒𝐇 🏆*

${isCasual
? `*🎲 𝐎𝐫𝐠𝐢𝐚 𝐂𝐚𝐬𝐮𝐚𝐥𝐞:* \n ${players.length} *𝐜𝐨𝐫𝐩𝐢 𝐚𝐬𝐬𝐮𝐫𝐝𝐢*`
: `*👥 𝐀𝐦𝐦𝐮𝐜𝐜𝐡𝐢𝐚𝐭𝐚 𝐎𝐫𝐠𝐚𝐧𝐢𝐳𝐳𝐚𝐭𝐚:* \n ${players.length} *𝐦𝐞𝐦𝐛𝐫𝐢 𝐚𝐭𝐭𝐢𝐯𝐢*`
}

*👑 𝐈𝐋 𝐃𝐎𝐌𝐈𝐍𝐀𝐓𝐎𝐑𝐄 / 𝐋𝐀 𝐃𝐎𝐌𝐈𝐍𝐀𝐓𝐑𝐈𝐂𝐄 𝐀𝐒𝐒𝐎𝐋𝐔𝐓𝐀*

${tag(winner)}

*🥇 𝐄̀ 𝐋'𝐔𝐍𝐈𝐂𝐎/𝐀 𝐂𝐇𝐄 𝐇𝐀 𝐀𝐍𝐂𝐎𝐑𝐀 𝐄𝐍𝐄𝐑𝐆𝐈𝐀 𝐄 𝐍𝐎𝐍 𝐇𝐀 𝐂𝐑𝐀𝐌𝐏𝐈!*`

  await conn.sendMessage(chatId, {
  text: finale,
  mentions: players,
  edit: msgFinale.key
})

  await delay(2500)

if (Math.random() < 0.9) {

  let shuffled = [...players].sort(() => Math.random() - 0.5)

  let madre = shuffled[0]
  let padre = shuffled[1] || shuffled[0]

  const folder = './media/neonati'

  const femmine = [
    'femmina1.jpg',
    'femmina2.jpg',
    'femmina3.jpg',
    'femmina4.jpg',
    'femmina5.jpg',
    'femmina6.jpg'
  ]

  const maschi = [
    'maschio1.jpg',
    'maschio2.jpg',
    'maschio3.jpg',
    'maschio4.jpg',
    'maschio5.jpg',
    'maschio6.jpg'
  ]

  const sesso =
    Math.random() < 0.5
      ? 'MASCHIO'
      : 'FEMMINA'

  const fileScelto =
    sesso === 'MASCHIO'
      ? pickRandom(maschi)
      : pickRandom(femmine)

  let imageBuffer = null

  try {
    imageBuffer = fs.readFileSync(
      path.join(folder, fileScelto)
    )
  } catch (e) {
    console.error(
      '[ORGIA] Errore caricamento neonato:',
      e
    )
  }

  let babyText =
`*🍼 𝐈𝐋 𝐃𝐈𝐒𝐀𝐒𝐓𝐑𝐎 𝐃𝐄𝐋𝐋𝐀 𝐁𝐈𝐎𝐋𝐎𝐆𝐈𝐀 🍼*

*𝐍𝐨𝐯𝐞 𝐦𝐞𝐬𝐢 𝐝𝐨𝐩𝐨 𝐥'𝐨𝐫𝐠𝐢𝐚... 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐥 𝐫𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨 𝐝𝐞𝐥 𝐜𝐚𝐨𝐬!*

*${sesso === 'MASCHIO' ? '👶🩵 𝐄̀ 𝐍𝐀𝐓𝐎 𝐔𝐍 𝐁𝐈𝐌𝐁𝐎!' : '👶🩷 𝐄̀ 𝐍𝐀𝐓𝐀 𝐔𝐍𝐀 𝐁𝐈𝐌𝐁𝐀!'}*

*👩‍🍼 𝐌𝐀𝐃𝐑𝐄:* ${tag(madre)}

*👨‍🍼 𝐏𝐀𝐃𝐑𝐄:* ${tag(padre)}

*🧬 𝐈𝐥 𝐭𝐞𝐬𝐭 𝐃𝐍𝐀 𝐡𝐚 𝐩𝐫𝐨𝐯𝐚𝐭𝐨 𝐚 𝐬𝐜𝐚𝐩𝐩𝐚𝐫𝐞, 𝐦𝐚 𝐪𝐮𝐞𝐬𝐭𝐢 𝐝𝐮𝐞 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐩𝐞𝐬𝐜𝐚𝐭𝐢 𝐢𝐧 𝐟𝐥𝐚𝐠𝐫𝐚𝐧𝐭𝐞.*`

  await delay(2000)

  if (imageBuffer) {
    await conn.sendMessage(chatId, {
      image: imageBuffer,
      caption: babyText,
      mentions: [madre, padre]
    }, { quoted: m })
  } else {
    await conn.sendMessage(chatId, {
      text: babyText,
      mentions: [madre, padre]
    }, { quoted: m })
  }
  }
}

handler.help = [
  'orgia',
  'orgiacasuale'
]

handler.tags = ['games']

handler.command =
/^(orgia|orgiacasuale|orgiarandom|iniziaorgia|avviaorgia|partecipaorgia)$/i

handler.group = true

export default handler
