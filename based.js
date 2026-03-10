process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import { format } from 'util';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';

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
const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, makeInMemoryStore } = await import('@realvare/baileys');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
protoType();
serialize();
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
        // Palette Colori: Tech Blue & Neon Green
        const primary = chalk.hex('#00F5FF');   // Bright Cyan
        const secondary = chalk.hex('#008B8B'); // Darker Cyan
        const accent = chalk.hex('#39FF14');    // Neon Green
        const muted = chalk.hex('#95A5A6');     // Gray
        const error = chalk.hex('#FF4742');     // Soft Red
        const white = chalk.white.bold;

        const header = primary('╔════════════════════════════════════════════════╗');
        const footer = primary('╚════════════════════════════════════════════════╝');
        const title = white('      𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 — PUBLIC DEPLOYMENT');
        const divider = secondary('   ──────────────────────────────────────────');

        const opt1 = `${primary('⌬ [01]')} ${white('AUTENTICAZIONE TRAMITE QR CODE')}`;
        const opt2 = `${primary('⌬ [02]')} ${white('AUTENTICAZIONE TRAMITE PAIRING CODE')}`;

        const info = [
            `${secondary('»')} ${muted('Assicurati di avere una connessione stabile.')}`,
            `${secondary('»')} ${muted('Il codice scadrà dopo pochi minuti.')}`,
            `${secondary('»')} ${primary.italic('Powered by Axion Ecosystem • v2.6.0')}`,
        ];

        const prompt = accent.bold('\n ❯ SELEZIONA MODALITÀ: ');

        opzione = await question(`
${header}
${title}
${divider}

  ${opt1}
  ${opt2}

${divider}
  ${info.join('\n  ')}
${footer}
${prompt}`);

        if (!/^[1-2]$/.test(opzione)) {
            console.log(`
${error('  ✖ ERRORE DI INPUT')}
  ${divider}
  ${muted('  Si prega di inserire solo')} ${accent('1')} ${muted('o')} ${accent('2')}
  ${muted('  Rilevato carattere non supportato.')}
  ${divider}
  ${primary.italic('  Supporto tecnico: t.me/axion_support')}
            `);
        }
    } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

const groupMetadataCache = new NodeCache({ stdTTL: 300, useClones: false });
global.groupCache = groupMetadataCache;
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

if (!fs.existsSync(`./${authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        opzione = '2';
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                // Colore Cyan Elettrico per la domanda e Neon Green per l'esempio
                phoneNumber = await question(chalk.bold.hex('#00F5FF')(`\n ⚡ INSERISCI IL NUMERO DI WHATSAPP\n`) + 
                                           chalk.hex('#95A5A6')(`    Esempio: `) + chalk.bold.hex('#39FF14')(`+393471234567\n`) + 
                                           chalk.hex('#00F5FF')(' ❯ '));
                addNumber = phoneNumber.replace(/\D/g, '');
                if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`;
            }
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(addNumber, 'AXIONBOT');
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                // Design del codice di abbinamento in Cyan e Bianco
                console.log(chalk.bold.white.bgHex('#008B8B')(' 🔑 CODICE DI ABBINAMENTO: '), chalk.bold.hex('#39FF14')(codeBot));
            }, 3000);
        }
    }
}

conn.isInit = false;
if (!opts['test']) {
    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write();
        if (opts['autocleartmp']) {
            const tmp = ['temp'];
            tmp.forEach(dirName => {
                if (!existsSync(dirName)) return;
                try {
                    readdirSync(dirName).forEach(file => {
                        const filePath = join(dirName, file);
                        try {
                            const stats = statSync(filePath);
                            if (stats.isFile() && (Date.now() - stats.mtimeMs) > 2 * 60 * 1000) {
                                unlinkSync(filePath);
                            }
                        } catch {}
                    });
                } catch {}
            });
        }
    }, 30 * 1000);
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT);

async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    global.stopped = connection;
    if (isNewLogin) conn.isInit = true;
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    if (code && code !== DisconnectReason.loggedOut) {
        await global.reloadHandler(true).catch(console.error);
        global.timestamp.connect = new Date;
    }
    if (global.db.data == null) await loadDatabase();

    if (qr && (opzione === '1' || methodCodeQR) && !global.qrGenerated) {
        // Messaggio QR Code in Cyan e Neon
        console.log(chalk.bold.hex('#00F5FF')(`\n 🌀 SCANSIONA IL CODICE QR — SCADE TRA 45 SECONDI 🌀`));
        global.qrGenerated = true;
    }

    if (connection === 'open') {
        global.qrGenerated = false;
        global.connectionMessagesPrinted = {};
        if (!global.isLogoPrinted) {
            const techGradient = [
                '#00F5FF', '#00E5EE', '#00CED1', '#20B2AA', '#39FF14', '#2ECC71', '#39FF14', 
                '#20B2AA', '#00CED1', '#00E5EE', '#00F5FF', '#00CED1', '#2ECC71', '#00F5FF'
            ];
        }
    }
}

const axionbot = [
    `   █████╗ ██╗  ██╗██╗ ██████╗ ███╗   ██╗    ██████╗  ██████╗ ████████╗`,
    `  ██╔══██╗╚██╗██╔╝██║██╔═══██╗████╗  ██║    ██╔══██╗██╔═══██╗╚══██╔══╝`,
    `  ███████║ ╚███╔╝ ██║██║   ██║██╔██╗ ██║    ██████╔╝██║   ██║   ██║   `,
    `  ██╔══██║ ██╔██╗ ██║██║   ██║██║╚██╗██║    ██╔══██╗██║   ██║   ██║   `,
    `  ██║  ██║██╔╝ ██╗██║╚██████╔╝██║ ╚████║    ██████╔╝╚██████╔╝   ██║   `,
    `  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝    ╚═════╝  ╚═════╝    ╚═╝   `,
    `                                                                      `,
    `                   [ SYSTEM ONLINE - V${global.versione} ]                   `
];

// Utilizzo la palette techGradient definita in precedenza (Cyan/Neon Green)
const techGradient = [
    '#00F5FF', '#00E5EE', '#00CED1', '#20B2AA', '#39FF14', '#2ECC71', '#39FF14', 
    '#20B2AA', '#00CED1', '#00E5EE', '#00F5FF', '#00CED1', '#2ECC71', '#00F5FF'
];

axionbot.forEach((line, i) => {
    const color = techGradient[i] || techGradient[techGradient.length - 1];
    console.log(chalk.hex(color).bold(line));
});

global.isLogoPrinted = true;

if (connection === 'close') {
    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

    if (reason === DisconnectReason.badSession) {
        if (!global.connectionMessagesPrinted.badSession) {
            console.log(chalk.bold.hex('#FF4742')(`\n ⚠️ [SESSION ERROR] Sessione non valida. Elimina la cartella ${global.authFile} e riavvia.`));
            global.connectionMessagesPrinted.badSession = true;
        }
        await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
        if (!global.connectionMessagesPrinted.connectionLost) {
            console.log(chalk.hex('#00F5FF').bold(`\n 📡 [SIGNAL LOST] Connessione persa. Riconnessione in corso...\n 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`));
            global.connectionMessagesPrinted.connectionLost = true;
        }
        await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced) {
        if (!global.connectionMessagesPrinted.connectionReplaced) {
            console.log(chalk.hex('#00CED1').bold(` 📑 [REPLACED] Un'altra sessione è stata aperta. Chiudi quella attuale.\n 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`));
            global.connectionMessagesPrinted.connectionReplaced = true;
        }
    } else if (reason === DisconnectReason.loggedOut) {
        console.log(chalk.bold.hex('#FF4742')(`\n ⚠️ [LOGOUT] Disconnessione effettuata. Cartella ${global.authFile} rimossa. Riavvia per il nuovo login.`));
        try {
            if (fs.existsSync(global.authFile)) {
                fs.rmSync(global.authFile, { recursive: true, force: true });
            }
        } catch (e) {
            console.error('Errore reset sessione:', e);
        }
        process.exit(1);
    } else if (reason === DisconnectReason.restartRequired) {
        if (!global.connectionMessagesPrinted.restartRequired) {
            console.log(chalk.hex('#00F5FF').bold(`\n 🔄 [RESTART] Sincronizzazione con il server in corso...`));
            global.connectionMessagesPrinted.restartRequired = true;
        }
        await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.timedOut) {
        if (!global.connectionMessagesPrinted.timedOut) {
            console.log(chalk.hex('#00CED1').bold(`\n ⏳ [TIMEOUT] Tempo di connessione scaduto. Ripristino in corso...\n 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`));
            global.connectionMessagesPrinted.timedOut = true;
        }
        await global.reloadHandler(true).catch(console.error);
    } else if (reason !== DisconnectReason.connectionClosed) {
        if (!global.connectionMessagesPrinted.unknown) {
            console.log(chalk.bold.hex('#FF4742')(`\n ⚠️ [UNKNOWN] Errore critico: ${reason || '???'} >> ${connection || '???'}`));
            global.connectionMessagesPrinted.unknown = true;
        }
        await global.reloadHandler(true).catch(console.error);
    }
} // <--- Questa ora chiude correttamente il blocco "if (connection === 'close')"

process.on('uncaughtException', console.error);

(async () => {
    try {
        conn.ev.on('connection.update', connectionUpdate);
        conn.ev.on('creds.update', saveCreds);
        console.log(chalk.hex('#39FF14').bold(` ✅ 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 ONLINE - Connesso correttamente`));
    } catch (error) {
        console.error(chalk.bold.bgHex('#FF4742')(` 🥀 Errore nell'avvio del sistema: `, error));
    }
})();

// Gestione Reload Plugins con colori aggiornati
global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
        const dir = global.__filename(join(pluginFolder, filename), true);
        if (filename in global.plugins) {
            if (existsSync(dir)) conn.logger.info(chalk.hex('#00F5FF')(` 🛠️ MODIFICATO - '${filename}'`));
            else {
                conn.logger.warn(` 🗑️ ELIMINATO: '${filename}'`);
                return delete global.plugins[filename];
            }
        } else conn.logger.info(chalk.hex('#39FF14')(` 🆕 RILEVATO: '${filename}'`));

        try {
            const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
            global.plugins[filename] = module.default || module;
        } catch (e) {
            conn.logger.error(` ⚠️ ERRORE PLUGIN: '${filename}\n${format(e)}'`);
        } finally {
            global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
        }
    }
};

// Auto-Pulizia Directory Temp
setInterval(async () => {
    if (global.stopped === 'close' || !conn || !conn.user) return;
    const deleted = clearDirectory(join(__dirname, 'temp'));
    if (deleted > 0) {
        console.log(chalk.bold.hex('#00F5FF')(`\n ╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━──⊷`));
        console.log(chalk.bold.hex('#39FF14')(` 🟢 PULIZIA MULTIMEDIA EFFETTUATA`));
        console.log(chalk.hex('#ECF0F1')(` ┃ File rimossi: ${deleted}`));
        console.log(chalk.bold.hex('#00F5FF')(` ╰━━━━━━━━━━━━━━━━ 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 ━━──⊷`));
    }
}, 1000 * 60 * 60);

// Watcher Main File
let filePath = fileURLToPath(import.meta.url);
const mainWatcher = watch(filePath, async () => {
  console.log(chalk.bgHex('#008B8B')(chalk.white.bold(" 📝 [SYSTEM] File 'main.js' Aggiornato ")));
});
