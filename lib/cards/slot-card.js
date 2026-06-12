import fs from 'fs'
import path from 'path'
import { createCanvas } from 'canvas'
import { spawn } from 'child_process'

const symbols = ['💎', '👑', '🔮', '🧿', '🔱', '💠', '⭐', '⚜️']

export async function generateSlotMp4(finalResult, resultInfo) {
  const tmpDir = path.resolve('./tmp')
  fs.mkdirSync(tmpDir, { recursive: true })

  const id = Date.now()
  const mp4Path = path.join(tmpDir, `slot-${id}.mp4`)

  const width = 1280
  const height = 720
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.scale(1.3333, 1.3333)

  const ffmpegProcess = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', '11',
    '-i', '-',
    '-movflags', 'faststart',
    '-pix_fmt', 'yuv420p',
    '-vcodec', 'libx264',
    mp4Path
  ])

  ffmpegProcess.stderr.on('data', () => {})

  const writeFrameToFfmpeg = () => {
    const buffer = canvas.toBuffer('image/png')
    ffmpegProcess.stdin.write(buffer)
  }

  for (let i = 0; i < 26; i++) {
    drawSlotFrame(ctx, 960, 540, generateRandomGrid(), true, null, i)
    writeFrameToFfmpeg()
  }

  drawSlotFrame(ctx, 960, 540, finalResult, false, resultInfo, 0)
  for (let i = 0; i < 36; i++) {
    writeFrameToFfmpeg()
  }

  ffmpegProcess.stdin.end()

  await new Promise((resolve, reject) => {
    ffmpegProcess.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`FFmpeg fallito con codice: ${code}`))
    })
  })

  return mp4Path
}

function drawSlotFrame(ctx, width, height, result, spinning, resultInfo, frame = 0) {
  drawBackground(ctx, width, height)
  drawTitle(ctx, width)
  drawOpenSlot(ctx, width, result, spinning, resultInfo, frame)
  drawResult(ctx, width, height, spinning, resultInfo)
}

function drawBackground(ctx, width, height) {
  const bg = ctx.createLinearGradient(0, 0, 0, height)
  bg.addColorStop(0, '#260044')
  bg.addColorStop(0.45, '#4b0b72')
  bg.addColorStop(1, '#12001f')

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createRadialGradient(width / 2, 250, 60, width / 2, 250, 560)
  glow.addColorStop(0, 'rgba(255,210,110,0.20)')
  glow.addColorStop(0.45, 'rgba(170,60,255,0.16)')
  glow.addColorStop(1, 'rgba(0,0,0,0.45)')

  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255,220,120,0.12)'
  ctx.fillRect(0, 0, width, 4)
  ctx.fillRect(0, height - 4, width, 4)
}

function drawTitle(ctx, width) {
  ctx.textAlign = 'center'
  ctx.font = 'bold 43px Sans'
  ctx.fillStyle = '#fff4d6'
  ctx.shadowColor = 'rgba(0,0,0,0.75)'
  ctx.shadowBlur = 9
  ctx.fillText('✦ AXION SLOT ✦', width / 2, 66)
  ctx.shadowBlur = 0
}

function drawOpenSlot(ctx, width, result, spinning, resultInfo, frame) {
  const areaX = 92
  const areaY = 92
  const areaW = width - 184
  const areaH = 300
  const colW = areaW / 3
  const rowH = areaH / 3

  ctx.fillStyle = 'rgba(20,0,35,0.58)'
  roundRect(ctx, areaX, areaY, areaW, areaH, 28, true)

  ctx.strokeStyle = 'rgba(255,220,120,0.78)'
  ctx.lineWidth = 4
  roundRect(ctx, areaX, areaY, areaW, areaH, 28, false, true)

  ctx.strokeStyle = 'rgba(255,220,120,0.72)'
  ctx.lineWidth = 3

  for (let i = 1; i < 3; i++) {
    const x = areaX + colW * i
    ctx.beginPath()
    ctx.moveTo(x, areaY + 16)
    ctx.lineTo(x, areaY + areaH - 16)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2

  for (let i = 1; i < 3; i++) {
    const y = areaY + rowH * i
    ctx.beginPath()
    ctx.moveTo(areaX + 24, y)
    ctx.lineTo(areaX + areaW - 24, y)
    ctx.stroke()
  }

  const winningCells =
    !spinning && resultInfo?.win && Array.isArray(resultInfo?.winningLine)
      ? getWinningCellsFromLine(resultInfo.winningLine)
      : new Set()

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cx = areaX + colW * col + colW / 2
      const cy = areaY + rowH * row + rowH / 2
      const symbol = spinning ? pick(symbols) : result[row][col]
      const isWinning = winningCells.has(`${row}-${col}`)

      if (isWinning) drawWinningSquare(ctx, cx, cy)

      if (spinning) {
        ctx.save()
        ctx.globalAlpha = 0.52 + ((frame + row + col) % 3) * 0.14
        drawSymbol(ctx, symbol, cx, cy, 58, false)
        ctx.restore()
      } else {
        drawSymbol(ctx, symbol, cx, cy, isWinning ? 72 : 65, isWinning)
      }
    }
  }
}

function drawWinningSquare(ctx, cx, cy) {
  ctx.save()

  ctx.shadowColor = 'rgba(0,255,160,0.85)'
  ctx.shadowBlur = 18

  ctx.fillStyle = 'rgba(0,255,160,0.22)'
  roundRect(ctx, cx - 76, cy - 43, 152, 86, 18, true)

  ctx.strokeStyle = '#00ffa0'
  ctx.lineWidth = 4
  roundRect(ctx, cx - 76, cy - 43, 152, 86, 18, false, true)

  ctx.strokeStyle = 'rgba(255,255,255,0.65)'
  ctx.lineWidth = 1.5
  roundRect(ctx, cx - 68, cy - 35, 136, 70, 14, false, true)

  ctx.restore()
}

function drawResult(ctx, width, height, spinning, resultInfo) {
  const x = 130
  const y = 410
  const w = width - 260
  const h = 130

  ctx.fillStyle = 'rgba(22,0,35,0.70)'
  roundRect(ctx, x, y, w, h, 24, true)

  ctx.strokeStyle = spinning ? 'rgba(255,222,115,0.55)' : getTierBorderColor(resultInfo)
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, 24, false, true)

  ctx.textAlign = 'center'

  if (spinning) {
    ctx.font = 'bold 32px Sans'
    ctx.fillStyle = '#ffe070'
    ctx.fillText('LA SLOT STA GIRANDO...', width / 2, y + 44)

    ctx.font = 'bold 19px Sans'
    ctx.fillStyle = '#f1d9ff'
    ctx.fillText('ATTENDI IL RISULTATO', width / 2, y + 75)

    return
  }

  ctx.font = 'bold 38px Sans'
  ctx.fillStyle = getTierMainColor(resultInfo)
  ctx.shadowColor = getTierShadowColor(resultInfo)
  ctx.shadowBlur = 12
  ctx.fillText(cleanResultText(resultInfo?.esitoText) || 'RISULTATO', width / 2, y + 39)
  ctx.shadowBlur = 0

  ctx.font = 'bold 24px Sans'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${cleanResultText(resultInfo?.denaroText)}   ${cleanResultText(resultInfo?.expText)} EXP`, width / 2, y + 68)

  ctx.font = 'bold 16px Sans'
  ctx.fillStyle = '#ffe28a'
  ctx.fillText('SALDO ATTUALE', width / 2, y + 90)

  ctx.font = 'bold 15px Sans'
  ctx.fillStyle = '#f2f2f2'
  ctx.fillText(`DENARO: ${resultInfo?.saldoEuro || '0'}€     EXP: ${resultInfo?.saldoExp || '0'}`, width / 2, y + 108)
}

function getTierMainColor(resultInfo) {
  const type = cleanResultText(resultInfo?.esitoText).toUpperCase()

  if (type === 'JACKPOT') return '#ffd84d'
  if (type === 'BIG WIN') return '#ff8a2a'
  if (type === 'VITTORIA') return '#00ffa0'
  return '#ff526f'
}

function getTierShadowColor(resultInfo) {
  const type = cleanResultText(resultInfo?.esitoText).toUpperCase()

  if (type === 'JACKPOT') return 'rgba(255,216,77,0.75)'
  if (type === 'BIG WIN') return 'rgba(255,138,42,0.65)'
  if (type === 'VITTORIA') return 'rgba(0,255,160,0.55)'
  return 'rgba(255,82,111,0.42)'
}

function getTierBorderColor(resultInfo) {
  const type = cleanResultText(resultInfo?.esitoText).toUpperCase()

  if (type === 'JACKPOT') return 'rgba(255,216,77,0.95)'
  if (type === 'BIG WIN') return 'rgba(255,138,42,0.9)'
  if (type === 'VITTORIA') return 'rgba(0,255,160,0.88)'
  return 'rgba(255,82,111,0.78)'
}

function drawSymbol(ctx, symbol, x, y, size, glow = false) {
  ctx.save()
  ctx.translate(x, y)

  if (glow) {
    ctx.shadowColor = 'rgba(255,235,120,0.95)'
    ctx.shadowBlur = 16
  }

  if (symbol === '💎') drawDiamond(ctx, size)
  else if (symbol === '👑') drawCrown(ctx, size)
  else if (symbol === '🔮') drawOrb(ctx, size)
  else if (symbol === '🧿') drawEye(ctx, size)
  else if (symbol === '🔱') drawTrident(ctx, size)
  else if (symbol === '💠') drawCrystal(ctx, size)
  else if (symbol === '⭐') drawStar(ctx, 0, 0, size * 0.42, size * 0.18, 5)
  else drawFleur(ctx, size)

  ctx.restore()
}

function drawDiamond(ctx, s) {
  const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2)
  g.addColorStop(0, '#e4ffff')
  g.addColorStop(0.42, '#4bd3ff')
  g.addColorStop(1, '#7e38ff')

  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(0, -s / 2)
  ctx.lineTo(s / 2, -s * 0.08)
  ctx.lineTo(0, s / 2)
  ctx.lineTo(-s / 2, -s * 0.08)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#f4ffff'
  ctx.lineWidth = 2.5
  ctx.stroke()
}

function drawCrown(ctx, s) {
  const g = ctx.createLinearGradient(0, -s / 2, 0, s / 2)
  g.addColorStop(0, '#fff8b8')
  g.addColorStop(0.5, '#ffc62a')
  g.addColorStop(1, '#aa6200')

  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(-s * 0.5, s * 0.25)
  ctx.lineTo(-s * 0.42, -s * 0.24)
  ctx.lineTo(-s * 0.18, s * 0.02)
  ctx.lineTo(0, -s * 0.42)
  ctx.lineTo(s * 0.18, s * 0.02)
  ctx.lineTo(s * 0.42, -s * 0.24)
  ctx.lineTo(s * 0.5, s * 0.25)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#fff3a4'
  ctx.lineWidth = 2.5
  ctx.stroke()
}

function drawOrb(ctx, s) {
  const g = ctx.createRadialGradient(-s * 0.15, -s * 0.18, 4, 0, 0, s * 0.5)
  g.addColorStop(0, '#f0d1ff')
  g.addColorStop(0.45, '#a24eff')
  g.addColorStop(1, '#35105e')

  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, -s * 0.08, s * 0.38, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#8d5636'
  roundRect(ctx, -s * 0.25, s * 0.25, s * 0.5, s * 0.14, s * 0.05, true)
}

function drawEye(ctx, s) {
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#2e90ff'
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.30, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#071a55'
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(s * 0.08, -s * 0.08, s * 0.055, 0, Math.PI * 2)
  ctx.fill()
}

function drawTrident(ctx, s) {
  ctx.strokeStyle = '#ffd75a'
  ctx.lineWidth = s * 0.09
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(0, s * 0.42)
  ctx.lineTo(0, -s * 0.42)
  ctx.moveTo(-s * 0.32, -s * 0.22)
  ctx.quadraticCurveTo(-s * 0.23, -s * 0.47, 0, -s * 0.25)
  ctx.moveTo(s * 0.32, -s * 0.22)
  ctx.quadraticCurveTo(s * 0.23, -s * 0.47, 0, -s * 0.25)
  ctx.moveTo(-s * 0.36, -s * 0.12)
  ctx.lineTo(s * 0.36, -s * 0.12)
  ctx.stroke()
}

function drawCrystal(ctx, s) {
  const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2)
  g.addColorStop(0, '#e4ffff')
  g.addColorStop(0.5, '#54d8ff')
  g.addColorStop(1, '#2b7fff')

  ctx.fillStyle = g

  for (let i = 0; i < 4; i++) {
    ctx.save()
    ctx.rotate((Math.PI / 2) * i)
    ctx.beginPath()
    ctx.moveTo(0, -s * 0.48)
    ctx.lineTo(s * 0.2, -s * 0.12)
    ctx.lineTo(0, s * 0.05)
    ctx.lineTo(-s * 0.2, -s * 0.12)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}

function drawFleur(ctx, s) {
  ctx.fillStyle = '#ffd257'
  ctx.strokeStyle = '#fff1a8'
  ctx.lineWidth = 2.5

  ctx.beginPath()
  ctx.moveTo(0, -s * 0.48)
  ctx.quadraticCurveTo(s * 0.25, -s * 0.18, 0, s * 0.08)
  ctx.quadraticCurveTo(-s * 0.25, -s * 0.18, 0, -s * 0.48)
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(-s * 0.25, -s * 0.02, s * 0.18, 0, Math.PI * 2)
  ctx.arc(s * 0.25, -s * 0.02, s * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillRect(-s * 0.05, 0, s * 0.1, s * 0.42)
}

function drawStar(ctx, cx, cy, outer, inner, points) {
  let rot = (Math.PI / 2) * 3
  let step = Math.PI / points

  ctx.beginPath()
  ctx.moveTo(cx, cy - outer)

  for (let i = 0; i < points; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner)
    rot += step
  }

  ctx.lineTo(cx, cy - outer)
  ctx.closePath()

  const g = ctx.createLinearGradient(0, -outer, 0, outer)
  g.addColorStop(0, '#fff18a')
  g.addColorStop(0.5, '#ffbd26')
  g.addColorStop(1, '#ff7a00')

  ctx.fillStyle = g
  ctx.fill()
  ctx.strokeStyle = '#fff5b8'
  ctx.lineWidth = 2.5
  ctx.stroke()
}

function getWinningCellsFromLine(line) {
  const cells = new Set()
  for (const [row, col] of line) {
    cells.add(`${row}-${col}`)
  }
  return cells
}

function cleanResultText(text) {
  return String(text || '').replace(/[🥳🤡]/g, '').trim()
}

function generateRandomGrid() {
  return [
    [pick(symbols), pick(symbols), pick(symbols)],
    [pick(symbols), pick(symbols), pick(symbols)],
    [pick(symbols), pick(symbols), pick(symbols)]
  ]
}

function roundRect(ctx, x, y, width, height, radius, fill = false, stroke = false) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()

  if (fill) ctx.fill()
  if (stroke) ctx.stroke()
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
