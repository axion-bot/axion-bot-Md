// fun-quotesticker by Bonzino

import { createCanvas } from 'canvas'
import { sticker } from '../lib/sticker.js'

const BLUE='#53bdeb'
const WHITE='#ffffff'
const GREY='rgba(255,255,255,.65)'
const GREEN='#0b4b37'

function roundRect(ctx,x,y,w,h,r){
ctx.beginPath()
ctx.moveTo(x+r,y)
ctx.lineTo(x+w-r,y)
ctx.quadraticCurveTo(x+w,y,x+w,y+r)
ctx.lineTo(x+w,y+h-r)
ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
ctx.lineTo(x+r,y+h)
ctx.quadraticCurveTo(x,y+h,x,y+h-r)
ctx.lineTo(x,y+r)
ctx.quadraticCurveTo(x,y,x+r,y)
ctx.closePath()
}

const isPhoneText=t=>/^\+\d[\d\s]{5,}:?$/.test(String(t||'').trim())

function splitTokens(text){
const regex=/(\[\d{1,2}\/\d{1,2},\s*\d{1,2}:\d{2}\]\s*)([^:]+:)?/g
let out=[],last=0,m
while((m=regex.exec(text))){
if(m.index>last)out.push({type:'msg',text:text.slice(last,m.index)})
out.push({type:'date',text:m[1]})
if(m[2])out.push({type:isPhoneText(m[2])?'phone':'name',text:m[2]})
last=regex.lastIndex
}
if(last<text.length)out.push({type:'msg',text:text.slice(last)})
return out
}

function layoutTokens(ctx,tokens,maxWidth){
const lines=[]
let line=[],w=0

for(const token of tokens){

if(token.type==='phone'){
const pw=ctx.measureText(token.text).width
if(w+pw>maxWidth&&line.length){lines.push(line);line=[];w=0}
line.push(token)
w+=pw
continue
}

const parts=String(token.text||'').split(/(\s+)/)

for(const part of parts){
if(!part)continue

if(part.includes('\n')){
const subs=part.split('\n')
for(let i=0;i<subs.length;i++){
if(subs[i]){
const pw=ctx.measureText(subs[i]).width
if(w+pw>maxWidth&&line.length){lines.push(line);line=[];w=0}
line.push({...token,text:subs[i]})
w+=pw
}
if(i<subs.length-1){lines.push(line);line=[];w=0}
}
continue
}

const pw=ctx.measureText(part).width
if(w+pw>maxWidth&&line.length){lines.push(line);line=[];w=0}
line.push({...token,text:part})
w+=pw
}
}

if(line.length)lines.push(line)
return lines
}

function drawRichLines(ctx,lines,x,y,lineH){
for(const line of lines){
let cx=x
for(const t of line){
const isPhone=t.type==='phone'
ctx.fillStyle=isPhone?BLUE:WHITE
ctx.fillText(t.text,cx,y)

if(isPhone){
const tw=ctx.measureText(t.text).width
ctx.strokeStyle=BLUE
ctx.lineWidth=1.5
ctx.beginPath()
ctx.moveTo(cx,y+48)
ctx.lineTo(cx+tw,y+48)
ctx.stroke()
}

cx+=ctx.measureText(t.text).width
}
y+=lineH
}
return y
}

function drawTick(ctx,x,y){
ctx.beginPath()
ctx.moveTo(x,y)
ctx.lineTo(x+11,y+11)
ctx.lineTo(x+31,y-18)
ctx.stroke()
}

async function createQuoteSticker(text){
const width=900,pad=34,lineH=58
const temp=createCanvas(width,2000)
const ctx=temp.getContext('2d')
ctx.font='48px Arial'

const lines=layoutTokens(ctx,splitTokens(text),width-pad*2-40)
const bubbleH=Math.max(170,lines.length*lineH+115)
const height=bubbleH+40
const canvas=createCanvas(width,height)
const c=canvas.getContext('2d')

c.clearRect(0,0,width,height)
c.fillStyle=GREEN
roundRect(c,10,20,width-20,bubbleH,36)
c.fill()

c.fillStyle=GREEN
c.beginPath()
c.moveTo(width-55,20)
c.lineTo(width-10,20)
c.lineTo(width-10,65)
c.closePath()
c.fill()

c.font='48px Arial'
c.textBaseline='top'
drawRichLines(c,lines,pad,50,lineH)

c.font='42px Arial'
c.fillStyle=GREY
c.textAlign='right'
c.fillText(new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}),width-115,bubbleH-52)

c.strokeStyle=GREY
c.lineWidth=7
drawTick(c,width-86,bubbleH-34)
drawTick(c,width-64,bubbleH-34)

return canvas.toBuffer('image/png')
}

let handler=async(m,{conn,usedPrefix,command})=>{
const q=m.quoted
const text=q?.text||q?.caption||q?.message?.conversation||q?.message?.extendedTextMessage?.text

if(!q||!text){
await m.react('❌').catch(()=>{})
return m.reply(`*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐭𝐞𝐬𝐭𝐨.*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:* ${usedPrefix+command}`)
}

try{
await m.react('⏳').catch(()=>{})

const png=await createQuoteSticker(text)
const nome=conn.getName(m.sender)
const stiker=await sticker(png,false,nome,'𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓')

await conn.sendFile(m.chat,stiker,'quote.webp','',m,false,{asSticker:true})

await m.react('✅').catch(()=>{})
}catch(e){
console.error('quotesticker error:',e)
await m.react('❌').catch(()=>{})
return m.reply('*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐜𝐫𝐞𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*')
}
}

handler.help=['qs']
handler.tags=['fun']
handler.command=/^(sm|ms)$/i
handler.group=true

export default handler