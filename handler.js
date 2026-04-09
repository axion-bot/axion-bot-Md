import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage, toJid } from '@realvare/baileys'

global.rcanal = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363424041538498@newsletter',
            newsletterName: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
            serverMessageId: 1
        }
    }
}
global.getRcanal = (extra = {}) => ({
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363424041538498@newsletter',
        newsletterName: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
        serverMessageId: 1
    },
    ...extra
})

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

if (!global.groupCache) {
    global.groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
}
if (!global.jidCache) {
    global.jidCache = new NodeCache({ stdTTL: 600, useClones: false })
}
if (!global.nameCache) {
    global.nameCache = new NodeCache({ stdTTL: 600, useClones: false });
}

export const fetchMetadata = async (conn, chatId) => await conn.groupMetadata(chatId)

const fetchGroupMetadataWithRetry = async (conn, chatId, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await conn.groupMetadata(chatId);
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

if (!global.cacheListenersSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('groups.update', async (updates) => {
            for (const update of updates) {
                if (!update || !update.id) continue;
                try {
                    const metadata = await fetchGroupMetadataWithRetry(conn, update.id)
                    if (!metadata) continue
                    global.groupCache.set(update.id, metadata, { ttl: 300 })
                } catch (e) {
                    if (!e.message?.includes('not authorized') && !e.message?.includes('chat not found') && !e.message?.includes('not in group')) {
                        console.error(`[ERRORE] Errore cache su groups.update per ${update.id}:`, e)
                    }
                }
            }
        })
        global.cacheListenersSet = true
    }
}

if (!global.pollListenerSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('messages.update', async (chatUpdate) => {
            for (const { key, update } of chatUpdate) {
                if (update.pollUpdates) {
                    try {
                        const pollCreation = await global.store.getMessage(key)
                        if (pollCreation) {
                            await getAggregateVotesInPollMessage({
                                message: pollCreation,
                                pollUpdates: update.pollUpdates,
                            })
                        }
                    } catch (e) {
                        console.error('[ERRORE] Errore poll update:', e)
                    }
                }
            }
        })
        global.pollListenerSet = true
    }
}

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))
const responseHandlers = new Map()

function initResponseHandler(conn) {
    if (!conn.waitForResponse) {
        conn.waitForResponse = async (chat, sender, options = {}) => {
            const { timeout = 30000, validResponses = null, onTimeout = null, filter = null } = options
            return new Promise((resolve) => {
                const key = chat + sender
                const timeoutId = setTimeout(() => {
                    responseHandlers.delete(key)
                    if (onTimeout) onTimeout()
                    resolve(null)
                }, timeout)
                responseHandlers.set(key, { resolve, timeoutId, validResponses, filter })
            })
        }
    }
}

global.processedCalls = global.processedCalls || new Map()
if (global.conn && global.conn.ws) {
    global.conn.ws.on('CB:call', async (json) => {
        try {
            if (!json?.tag || json.tag !== 'call' || !json.attrs?.from) return
            const callerId = global.conn.decodeJid(json.attrs.from)
            const isOwner = global.owner.some(([num]) => num === callerId.split('@')[0])
            if (isOwner) return

            const eventId = json.attrs.id  
            let actualCallId = null  
            if (json.content?.length > 0) {  
                for (const item of json.content) {  
                    if (item.attrs && item.attrs['call-id']) {  
                        actualCallId = item.attrs['call-id']  
                        break  
                    }  
                }  
            }  
            const uniqueCallId = actualCallId || eventId  
            if (json.content?.length > 0) {  
                const contentTags = json.content.map(item => item.tag)  
                if (contentTags.includes('terminate')) {  
                    global.processedCalls.delete(uniqueCallId)  
                    return  
                }  
                if (contentTags.includes('relaylatency')) {  
                    if (global.processedCalls.has(uniqueCallId)) return  
                    global.processedCalls.set(uniqueCallId, true)  

                    const numero = callerId.split('@')[0]  
                    let nome = global.nameCache.get(callerId) || global.conn.getName(callerId) || 'Sconosciuto'  
                    global.nameCache.set(callerId, nome);  
                    console.log(chalk.redBright(`[📞] Chiamata da: ${numero} (${nome})`))  

                    if (!global.db.data) await global.loadDatabase()  
                    let settings = global.db.data?.settings?.[global.conn.user.jid]  
                    if (!settings) {  
                        settings = global.db.data.settings[global.conn.user.jid] = { jadibotmd: false, antiPrivate: true, soloCreatore: false, anticall: true, status: 0 }  
                    }  
                    if (!settings.anticall) return  

                    let user = global.db.data.users[callerId] || (global.db.data.users[callerId] = { callCount: 0, banned: false })  
                    if (user.banned) { await global.conn.rejectCall(uniqueCallId, callerId); return }  
                    user.callCount = (user.callCount || 0) + 1  
                    try {  
                        await global.conn.rejectCall(uniqueCallId, callerId)  
                        if (user.callCount >= 3) {  
                            user.banned = true  
                            await global.conn.sendMessage(toJid(callerId), { text: `🚫 Troppe chiamate. Bannato.` })  
                        } else {  
                            await global.conn.sendMessage(toJid(callerId), { text: `🚫 Non chiamare il bot.` })  
                        }  
                    } catch (err) {  
                        global.processedCalls.delete(uniqueCallId)  
                    }  
                }  
            }  
        } catch (e) { console.error('[ERRORE CHIAMATA]', e) }  
    })
}

setInterval(() => { if (global.processedCalls.size > 10) global.processedCalls.clear() }, 180000)

export async function participantsUpdate({ id, participants, action }) {
    if (global.db.data.chats[id]?.rileva === false) return
    try {  
        let metadata = global.groupCache.get(id) || await fetchMetadata(this, id)  
        if (!metadata) return  
        global.groupCache.set(id, metadata, { ttl: 300 })  
    } catch (e) { console.error(`[ERRORE PARTICIPANTS]`, e) }
}

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    if (m.message?.protocolMessage?.type === 'MESSAGE_EDIT') {
        const key = m.message.protocolMessage.key;
        const editedMessage = m.message.protocolMessage.editedMessage;
        m.key = key; m.message = editedMessage;
        m.text = editedMessage.conversation || editedMessage.extendedTextMessage?.text || '';
        m.mtype = Object.keys(editedMessage)[0];
    }

    m = smsg(this, m, global.store)
    if (!m || !m.key || !m.chat || !m.sender) return
    if (m.fromMe) return

    // ==========================================
    // LOG DEI MESSAGGI NEL TERMINALE (FIXATO)
    // ==========================================
    try {
        const chatTime = new Date().toLocaleTimeString()
        const senderName = m.pushName || 'Sconosciuto'
        const senderId = m.sender.split('@')[0]
        const body = m.text || `[${m.mtype}]`
        
        if (m.isGroup) {
            let groupName = global.groupCache.get(m.chat)?.subject || (await this.getName(m.chat)) || 'Gruppo'
            console.log(
                chalk.bgBlack.cyan(`[${chatTime}]`) + ' ' +
                chalk.black.bgGreen(`[GRUPPO]`) + ' ' +
                chalk.greenBright(groupName) + ' ' +
                chalk.white(`- ${senderName} (${senderId}):`) + ' ' +
                chalk.gray(body.substring(0, 50))
            )
        } else {
            console.log(
                chalk.bgBlack.cyan(`[${chatTime}]`) + ' ' +
                chalk.black.bgMagenta(`[PRIVATO]`) + ' ' +
                chalk.magentaBright(senderName) + ' ' +
                chalk.white(`(${senderId}):`) + ' ' +
                chalk.gray(body.substring(0, 50))
            )
        }
    } catch (e) { /* silent log error */ }
    // ==========================================

    if (m.key.participant && m.key.participant.includes(':') && m.key.participant.split(':')[1]?.includes('@')) return

    if (m.key) {  
        m.key.remoteJid = this.decodeJid(m.key.remoteJid)  
        if (m.key.participant) m.key.participant = this.decodeJid(m.key.participant)  
    }  

    if (!this.originalGroupParticipantsUpdate) {  
        this.originalGroupParticipantsUpdate = this.groupParticipantsUpdate  
        this.groupParticipantsUpdate = async function(chatId, users, action) {  
            try {  
                let metadata = global.groupCache.get(chatId) || await fetchMetadata(this, chatId)
                if (metadata) global.groupCache.set(chatId, metadata, { ttl: 300 })
                if (!metadata) return this.originalGroupParticipantsUpdate.call(this, chatId, users, action)  

                const correctedUsers = users.map(userJid => {  
                    const decoded = this.decodeJid(userJid)  
                    const phone = decoded.split('@')[0].replace(/:\d+$/, '')  
                    const participant = metadata.participants.find(p => this.decodeJid(p.id).split('@')[0].replace(/:\d+$/, '') === phone)  
                    return participant ? participant.id : userJid  
                })  
                return this.originalGroupParticipantsUpdate.call(this, chatId, correctedUsers, action)  
            } catch (e) { throw e }  
        }  
    }  

    initResponseHandler(this)  

    let user, chat, usedPrefix, normalizedSender, normalizedBot;
    try {  
        if (!global.db.data) await global.loadDatabase()  
        normalizedSender = this.decodeJid(m.sender)  
        normalizedBot = this.decodeJid(this.user.jid)  

        user = global.db.data.users[normalizedSender] || (global.db.data.users[normalizedSender] = { exp: 0, euro: 10, muto: false, registered: false, name: m.pushName || '?', age: -1, regTime: -1, banned: false, bank: 0, level: 0, firstTime: Date.now(), spam: 0 })  
        chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = { isBanned: false, welcome: false, goodbye: false, ai: false, vocali: false, antiporno: false, antioneview: false, autolevelup: false, antivoip: false, rileva: false, modoadmin: false, antiLink: false, antiLink2: false, reaction: false, antispam: false, expired: 0, users: {} })  
        let settings = global.db.data.settings[this.user.jid] || (global.db.data.settings[this.user.jid] = { autoread: false, jadibotmd: false, antiPrivate: true, soloCreatore: false, status: 0 })  

        if (m.mtype === 'pollUpdateMessage' || m.mtype === 'reactionMessage') return  
        let groupMetadata = m.isGroup ? global.groupCache.get(m.chat) : null  
        let participants = null, normalizedParticipants = null, isBotAdmin = false, isAdmin = false, isRAdmin = false  
        let isSam = global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)  
        let isROwner = isSam || global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)  
        let isOwner = isROwner || m.fromMe  
        let isMods = isOwner || global.mods?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false  
        let isPrems = isROwner || global.prems?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizedSender) || false  

        if (m.isGroup) {  
            if (!groupMetadata) {  
                groupMetadata = await fetchGroupMetadataWithRetry(this, m.chat)  
                if (groupMetadata) global.groupCache.set(m.chat, groupMetadata, { ttl: 300 })  
            }  
            if (groupMetadata) {  
                participants = groupMetadata.participants  
                normalizedParticipants = participants.map(u => ({ ...u, id: this.decodeJid(u.id) }))  
                const normalizedOwner = groupMetadata.owner ? this.decodeJid(groupMetadata.owner) : null  
                isAdmin = participants.some(u => this.decodeJid(u.id) === normalizedSender && (u.admin || u.isAdmin))  
                isBotAdmin = participants.some(u => this.decodeJid(u.id) === normalizedBot && (u.admin || u.isAdmin))  
                isRAdmin = isAdmin && (normalizedSender === normalizedOwner)  
            }  
        }  

        const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins')  
        for (let name in global.plugins) {  
            let plugin = global.plugins[name]  
            if (!plugin || plugin.disabled) continue  

            const __filename = join(___dirname, name)  
            if (typeof plugin.all === 'function') {  
                try { await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }) } catch (e) { console.error(e) }  
            }  

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')  
            let _prefix = plugin.customPrefix || global.prefix || '.'  
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] : Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p : new RegExp(str2Regex(p)).exec(m.text), p]) : typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), _prefix]] : [[[], new RegExp]]).find(p => p[1])  

            if (typeof plugin.before === 'function') {  
                if (await plugin.before.call(this, m, { match, conn: this, participants: normalizedParticipants, groupMetadata, user: { admin: isAdmin ? 'admin' : null }, bot: { admin: isBotAdmin ? 'admin' : null }, isSam, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename })) continue  
            }  

            if (typeof plugin !== 'function') continue  
            if (!match || !match[0]) continue  

            usedPrefix = (match[0] || '')[0]  
            let noPrefix = m.text.replace(usedPrefix, '')  
            let [command, ...args] = noPrefix.trim().split` `.filter(v => v)  
            let text = args.join` `  
            command = command?.toLowerCase() || ''  
            let fail = plugin.fail || global.dfail  
            let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) : Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) : typeof plugin.command === 'string' ? plugin.command === command : false  

            if (!isAccept) continue  

            if (user.muto && !isOwner) { this.reply(m.chat, `🚫 Sei mutato.`, m); return }  
            if (chat.isBanned && !isOwner) return  
            if (user.banned && !isOwner) return  

            // Controllo permessi plugin
            if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
            if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
            if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
            if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
            if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }

            m.isCommand = true  
            let extra = { match, usedPrefix, noPrefix, args, command, text, conn: this, participants: normalizedParticipants, groupMetadata, user: { admin: isAdmin ? 'admin' : null }, bot: { admin: isBotAdmin ? 'admin' : null }, isSam, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename }  

            try {  
                await plugin.call(this, m, extra)  
            } catch (e) {  
                console.error(e)  
                this.reply(m.chat, format(e), m)  
            } finally {  
                if (typeof plugin.after === 'function') {  
                    try { await plugin.after.call(this, m, extra) } catch (e) { console.error(e) }  
                }  
            }  
        }  
    } catch (e) { console.error(e) }
}
