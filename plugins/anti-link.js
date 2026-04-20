// Plugin AntiLink by Bonzino

import { downloadContentFromMessage } from '@realvare/baileys'
import ffmpeg from 'fluent-ffmpeg'
import { createWriteStream, readFile } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { unlink } from 'fs/promises'
import Jimp from 'jimp'
import jsQR from 'jsqr'
import fetch from 'node-fetch'
import { FormData } from 'formdata-node'

const WHATSAPP_GROUP_REGEX = /\bchat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
const WHATSAPP_CHANNEL_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i

const SHORT_URL_DOMAINS = [
  'bit.ly', 'tinyurl.com', 't.co', 'short.link', 'shorturl.at',
  'is.gd', 'v.gd', 'goo.gl', 'ow.ly', 'buff.ly', 'tiny.cc',
  'shorte.st', 'adf.ly', 'linktr.ee', 'rebrand.ly',
  'bitly.com', 'cutt.ly', 'short.io', 'links.new',
  'link.ly', 'ur.ly', 'shrinkme.io', 'clck.ru',
  'short.gy', 'lnk.to', 'sh.st', 'ouo.io', 'bc.vc',
  'adfoc.us', 'linkvertise.com', 'exe.io', 'linkbucks.com'
]

const SHORT_URL_REGEX = new RegExp(
  `https?:\\/\\/(?:www\\.)?(?:${SHORT_URL_DOMAINS.map(d => d.replace('.', '\\.')).join('|')})\\/[^\\s]*`,
  'gi'
)

function tag(jid) {
  return '@' + String(jid || '').split('@')[0]
}

function isWhatsAppLink(url) {
  return WHATSAPP_GROUP_REGEX.test(url) || WHATSAPP_CHANNEL_REGEX.test(url)
}

function getPlatform(text = '') {
  const t = String(text).toLowerCase()

  if (WHATSAPP_GROUP_REGEX.test(t) || WHATSAPP_CHANNEL_REGEX.test(t)) return '𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩'
  if (t.includes('instagram.com')) return '𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦'
  if (t.includes('tiktok.com')) return '𝐓𝐢𝐤𝐓𝐨𝐤'
  if (t.includes('youtube.com') || t.includes('youtu.be')) return '𝐘𝐨𝐮𝐓𝐮𝐛𝐞'
  if (t.includes('facebook.com')) return '𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤'
  if (t.includes('twitter.com') || t.includes('x.com')) return '𝐓𝐰𝐢𝐭𝐭𝐞𝐫'
  if (t.includes('t.me')) return '𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦'
  if (SHORT_URL_REGEX.test(t)) return '𝐋𝐢𝐧𝐤 𝐒𝐨𝐬𝐩𝐞𝐭𝐭𝐨'

  return '𝐋𝐢𝐧𝐤'
}

async function containsSuspiciousLink(text) {
  if (!text) return false
  if (isWhatsAppLink(text)) return true
  if (SHORT_URL_REGEX.test(text)) return true
  return false
}

function extractTextFromMessage(m) {
  return (
    m.text ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ''
  ).trim()
}

async function sendWarn(conn, m, warn, platform) {
  const remaining = 3 - warn

  await conn.sendMessage(m.chat, {
    text: `╭━━━━━━━🔗━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐋𝐈𝐍𝐊 ✦*
╰━━━━━━━🔗━━━━━━━╯

*${tag(m.sender)}*
*⚠️ 𝐋𝐢𝐧𝐤 ${platform} 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨*
*📌 𝐀𝐯𝐯𝐢𝐬𝐨:* *${warn}/3*
*⏳ 𝐑𝐢𝐦𝐚𝐧𝐞𝐧𝐭𝐢:* *${remaining}*

*🚷 𝐀𝐥𝐥𝐚 𝐩𝐫𝐨𝐬𝐬𝐢𝐦𝐚 𝐯𝐢𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐬𝐚𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
    mentions: [m.sender]
  }, { quoted: m })
}

async function sendKickMessage(conn, m, platform) {
  await conn.sendMessage(m.chat, {
    text: `╭━━━━━━━🔗━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐋𝐈𝐍𝐊 ✦*
╰━━━━━━━🔗━━━━━━━╯

*${tag(m.sender)}*
*🚷 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*
*📌 𝐌𝐨𝐭𝐢𝐯𝐨:* *𝐒𝐩𝐚𝐦 𝐥𝐢𝐧𝐤 ${platform}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
    mentions: [m.sender]
  }, { quoted: m })
}

async function sendNoPerms(conn, m) {
  await conn.sendMessage(m.chat, {
    text: `╭━━━━━━━🔗━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐋𝐈𝐍𝐊 ✦*
╰━━━━━━━🔗━━━━━━━╯

*${tag(m.sender)}*
*⚠️ 𝐇𝐚 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐚𝐯𝐯𝐢𝐬𝐢*
*❌ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐥𝐨: 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐚𝐝𝐦𝐢𝐧*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
    mentions: [m.sender]
  }, { quoted: m })
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (!m.isGroup || isAdmin || isOwner || isROwner || m.fromMe) return false

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiLink) return false

  try {
    const text = extractTextFromMessage(m)
    if (!(await containsSuspiciousLink(text))) return false

    const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
    if (typeof user.warn !== 'number') user.warn = 0
    if (!Array.isArray(user.warnReasons)) user.warnReasons = []

    const platform = getPlatform(text)
    user.warn += 1
    user.warnReasons.push(`link ${platform.toLowerCase()}`)

    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender
        }
      })
    } catch {}

    if (user.warn < 3) {
      await sendWarn(conn, m, user.warn, platform)
      return true
    }

    user.warn = 0
    user.warnReasons = []

    if (!isBotAdmin) {
      await sendNoPerms(conn, m)
      return true
    }

    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      await sendKickMessage(conn, m, platform)
    } catch {
      await sendNoPerms(conn, m)
    }

    return true
  } catch (err) {
    console.error('Errore AntiLink AXION BOT:', err)
  }

  return false
}