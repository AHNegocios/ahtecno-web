import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const toBase64Url = (value) => Buffer.from(value).toString('base64url')

export const createOAuthState = () => randomBytes(32).toString('base64url')

export const createPkcePair = () => {
  const verifier = randomBytes(64).toString('base64url')
  const challenge = toBase64Url(createHash('sha256').update(verifier).digest())
  return { verifier, challenge }
}

export const safeEqual = (left, right) => {
  if (!left || !right) return false
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}
