import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt, media_type, tone, niche } = await request.json()

  if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

  try {
    const systemPrompt = `You are an expert Instagram content creator and copywriter.
You write captions that are engaging, authentic, and optimized for Instagram.
Always respond with valid JSON only — no markdown, no explanation outside the JSON.`

    const userMessage = `Generate an Instagram caption for the following:
Post type: ${media_type || 'IMAGE'}
Niche/Topic: ${niche || 'general'}
Tone: ${tone || 'engaging and authentic'}
Description: ${prompt}

Respond with this exact JSON structure:
{
  "caption": "The main caption text (2-4 sentences, conversational, ends with a call to action)",
  "hashtags": ["hashtag1", "hashtag2", ...] (10-15 relevant hashtags, without #),
  "alternatives": ["alternative caption 1", "alternative caption 2"] (2 shorter alternatives)
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('AI caption error:', err)
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    )
  }
}
