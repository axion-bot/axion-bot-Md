// Plugin pacchetti by Bonzino

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { builtinModules, createRequire } from 'module'

const require = createRequire(import.meta.url)

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`)
])

function getImports(code) {
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

function isExternal(pkg) {
  return !pkg.startsWith('.') && !pkg.startsWith('/') && !builtins.has(pkg)
}

function getBasePackageName(pkg) {
  if (pkg.startsWith('@')) {
    const parts = pkg.split('/')
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : pkg
  }

  return pkg.split('/')[0]
}

function isInstalled(pkg) {
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

function getJsFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out

  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)

    if (stat.isDirectory()) getJsFiles(full, out)
    else if (file.endsWith('.js')) out.push(full)
  }

  return out
}

function scanImports() {
  const pluginsDir = path.join(process.cwd(), 'plugins')
  const files = getJsFiles(pluginsDir)
  const found = {}

  for (const filePath of files) {
    const file = path.relative(process.cwd(), filePath)
    const code = fs.readFileSync(filePath, 'utf8')
    const imports = getImports(code)

    for (const imp of imports) {
      if (!isExternal(imp)) continue

      const base = getBasePackageName(imp)

      if (!found[base]) found[base] = []
      found[base].push(file)
    }
  }

  return found
}

function scanMissing() {
  const found = scanImports()
  const missing = {}

  for (const [dep, files] of Object.entries(found)) {
    if (!isInstalled(dep)) {
      missing[dep] = [...new Set(files)]
    }
  }

  return missing
}

function getPackageDeps() {
  const packagePath = path.join(process.cwd(), 'package.json')

  if (!fs.existsSync(packagePath)) return {}

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    return {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    }
  } catch {
    return {}
  }
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message || String(err))
      resolve(stdout)
    })
  })
}

async function install(pkg) {
  return await execPromise(`npm install ${pkg} --save`)
}

async function uninstall(pkg) {
  return await execPromise(`npm uninstall ${pkg}`)
}

async function pushDeps(msg) {
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
  const cmd = String(command || '').toLowerCase()

  if (cmd === 'pacchetti' || cmd === 'dipendenze') {
    return conn.sendMessage(m.chat, {
      text:
`📦 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐏𝐀𝐂𝐂𝐇𝐄𝐓𝐓𝐈📦*
*𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐬𝐚 𝐯𝐮𝐨𝐢 𝐜𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐚𝐫𝐞:*`,

      footer: '\n𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: [
        {
          buttonId: `${usedPrefix}dipinstallate`,
          buttonText: { displayText: '✅️ Dipendenze installate' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}dipmancanti`,
          buttonText: { displayText: '⚠️ Dipendenze mancanti' },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (cmd === 'dipinstallate') {
    const deps = getPackageDeps()
    const names = Object.keys(deps).sort()

    if (!names.length) {
      return m.reply('*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐝𝐢𝐩𝐞𝐧𝐝𝐞𝐧𝐳𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.*')
    }

    let text = `
*𝐃𝐈𝐏𝐄𝐍𝐃𝐄𝐍𝐙𝐄 𝐈𝐍𝐒𝐓𝐀𝐋𝐋𝐀𝐓𝐄*

*📦 𝐓𝐨𝐭𝐚𝐥𝐞:* *${names.length}*

`

    for (const dep of names) {
      text += `*✅ ${dep}* *${deps[dep]}*\n`
    }

    return conn.sendMessage(m.chat, {
      text,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: [
        { buttonId: `${usedPrefix}dipmancanti`, buttonText: { displayText: '⚠️ Mancanti' }, type: 1 },
        { buttonId: `${usedPrefix}pacchetti`, buttonText: { displayText: '⬅️ Menu' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (cmd === 'dipmancanti') {
    const missing = scanMissing()
    const mods = Object.keys(missing)

    if (!mods.length) {
      return conn.sendMessage(m.chat, {
        text:`
*✅ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐦𝐚𝐧𝐜𝐚𝐧𝐭𝐞.*`,
        footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
        buttons: [
          { buttonId: `${usedPrefix}dipinstallate`, buttonText: { displayText: 'Installate' }, type: 1 },
          { buttonId: `${usedPrefix}pacchetti`, buttonText: { displayText: '⬅️ Menu' }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m })
    }

    let text = `
*⚠️𝐃𝐈𝐏𝐄𝐍𝐃𝐄𝐍𝐙𝐄 𝐌𝐀𝐍𝐂𝐀𝐍𝐓𝐈⚠️*

*📦 𝐓𝐨𝐭𝐚𝐥𝐞:* *${mods.length}*

`

    for (const [dep, files] of Object.entries(missing)) {
      text += `*❌ ${dep}*\n`
      text += `*↳ 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐨 𝐝𝐚:* *${files.join(', ')}*\n\n`
    }

    const primo = mods[0]

    return conn.sendMessage(m.chat, {
      text,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: [
        { buttonId: `${usedPrefix}installa ${primo}`, buttonText: { displayText: `📥 Installa ${primo}` }, type: 1 },
        { buttonId: `${usedPrefix}installapush ${primo}`, buttonText: { displayText: `🚀 Installa+Push ${primo}` }, type: 1 },
        { buttonId: `${usedPrefix}installaall`, buttonText: { displayText: '📦 Installa tutto' }, type: 1 },
        { buttonId: `${usedPrefix}pacchetti`, buttonText: { displayText: '⬅️ Menu' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (cmd === 'installa') {
    const mod = (args.join(' ') || '').replace(/[()]/g, '').trim()
    if (!mod) return m.reply(`*📦 𝐔𝐬𝐚:* *${usedPrefix}installa modulo*`)

    await m.reply(`*⏳ 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐨:* *${mod}*...`)

    try {
      await install(mod)
      return m.reply(`*✅ 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨:* *${mod}*`)
    } catch (e) {
      return m.reply(`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞:*\n\`\`\`${String(e).slice(0, 500)}\`\`\``)
    }
  }

  if (cmd === 'installapush') {
    const mod = (args.join(' ') || '').replace(/[()]/g, '').trim()
    if (!mod) return m.reply(`*📦 𝐔𝐬𝐚:* *${usedPrefix}installapush modulo*`)

    await m.reply(`*⏳ 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐨 𝐞 𝐩𝐮𝐬𝐡𝐨:* *${mod}*...`)

    try {
      await install(mod)
      await pushDeps(`add dependency: ${mod}`)
      return m.reply(`*✅ 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨 𝐞 𝐩𝐮𝐬𝐡𝐚𝐭𝐨:* *${mod}*`)
    } catch (e) {
      return m.reply(`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞:*\n\`\`\`${String(e).slice(0, 700)}\`\`\``)
    }
  }

  if (cmd === 'rimuovi') {
    const mod = (args.join(' ') || '').replace(/[()]/g, '').trim()
    if (!mod) return m.reply(`*📦 𝐔𝐬𝐚:* *${usedPrefix}rimuovi modulo*`)

    await m.reply(`*⏳ 𝐑𝐢𝐦𝐮𝐨𝐯𝐨:* *${mod}*...`)

    try {
      await uninstall(mod)
      return m.reply(`*✅ 𝐑𝐢𝐦𝐨𝐬𝐬𝐨:* *${mod}*`)
    } catch (e) {
      return m.reply(`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞:*\n\`\`\`${String(e).slice(0, 500)}\`\`\``)
    }
  }

  if (cmd === 'rimuovipush') {
    const mod = (args.join(' ') || '').replace(/[()]/g, '').trim()
    if (!mod) return m.reply(`*📦 𝐔𝐬𝐚:* *${usedPrefix}rimuovipush modulo*`)

    await m.reply(`*⏳ 𝐑𝐢𝐦𝐮𝐨𝐯𝐨 𝐞 𝐩𝐮𝐬𝐡𝐨:* *${mod}*...`)

    try {
      await uninstall(mod)
      await pushDeps(`remove dependency: ${mod}`)
      return m.reply(`*✅ 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 𝐞 𝐩𝐮𝐬𝐡𝐚𝐭𝐨:* *${mod}*`)
    } catch (e) {
      return m.reply(`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞:*\n\`\`\`${String(e).slice(0, 700)}\`\`\``)
    }
  }

  if (cmd === 'installaall') {
    const missing = scanMissing()
    const mods = Object.keys(missing)

    if (!mods.length) {
      return m.reply('*✅ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐦𝐚𝐧𝐜𝐚𝐧𝐭𝐞.*')
    }

    await m.reply(`*🚀 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐨:*\n*${mods.join(', ')}*`)

    const ok = []
    const ko = []

    for (const mod of mods) {
      try {
        await install(mod)
        ok.push(mod)
      } catch {
        ko.push(mod)
      }
    }

    let out = `*✅ 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐢:* *${ok.length ? ok.join(', ') : 'nessuno'}*`
    if (ko.length) out += `\n*❌ 𝐅𝐚𝐥𝐥𝐢𝐭𝐢:* *${ko.join(', ')}*`

    return m.reply(out)
  }
}

handler.command = /^(pacchetti|dipendenze|dipinstallate|dipmancanti|installa|installapush|installaall|rimuovi|rimuovipush)$/i
handler.owner = true

export default handler