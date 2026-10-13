
import 'dotenv/config'

import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'
import auth from '../middleware/auth.js'

const router = Router()

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

router.post('/describe', auth, async (req, res) => {
  try {
    const { serviceName, businessName } = req.body

    if (
      typeof serviceName !== 'string' ||
      !serviceName.trim() ||
      typeof businessName !== 'string' ||
      !businessName.trim()
    ) {
      return res.status(400).json({
        message: 'Service name and business name are required',
      })
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `Write a friendly, professional two-sentence description for a salon service called "${serviceName.trim()}" offered by "${businessName.trim()}". Do not use emojis.`,
      config: {
        maxOutputTokens: 150,
      },
    })

    const description = response.text?.trim()

    if (!description) {
      return res.status(502).json({
        message: 'AI returned an empty description',
      })
    }

    res.json({ description })
  } catch (e) {
  console.error('Gemini error:', e)

  res.status(500).json({
    message: e.message || 'Failed to generate service description',
  })
}
})

export default router
