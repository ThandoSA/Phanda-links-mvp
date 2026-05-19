
async function getSpec() {
  const resp = await fetch("https://ilnscaylznwtcsyztkbs.supabase.co/rest/v1/", {
    headers: { "apikey": "sb_publishable_HHIxcEUd5ZERKpg0PJ9LgQ_VuHT4sBB" }
  })
  const data = await resp.json()
  console.log('Error:', data.message)
  console.log('Hint:', data.hint)
}

getSpec()
