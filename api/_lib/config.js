export class ConfigurationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConfigurationError'
    this.status = 503
  }
}

const readEnv = (name) => process.env[name]?.trim() || ''

const requireEnv = (name) => {
  const value = readEnv(name)
  if (!value) throw new ConfigurationError(`Falta configurar ${name}.`)
  return value
}

export const getSupabaseServerConfig = () => ({
  url: requireEnv('SUPABASE_URL'),
  secretKey: requireEnv('SUPABASE_SECRET_KEY'),
})

export const getMercadoLibreOAuthConfig = () => ({
  clientId: requireEnv('MELI_CLIENT_ID'),
  clientSecret: requireEnv('MELI_CLIENT_SECRET'),
  redirectUri: requireEnv('MELI_REDIRECT_URI'),
})

export const getTokenEncryptionKey = () =>
  requireEnv('MELI_TOKEN_ENCRYPTION_KEY')

export const getCronSecret = () => requireEnv('CRON_SECRET')

export const getAdminEmails = () => {
  const emails = requireEnv('AH_ADMIN_EMAILS')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!emails.length) {
    throw new ConfigurationError('AH_ADMIN_EMAILS no contiene cuentas válidas.')
  }

  return new Set(emails)
}

export const getConfigurationStatus = () => {
  const requiredNames = [
    'SUPABASE_URL',
    'SUPABASE_SECRET_KEY',
    'AH_ADMIN_EMAILS',
    'MELI_CLIENT_ID',
    'MELI_CLIENT_SECRET',
    'MELI_REDIRECT_URI',
    'MELI_TOKEN_ENCRYPTION_KEY',
    'CRON_SECRET',
  ]

  const missing = requiredNames.filter((name) => !readEnv(name))
  return { configured: missing.length === 0, missing }
}
