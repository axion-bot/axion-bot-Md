import fs from 'fs'
import path from 'path'
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

let handler = async (m, { conn }) => {
  const chat = m.chat

  try {
    const pluginsDir = path.join(process.cwd(), 'plugins')

    let missing = {}

    if (fs.existsSync(pluginsDir)) {
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
    }

    let text = `📦 *DIPENDENZE MANCANTI*\n\n`

    if (Object.keys(missing).length === 0) {
      text += `✅ Nessun problema rilevato`
    } else {
      for (const [dep, files] of Object.entries(missing)) {
        const unique = [...new Set(files)]
        text += `❌ *${dep}*\n`
        text += `   ↳ ${unique.join(', ')}\n`
      }
    }

    await conn.sendMessage(chat, { text }, { quoted: m })

  } catch (e) {
    await conn.sendMessage(chat, {
      text: `❌ Errore: ${e.message}`
    }, { quoted: m })
  }
}

handler.help = ['dipendenze']
handler.tags = ['info']
handler.command = ['dipendenze']

export default handler