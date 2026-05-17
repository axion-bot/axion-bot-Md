import { createCanvas } from 'canvas'
import { generateWAMessageFromContent } from '@realvare/baileys'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`📌 Usa così:\n.${command} numero\n\nEsempio:\n.${command} 393471234567`)

  let target = `${text.replace(/[^0-9]/g, '')}@s.whatsapp.net`

  try {
    // Genera l'immagine
    const width = 800
    const height = 600
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = '#ff0000'
    ctx.font = 'bold 60px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('𝐃𝐄𝐀𝐃𝐋𝐘 𝐃𝐎𝐌𝐈𝐍𝐀', width / 2, height / 2)

    const buffer = canvas.toBuffer()

    // Metodo alternativo: Invio diretto tramite le funzioni integrate del framework
    // per garantire che l'upload multimediale sia gestito nativamente dal bot
    let msg = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              hasMediaAttachment: false, // Disabilitato l'upload manuale non supportato
              title: "𝐃𝐄𝐀𝐃𝐋𝐘"
            },
            body: {
              text: "𝐃𝐄𝐀𝐃𝐋𝐘-𝐂𝐑𝐀𝐒𝐇"
            },
            nativeFlowMessage: {
              messageParamsJson: JSON.stringify({}),
              buttons: [
                { 
                  name: "single_select", 
                  buttonParamsJson: JSON.stringify({ title: "Menu", sections: [{ title: "Opzioni", rows: [{ title: "Seleziona", rowId: "1" }] }] }) 
                }
              ]
            }
          }
        }
      }
    }, { userJid: conn.user?.id || conn.user?.jid })

    await conn.relayMessage(target, msg.message, { messageId: msg.key?.id })

    // Invia l'immagine separatamente come conferma utilizzando la funzione nativa del bot
    await conn.sendMessage(target, { image: buffer, caption: "Immagine associata" })

    m.reply(`✅ Messaggio strutturato inviato a ${text}`)
  } catch (e) {
    console.error(e)
    m.reply("❌ Errore durante l'invio: " + e.message)
  }
}

handler.command = /^delay$/i
export default handler
