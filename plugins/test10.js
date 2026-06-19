let handler=async(m,{conn})=>{
console.log(conn.updateProfileName)
m.reply(typeof conn.updateProfileName)
}
handler.command=/^testnome$/i
export default handler