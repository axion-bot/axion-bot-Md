let handler=async()=>{}
handler.before=async function(m,{conn}){
if(!m.text||m.fromMe||m.isBaileys)return
const txt=m.text.trim().toLowerCase()
if(!txt.includes('aura'))return
await conn.sendFile(
m.chat,
'./media/aura.webp',
'aura.webp',
'',
m,
false,
{
asSticker:true,
quoted:m
}
)
return true
}
export default handler