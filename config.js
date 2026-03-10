import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import chalk from 'chalk'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import NodeCache from 'node-cache'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const moduleCache = new NodeCache({ stdTTL: 300 });

global.sam = ['212786545539']
global.owner = [
  ['212786545539', '𝕯𝖊ⱥ𝖉𝖑𝐲', true],
  ['212601646793', 'zein', true],
  ['xxxxxxxxxx'],
  ['xxxxxxxxxx']
]
global.mods = ['xxxxxxxxxx', 'xxxxxxxxxx']
global.prems = ['xxxxxxxxxx', 'xxxxxxxxxx']

global.nomebot   = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
global.nomepack  = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
global.wm        = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
global.autore    = '𝕯𝖊ⱥ𝖉𝖑𝐲'
global.dev       = '𝕯𝖊ⱥ𝖉𝖑𝐲'
global.versione  = pkg.version
global.testobot  = `AXION-CORE-V${pkg.version}`
global.errore    = '⚠️ *[SYSTEM ERROR]* Usa `.segnala` per inviare il log allo staff.'

// 🌐 SOCIAL & LINKS
global.repobot   = 'https://github.com/axion-bot/axion-bot'
global.gruppo    = 'in arrivo' 
global.canale    = 'in arrivo'
global.insta     = 'https://www.instagram.com/darius._.n'

global.cheerio   = cheerio
global.fs        = fs
global.fetch     = fetch
global.axios     = axios
global.moment    = moment

global.APIKeys = {
    spotifyclientid: 'axion',
    spotifysecret:   'axion',
    browserless:     'axion',
    screenshotone:   'axion',
    tmdb:            'axion',
    gemini:          'axion',
    ocrspace:        'axion',
    assemblyai:      'axion',
    google:          'axion',
    googlex:         'axion',
    googleCX:        'axion',
    genius:          'axion',
    unsplash:        'axion',
    removebg:        'FEx4CYmYN1QRQWD1mbZp87jV',
    openrouter:      'axion',
    lastfm:          '36f859a1fc4121e7f0e931806507d5f9',
}

let filePath = fileURLToPath(import.meta.url)
let fileUrl = pathToFileURL(filePath).href

const reloadConfig = async () => {
  const cached = moduleCache.get(fileUrl);
  if (cached) return cached;
  
  unwatchFile(filePath)
  console.log(chalk.bgCyan.black(" SYSTEM ") + chalk.cyan(` File 'config.js' aggiornato con successo.`))
  
  const module = await import(`${fileUrl}?update=${Date.now()}`)
  moduleCache.set(fileUrl, module, { ttl: 300 });
  return module;
}

watchFile(filePath, reloadConfig)
