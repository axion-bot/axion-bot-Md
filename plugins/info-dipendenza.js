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
    const pkgPath = path.join(process.cwd(), 'package.json')
    const pluginsDir = path.join(process.cwd(), 'plugins')

    if (!fs.existsSync(pkgPath)) {
      return conn.sendMessage(chat, { text: '❌ package.json non trovato.' }, { quoted: m })
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    const deps = pkg.dependencies || {}
    const devDeps = pkg.devDependencies || {}

    let text = `📦 *DIPENDENZE BOT*\n\n`
    text += `🧠 *Node:* ${process.version}\n\n`

    text += `📚 *Dipendenze installate:*\n`
    if (!Object.keys(deps).length) {
      text += `- Nessuna\n`
    } else {
      for (const [name, version] of Object.entries(deps)) {
        text += `${isInstalled(name) ? '✅' : '❌'} ${name} → ${version}\n`
      }
    }

    text += `\n🛠️ *Dipendenze di sviluppo:*\n`
    if (!Object.keys(devDeps).length) {
      text += `- Nessuna\n`
    } else {
      for (const [name, version] of Object.entries(devDeps)) {
        text += `${isInstalled(name) ? '✅' : '❌'} ${name} → ${version}\n`
      }
    }

    const missing = {}
    const used = {}

    if (fs.existsSync(pluginsDir)) {
      const files = fs.readdirSync(pluginsDir)

      for (const file of files) {
        if (!file.endsWith('.js')) continue

        const fullPath = path.join(pluginsDir, file)
        const code = fs.readFileSync(fullPath, 'utf8')
        const imports = getImports(code)

        for (const imp of imports) {
          if (!isExternal(imp)) continue

          const baseName = getBasePackageName(imp)

          if (!used[baseName]) used[baseName] = []
          used[baseName].push(file)

          if (!isInstalled(imp)) {
            if (!missing[baseName]) missing[baseName] = []
            missing[baseName].push(file)
          }
        }
      }
    }

    text += `\n📌 *Dipendenze usate nei plugin:*\n`
    if (Object.keys(used).length === 0) {
      text += `- Nessuna rilevata\n`
    } else {
      for (const [depName, files] of Object.entries(used)) {
        const uniqueFiles = [...new Set(files)]
        text += `• ${depName}\n`
        text += `   ↳ ${uniqueFiles.join(', ')}\n`
      }
    }

    text += `\n⚠️ *Dipendenze mancanti nei plugin:*\n`
    if (Object.keys(missing).length === 0) {
      text += `✅ Nessun problema rilevato\n`
    } else {
      for (const [depName, files] of Object.entries(missing)) {
        const uniqueFiles = [...new Set(files)]
        text += `❌ *${depName}*\n`
        text += `   ↳ usata in: ${uniqueFiles.join(', ')}\n`
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