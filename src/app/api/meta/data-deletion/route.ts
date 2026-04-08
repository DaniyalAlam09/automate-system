import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '==='.slice((normalized.length + 3) % 4)
  return Buffer.from(padded, 'base64')
}

function verifySignedRequest(signedRequest: string, appSecret: string) {
  const [encodedSig, encodedPayload] = signedRequest.split('.')
  if (!encodedSig || !encodedPayload) return null

  const signature = base64UrlDecode(encodedSig)
  const payloadBuffer = base64UrlDecode(encodedPayload)
  const payloadText = payloadBuffer.toString('utf8')
  const payload = JSON.parse(payloadText)

  if (payload.algorithm?.toUpperCase() !== 'HMAC-SHA256') return null

  const expected = crypto
    .createHmac('sha256', appSecret)
    .update(encodedPayload)
    .digest()

  if (!crypto.timingSafeEqual(signature, expected)) return null

  return payload as { user_id?: string }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const signedRequest = formData.get('signed_request')?.toString()

    const appSecret = process.env.META_APP_SECRET
    if (!signedRequest || !appSecret) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const payload = verifySignedRequest(signedRequest, appSecret)
    if (!payload) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const confirmationCode = payload.user_id || crypto.randomUUID()
    const statusUrl = `${appUrl}/data-deletion?code=${encodeURIComponent(confirmationCode)}`

    // Meta expects { url, confirmation_code } for data deletion callbacks.
    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    })
  } catch (error) {
    console.error('Meta data deletion callback error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return NextResponse.redirect(`${appUrl}/data-deletion`)
}
