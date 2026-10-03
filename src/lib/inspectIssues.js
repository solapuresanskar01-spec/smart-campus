import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    }),
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY)
const { data, error } = await supabase.from('issues').select('*').limit(3)

console.log('error', error && { message: error.message, code: error.code, details: error.details, hint: error.hint })
console.log('count', data?.length ?? 0)
console.log('keys', data?.[0] ? Object.keys(data[0]) : [])

if (data?.[0]) {
  const sample = {}
  for (const [k, v] of Object.entries(data[0])) {
    sample[k] = { type: v === null ? 'null' : typeof v, value: v }
  }
  console.log('sample', JSON.stringify(sample, null, 2))
}

const { data: userData, error: userError } = await supabase.auth.getUser()
console.log('authUser', userData?.user ? { id: userData.user.id } : null)
console.log('authError', userError && userError.message)
