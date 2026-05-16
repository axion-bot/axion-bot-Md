// AntiNuke by Bonzino

import { axionSystem, axionFooter } from '../lib/axionsystem.js'

const azioniNuke = {}
const cacheGruppi = {}

const TEMPO_CONTROLLO = 20000
const TEMPO_MESSAGGIO_DOPO_CHIUSURA = 10000
const SOGLIA_NUKE = 4
const RITARDO_KICK = 1500

const paroleTrigger = ['.nuke','.abusa','.domina','.regna','.nuker','.raid','.destroy','.deleteall']
const paroleNuke = ['nuke','raid','bye','addio','owned','hacked','pwned','regno','dominio']

function ottieniChiave(chat, autore) {
  return `${chat}:${autore}`
}

function ottieniDati(chat, autore) {
  const chiave = ottieniChiave(chat, autore)

  if (!azioniNuke[chiave]) {
    azioniNuke[chiave] = {
      livelloMinaccia: 0,
      ultimoMessaggio: 0,
      gruppoChiuso: false,
      triggerAttivo: false,
      ultimoTrigger: 0,
      timeout: null
    }
  }

  return azioniNuke[chiave]
}

function resettaDati(chat, autore) {
  const chiave = ottieniChiave(chat, autore)
  if (azioniNuke[chiave]?.timeout) clearTimeout(azioniNuke[chiave].timeout)
  delete azioniNuke[chiave]
}

function isOwnerBot(jid) {
  const clean = String(jid || '').split('@')[0].replace(/[^0-9]/g, '')
  return global.owner?.some(([num]) => String(num).replace(/[^0-9]/g, '') === clean)
}

async function punisciNuker(conn, chat, autore, motivo) {
  try {
    if (!autore || isOwnerBot(autore)) return

    const metadata = await conn.groupMetadata(chat)
    const admin = metadata.participants.find(p => p.id === autore && (p.admin === 'admin' || p.admin === 'superadmin'))
    if (!admin) return

    await conn.groupParticipantsUpdate(chat, [autore], 'demote')
    await new Promise(resolve => setTimeout(resolve, RITARDO_KICK))
    await conn.groupParticipantsUpdate(chat, [autore], 'remove')

    try {
      await conn.groupSettingUpdate(chat, 'not_announcement')
    } catch {}

    const datiGruppo = cacheGruppi[chat]

    if (datiGruppo?.nome && metadata.subject !== datiGruppo.nome) {
      try {
        await conn.groupUpdateSubject(chat, datiGruppo.nome)
      } catch {}
    }

    if (datiGruppo?.descrizione) {
      try {
        await conn.groupUpdateDescription(chat, datiGruppo.descrizione)
      } catch {}
    }

    await axionSystem(conn, chat, {
      text: axionFooter(`*⚠️ 𝐓𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐨 𝐝𝐢 𝐧𝐮𝐤𝐞 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨.*

*➜ 𝐀𝐝𝐦𝐢𝐧 𝐝𝐞𝐦𝐨𝐭𝐚𝐭𝐨*
*➜ 𝐔𝐭𝐞𝐧𝐭𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨*
*➜ 𝐆𝐫𝐮𝐩𝐩𝐨 𝐫𝐢𝐩𝐫𝐢𝐬𝐭𝐢𝐧𝐚𝐭𝐨*

*📌 𝐌𝐨𝐭𝐢𝐯𝐨:* *${motivo}*`),
      thumb: 'antinuke'
    })

    resettaDati(chat, autore)
  } catch (e) {
    console.error('[ANTINUKE] Errore punizione:', e)
  }
}

let handler = m => m

handler.before = async function (m, { conn, isOwner, isROwner, groupMetadata }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antinuke) return false

  const autore = m.sender
  if (!autore) return false
  if (isOwner || isROwner || isOwnerBot(autore)) return false

  if (!cacheGruppi[m.chat]) {
    cacheGruppi[m.chat] = {
      nome: groupMetadata?.subject || '',
      descrizione: groupMetadata?.desc || ''
    }
  }

  const dati = ottieniDati(m.chat, autore)

  if (!dati.timeout) {
    dati.timeout = setTimeout(() => {
      resettaDati(m.chat, autore)
    }, TEMPO_CONTROLLO)
  }

  const testo = String(m.text || '').toLowerCase()
  const haTrigger = paroleTrigger.some(p => testo.includes(p))
  const haMessaggioNuke = paroleNuke.some(p => testo.includes(p))

  if (haTrigger) {
    dati.triggerAttivo = true
    dati.ultimoTrigger = Date.now()
    dati.livelloMinaccia += 1
  }

  if (haMessaggioNuke && dati.gruppoChiuso) {
    dati.livelloMinaccia += 2
    dati.ultimoMessaggio = Date.now()
  }

  if (dati.triggerAttivo && dati.ultimoTrigger && Date.now() - dati.ultimoTrigger <= TEMPO_CONTROLLO && dati.gruppoChiuso) dati.livelloMinaccia += 3
  if (dati.gruppoChiuso && dati.ultimoMessaggio && Date.now() - dati.ultimoMessaggio <= TEMPO_MESSAGGIO_DOPO_CHIUSURA) dati.livelloMinaccia += 2

  if (dati.livelloMinaccia >= SOGLIA_NUKE) {
    await punisciNuker(conn, m.chat, autore, 'Comportamento da nuke rilevato')
    return true
  }

  return false
}

export async function groupsUpdate(updates) {
  const conn = global.conn
  if (!conn) return

  for (const update of updates) {
    try {
      const chat = update.id
      if (!chat) continue

      const datiChat = global.db.data.chats[chat]
      if (!datiChat?.antinuke) continue

      const metadata = await conn.groupMetadata(chat)

      if (!cacheGruppi[chat]) {
        cacheGruppi[chat] = {
          nome: metadata.subject || '',
          descrizione: metadata.desc || ''
        }
      }

      if (update.subject) cacheGruppi[chat].nome = update.subject
      if (update.desc) cacheGruppi[chat].descrizione = update.desc

      if (typeof update.announce !== 'undefined') {
        const autore = update.author || update.participant
        if (!autore || isOwnerBot(autore)) continue

        const dati = ottieniDati(chat, autore)

        if (update.announce === true) {
          dati.gruppoChiuso = true
          dati.livelloMinaccia += 2

          if (!dati.timeout) {
            dati.timeout = setTimeout(() => {
              resettaDati(chat, autore)
            }, TEMPO_CONTROLLO)
          }

          if (dati.triggerAttivo && dati.ultimoTrigger && Date.now() - dati.ultimoTrigger <= TEMPO_CONTROLLO) dati.livelloMinaccia += 3

          if (dati.livelloMinaccia >= SOGLIA_NUKE) {
            await punisciNuker(conn, chat, autore, 'Chiusura gruppo dopo trigger sospetto')
          }
        }
      }
    } catch (e) {
      console.error('[ANTINUKE] Errore update:', e)
    }
  }
}

export default handler