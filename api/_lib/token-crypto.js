import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { ConfigurationError } from './config.js'

const getKeyBuffer = (encodedKey) => {
  const key = Buffer.from(encodedKey, 'base64')
  if (key.length !== 32) {
    throw new ConfigurationError(
      'MELI_TOKEN_ENCRYPTION_KEY debe ser una clave base64 de 32 bytes.',
    )
  }
  return key
}

export const encryptToken = (plainText, encodedKey) => {
  if (!plainText) return null

  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKeyBuffer(encodedKey), iv)
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ])

  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString('base64url'))
    .join('.')
}

export const decryptToken = (encryptedValue, encodedKey) => {
  if (!encryptedValue) return null

  const [ivValue, authTagValue, cipherValue] = encryptedValue.split('.')
  if (!ivValue || !authTagValue || !cipherValue) {
    throw new Error('El token cifrado tiene un formato inválido.')
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getKeyBuffer(encodedKey),
    Buffer.from(ivValue, 'base64url'),
  )
  decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'))

  return Buffer.concat([
    decipher.update(Buffer.from(cipherValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}
