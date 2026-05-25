process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
try {
    await import('./private.js');
} catch {
    console.log('private.js non trovato');
}
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import './lib/groupwarn.js'
import { getThumbBuffer } from './lib/thumb.js'
import qrcode from 'qrcode-terminal'
import { format } from 'util';
import pino from 'pino';
import fetch from 'node-fetch'
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';

const RESTART_FILE = './tmp/restart-state.json';
for (const dir of ['./temp', './tmp']) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

const DisconnectReason = {
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503
};
const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, makeInMemoryStore, generateWAMessageFromContent, proto } = await import('@realvare/baileys');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
protoType();
serialize();

// funzione x bottone copy universale
global.sendCopy=async(conn,m,{text='',copy='',button='📋 𝐂𝐨𝐩𝐢𝐚'})=>{
const msg=generateWAMessageFromContent(m.chat,{
viewOnceMessage:{message:{
messageContextInfo:{deviceListMetadata:{},deviceListMetadataVersion:2},
interactiveMessage:proto.Message.InteractiveMessage.create({
body:proto.Message.InteractiveMessage.Body.create({text}),
footer:proto.Message.InteractiveMessage.Footer.create({text:'\n𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'}),
nativeFlowMessage:proto.Message.InteractiveMessage.NativeFlowMessage.create({
buttons:[{
name:'cta_copy',
buttonParamsJson:JSON.stringify({display_text:button,copy_code:copy})
}]
})
})
}}
},{quoted:m})
await conn.relayMessage(m.chat,msg.message,{messageId:msg.key.id})
}

// funzione x box universale
global.box=async(conn,chat,{text='ㅤ',title='ㅤㅤㅤ𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐘𝐒𝐓𝐄𝐌',body='𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',thumb='default'}={},options={})=>{
let thumbnail=null
try{
thumbnail=await getThumbBuffer(thumb)
}catch(e){
console.log('[BOX THUMB ERROR]',thumb,e?.message||e)
}
return conn.sendMessage(chat,{
text,
contextInfo:{
externalAdReply:{
title,
body,
thumbnail,
mediaType:1,
renderLargerThumbnail:false,
showAdAttribution:false
}
}
},options)
}

global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};
let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
let phoneNumber = global.botNumberCode;

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']');
global.db = new Low(new JSONFile('database.json'));
global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (!global.db.READ) {
                    clearInterval(interval);
                    resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
                }
            }, 1 * 1000);
            setTimeout(() => {
                clearInterval(interval);
                global.db.READ = null;
                reject(new Error('loadDatabase timeout'));
            }, 15000);
        }).catch((e) => {
            console.error('[ERRORE] loadDatabase:', e.message);
            return global.loadDatabase();
        });
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

global.botname = global.db?.data?.settings?.botName || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

global.creds = 'creds.json';
global.authFile = 'session';

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterCache = new NodeCache();
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
    do {
    const cyan1 = chalk.hex('#00BFFF');     // DeepSkyBlue
    const cyan2 = chalk.hex('#00CED1');     // DarkTurquoise
    const cyan3 = chalk.hex('#20B2AA');     // LightSeaGreen
    const green = chalk.hex('#2ECC71');     // Emerald
    const whiteSoft = chalk.hex('#ECF0F1'); // Soft white
    const redSoft = chalk.hex('#E74C3C');   // Soft red

        const a = cyan1('╭━━━━━━━━━━━━━• 𝛥𝐗𝐈𝚶𝐍 𝐂𝐎𝐑𝐄 •━━━━━━━━━━━━━');
    const b = cyan1('╰━━━━━━━━━━━━━• 𝛥𝐗𝐈𝚶𝐍 𝐄𝐍𝐃 •━━━━━━━━━━━━━');
    const linea = cyan2('   ─────────◈────────◈─────────◈─────────');
    const sm = cyan3.bold('   ⚡ SISTEMA DI AUTENTICAZIONE ⚡');

    const qr = cyan3(' ⌬') + ' ' + chalk.bold.white('MODALITÀ [1]: Sincronizzazione QR');
    const codice = cyan3(' ⌬') + ' ' + chalk.bold.white('MODALITÀ [2]: Link tramite Codice');

    const istruzioni = [
        cyan3(' ❯') + whiteSoft.italic(' Inizializzazione protocollo di accesso...'),
        cyan3(' ❯') + whiteSoft.italic(' Scegli un\'opzione per stabilire il link.'),
        whiteSoft.italic(''),
        cyan1.italic('                𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌 • 𝐕𝟏.𝟎.𝟎'),
    ];

    const prompt = green.bold('\n⌬ axion-auth ➤ ');

    opzione = await question(`\n
${a}

          ${sm}
${linea}

${qr}
${codice}

${linea}
${istruzioni.join('\n')}

${b}
${prompt}`);

    if (!/^[1-2]$/.test(opzione)) {
        console.log(`\n${redSoft.bold('✖ ERRORE DI PROTOCOLLO: 𝛥𝐗𝐈𝚶𝐍-𝟒𝟎𝟒')}

${whiteSoft('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${redSoft.bold('⚠️ Input non riconosciuto dal Core.')} 
${whiteSoft('┌─⭓ Sono validi solo i parametri')} ${chalk.bold.green('1')} ${whiteSoft('o')} ${chalk.bold.green('2')}
${whiteSoft('└─⭓ Non inserire simboli, spazi o lettere.')}
${green.italic('\nSupporto Tecnico: Contatta lo sviluppatore deadly lo trovi nei gruppi oppure nel confing')}
`);
    }
    } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

const groupMetadataCache = new NodeCache({ stdTTL: 300, useClones: false });
global.groupCache = groupMetadataCache;

global.axionContext = async (conn, jid) => {
    let thumbnail = null

    try {
        const url = await conn.profilePictureUrl(jid, 'image')
        thumbnail = await (await fetch(url)).buffer()
    } catch {
        try {
            thumbnail = fs.readFileSync('./media/default-avatar.png')
        } catch {}
    }

    return {
        mentionedJid: [jid],
        externalAdReply: {
            body: ' ',
            thumbnail,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false
        }
    }
}

const logger = pino({
    level: 'silent',
});
global.jidCache = new NodeCache({ stdTTL: 600, useClones: false });
global.store = makeInMemoryStore({ logger });

if (!global.__storePruneInterval) {
    global.__storePruneInterval = setInterval(() => {
        try {
            const store = global.store;
            if (!store || !store.messages) return;

            const MESSAGE_LIMIT = 40;
            for (const jid of Object.keys(store.messages)) {
                const list = store.messages[jid];
                const arr = list?.array;
                if (!arr || arr.length <= MESSAGE_LIMIT) continue;

                const keep = new Set(arr.slice(-MESSAGE_LIMIT).map(m => m?.key?.id).filter(Boolean));
                if (typeof list.filter === 'function') {
                    list.filter(m => keep.has(m?.key?.id));
                }
            }

            if (store.presences && typeof store.presences === 'object') {
                for (const k of Object.keys(store.presences)) delete store.presences[k];
            }

            if (global.gc) global.gc();
        } catch (e) {
            console.error('Errore pulizia store:', e);
        }
    }, 5 * 60 * 1000);
}

const makeDecodeJid = (jidCache) => {
    return (jid) => {
        if (!jid) return jid;
        const cached = jidCache.get(jid);
        if (cached) return cached;

        let decoded = jid;
        if (/:\d+@/gi.test(jid)) {
            decoded = jidNormalizedUser(jid);
        }
        if (typeof decoded === 'object' && decoded.user && decoded.server) {
            decoded = `${decoded.user}@${decoded.server}`;
        }
        jidCache.set(jid, decoded);
        return decoded;
    };
};
const connectionOptions = {
    logger: logger,
    browser: Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    decodeJid: makeDecodeJid(global.jidCache),
    printQRInTerminal: opzione === '1' || methodCodeQR ? true : false,
    cachedGroupMetadata: async (jid) => {
        const cached = global.groupCache.get(jid);
        if (cached) return cached;
        try {
            const metadata = await global.conn.groupMetadata(global.conn.decodeJid(jid));
            global.groupCache.set(jid, metadata, { ttl: 300 });
            return metadata;
        } catch (err) {
            console.error('Errore nel recupero dei metadati del gruppo:', err);
            return {};
        }
    },
    getMessage: async (key) => {
        try {
            const jid = global.conn.decodeJid(key.remoteJid);
            const msg = await global.store.loadMessage(jid, key.id);
            return msg?.message || undefined;
        } catch (error) {
            console.error('Errore in getMessage:', error);
            return undefined;
        }
    },
    msgRetryCounterCache,
    retryRequestDelayMs: 500,
    maxMsgRetryCount: 5,
    shouldIgnoreJid: jid => false,
};
global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);
global.pluginDebugErrors = global.pluginDebugErrors || {};
global.pluginDebugErrors = global.pluginDebugErrors || {};

global.sendPluginErrorToChat = async function (title, err, extra = '', retry = 0) {
    try {
        const jid = String(global.botErrorChat || '')
            .trim()
            .replace(/^['"]|['"]$/g, '');

        if (!jid) return;

        if (!global.conn || !global.conn.user) {
            if (retry < 3) {
                setTimeout(() => {
                    global.sendPluginErrorToChat(title, err, extra, retry + 1);
                }, 5000);
            }
            return;
        }

        const messageText = err?.message || String(err) || 'Errore sconosciuto';
        const stackText = String(err?.stack || err || 'Nessuno stack disponibile').slice(0, 3500);
        const debugId = `dbg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        global.pluginDebugErrors[debugId] = {
            title,
            extra,
            message: messageText,
            stack: stackText,
            createdAt: Date.now()
        };

        const text =
`🛠️ *Errore rilevato*

*Titolo:* ${title}
${extra ? `*Plugin:* ${extra}\n` : ''}*Messaggio:* ${messageText}`;

        await global.conn.sendMessage(jid, {
            text,
            footer: 'Axion Bot',
            buttons: [
                {
                    buttonId: `.debugplugin ${debugId}`,
                    buttonText: { displayText: '🛠️ Debug completo' },
                    type: 1
                }
            ],
            headerType: 1
        });
    } catch (e) {
        if (retry < 3) {
            setTimeout(() => {
                global.sendPluginErrorToChat(title, err, extra, retry + 1);
            }, 5000);
        } else {
            console.error('[ERRORE] Invio errore plugin in chat fallito:', e);
        }
    }
};

if (!global.__pluginDebugCleanupInterval) {
    global.__pluginDebugCleanupInterval = setInterval(() => {
        try {
            const now = Date.now();
            const maxAge = 1000 * 60 * 30; // 30 minuti

            for (const [id, item] of Object.entries(global.pluginDebugErrors || {})) {
                if (!item?.createdAt) {
                    delete global.pluginDebugErrors[id];
                    continue;
                }

                if (now - item.createdAt > maxAge) {
                    delete global.pluginDebugErrors[id];
                }
            }
        } catch (e) {
            console.error('[ERRORE] Pulizia debug plugin fallita:', e);
        }
    }, 5 * 60 * 1000);
}

if (!fs.existsSync(`./${authFile}/creds.json`)) {