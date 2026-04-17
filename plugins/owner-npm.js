import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { builtinModules, createRequire } from 'module'

const require = createRequire(import.meta.url)

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`)
])

const getImports = (code) => {
  const imports = new Set()

  const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g
  const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g
  const dynamicImportRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g

  let match
  while ((match = importRegex.exec(code))) imports.add(match[1])
  while ((match = requireRegex.exec(code))) imports.add(match[1])
  while ((match = dynamicImportRegex.exec(code))) imports.add(match[1])

  return [...imports]
}

const isExternal = (pkg) => {
  return !pkg.startsWith('.') && !pkg.startsWith('/') && !builtins.has(pkg)
}

const getBasePackageName = (pkg) => {
  if (pkg.startsWith('@')) {
    const parts = pkg.split('/')
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : pkg
  }
  return pkg.split('/')[0]
}

const isInstalled = (pkg) => {
  try {
    require.resolve(pkg)
    return true
  } catch {
    try {
      require.resolve(getBasePackageName(pkg))
      return true
    } catch {
      return false
    }
  }
}

const scanMissing = () => {
  const pluginsDir = path.join(process.cwd(), 'plugins')
  let missing = {}

  if (!fs.existsSync(pluginsDir)) return missing

  const files = fs.readdirSync(pluginsDir)

  for (const file of files) {
    if (!file.endsWith('.js')) continue

    const code = fs.readFileSync(path.join(pluginsDir, file), 'utf8')
    const imports = getImports(code)

    for (const imp of imports) {
      if (!isExternal(imp)) continue

      const base = getBasePackageName(imp)

      if (!isInstalled(imp)) {
        if (!missing[base]) missing[base] = []
        missing[base].push(file)
      }
    }
  }

  return missing
}

const execPromise = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message || String(err))
      resolve(stdout)
    })
  })
}

const install = async (pkg) => {
  return await execPromise(`npm install ${pkg} --save`)
}

const uninstall = async (pkg) => {
  return await execPromise(`npm uninstall ${pkg}`)
}

const pushDeps = async (msg) => {
  await execPromise('git add package.json package-lock.json')

  try {
    await execPromise(`git commit -m "${msg.replace(/"/g, '\\"')}"`)
  } catch (e) {
    const text = String(e || '')
    if (!/nothing to commit|no changes added to commit/i.test(text)) throw e
  }

  await execPromise('git push')
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (command === 'dipendenze') {
    const missing = scanMissing()

    if (!Object.keys(missing).length) {
      return m.reply('✅ Nessuna dipendenza mancante')
    }

    const mods = Object.keys(missing)

    let text = `📦 *DIPENDENZE MANCANTI*\n\n`

    for (const [dep, files] of Object.entries(missing)) {
      text += `❌ *${dep}*\n`
      text += `   ↳ ${[...new Set(files)].join(', ')}\n\n`
    }

    const primo = mods[0]
    const buttons = primo ? [
      {
        buttonId: `${usedPrefix}installa ${primo}`,
        buttonText: { displayText: `📥 Installa ${primo}` },
        type: 1
      },
      {
        buttonId: `${usedPrefix}installapush ${primo}`,
        buttonText: { displayText: `🚀 Installa+Push ${primo}` },
        type: 1
      },
      {
        buttonId: `${usedPrefix}installaall`,
        buttonText: { displayText: '📦 Installa tutto' },
        type: 1
      }
    ] : []

    if (mods.length > 1) {
      text += `⚠️ Bottone rapido disponibile per il primo modulo.\n`
      text += `Usa:\n`
      text += `• ${usedPrefix}installa <modulo>\n`
      text += `• ${usedPrefix}installapush <modulo>\n`
      text += `• ${usedPrefix}rimuovi <modulo>\n`
      text += `• ${usedPrefix}rimuovipush <modulo>`
    }

    return conn.sendMessage(m.chat, {
      text,
      footer: 'Gestione dipendenze',
      buttons,
      headerType: 1
    }, { quoted: m })
  }

  if (command === 'installa') {
    let mod = (args.join(' ') || '').replace(/[()]/g, '').trim()
    if (!mod) return m.reply(`📦 Usa: *${usedPrefix}installa modulo*`)

    await m.reply(`⏳ Installo *${mod}*...`)

    try {
      await install(mod)
      return m.reply(
`✅ Installato: *${mod}*

⚠️ Modifica locale completata.
Per sincronizzarla con tutti i bot usa:
*${usedPrefix}installapush ${mod}*

Oppure pusha manualmente *package.json* e *package-lock.json*.`)
    } catch (e) {
      return m.reply(`❌ Errore:\n${String(e).slice(0, 300)}`)
    }
  }

  if (command === 'installapush') {
    let mod = (args.join(' ') || '').replace(/[()]/g, '').trim()
    if (!mod) return m.reply(`📦 Usa: *${usedPrefix}installapush modulo*`)

    await m.reply(`⏳ Installo e pusho *${mod}*...`)

    try {
      await install(mod)
      await pushDeps(`add dependency: ${mod}`)

      return m.reply(
`✅ Installato e pushato: *${mod}*

📦 *package.json* e *package-lock.json* sono stati sincronizzati nel repo.`)
    } catch (e) {
      return m.reply(`❌ Errore:\n${String(e).slice(0, 500)}`)
    }
  }

  if (command === 'rimuovi') {
    let mod = (args.join(' ') || '').replace(/[()]/g, '').trim()
    if (!mod) return m.reply(`📦 Usa: *${usedPrefix}rimuovi modulo*`)

    await m.reply(`⏳ Rimuovo *${mod}*...`)

    try {
      await uninstall(mod)
      return m.reply(
`✅ Rimosso: *${mod}*

⚠️ Modifica locale completata.
Per sincronizzarla con tutti i bot usa:
*${usedPrefix}rimuovipush ${mod}*`)
    } catch (e) {
      return m.reply(`❌ Errore:\n${String(e).slice(0, 300)}`)
    }
  }

  if (command === 'rimuovipush') {
    let mod = (args.join(' ') || '').replace(/[()]/g, '').trim()
    if (!mod) return m.reply(`📦 Usa: *${usedPrefix}rimuovipush modulo*`)

    await m.reply(`⏳ Rimuovo e pusho *${mod}*...`)

    try {
      await uninstall(mod)
      await pushDeps(`remove dependency: ${mod}`)

      return m.reply(
`✅ Rimosso e pushato: *${mod}*

📦 *package.json* e *package-lock.json* sono stati sincronizzati nel repo.`)
    } catch (e) {
      return m.reply(`❌ Errore:\n${String(e).slice(0, 500)}`)
    }
  }

  if (command === 'installaall') {
    const missing = scanMissing()
    const mods = Object.keys(missing)

    if (!mods.length) return m.reply('✅ Nessuna dipendenza mancante')

    await m.reply(`🚀 Installo:\n${mods.join(', ')}`)

    let ok = []
    let ko = []

    for (const mod of mods) {
      try {
        await install(mod)
        ok.push(mod)
      } catch {
        ko.push(mod)
      }
    }

    let out = `✅ Installate: ${ok.length ? ok.join(', ') : 'nessuna'}`
    if (ko.length) out += `\n❌ Fallite: ${ko.join(', ')}`

    out += `\n\n⚠️ Modifiche locali completate.\nPer sincronizzarle con tutti i bot devi pushare package.json e package-lock.json.`

    return m.reply(out)
  }
}

handler.command = /^(dipendenze|installa|installapush|installaall|rimuovi|rimuovipush)$/i
handler.owner = true

export default handler