import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateWithFallback, SONNET, HAIKU } from '@/lib/anthropic'

export const maxDuration = 60

const AUDIT_SYSTEM_PROMPT = `You are an expert video script auditor. Analyze a video script against documentation for completeness and accuracy.

CRITICAL ANALYSIS REQUIREMENTS:
1. COMPLETENESS CHECK: Does the script cover ALL essential steps from the documentation?
2. ACCURACY CHECK: Do button names, field names, menu items, and UI elements match exactly?
3. SEQUENCE CHECK: Are the steps in the correct order as shown in documentation?
4. DETAIL CHECK: Are important details, warnings, or tips from documentation included?

WHAT COUNTS AS OUTDATED/INCOMPLETE:
- Missing crucial steps that are documented
- Wrong button names, field names, or UI element names
- Incorrect navigation paths or menu locations
- Missing important context, warnings, or prerequisites
- Steps in wrong sequence
- Incomplete procedures (stopping before completion)

🚨 CRITICAL: For "original_text", you MUST copy the EXACT text from the script word-for-word, including exact punctuation, spacing, and line breaks. Copy complete sentences or paragraphs, not summaries. DO NOT paraphrase, summarize, or rewrite.

Return ONLY valid JSON with this exact format (no markdown fences, no commentary):
{
  "overall_status": "current" | "incomplete" | "outdated",
  "summary": "Detailed findings explanation",
  "outdated_sections": [
    {
      "original_text": "COPY EXACT TEXT FROM SCRIPT - word for word with exact punctuation and spacing",
      "reason": "specific explanation of what's wrong/missing",
      "suggested_replacement": "corrected text based on documentation",
      "severity": "critical" | "moderate" | "minor",
      "category": "missing_step" | "wrong_ui_element" | "incorrect_sequence" | "missing_detail"
    }
  ]
}`

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, currentScript, freshDocumentation } = await request.json()

    if (!projectId || !currentScript || !freshDocumentation) {
      return NextResponse.json({
        error: 'Missing required fields: projectId, currentScript, freshDocumentation'
      }, { status: 400 })
    }

    console.log('🔍 Analyzing script for updates...')

    // Truncate very large inputs so the request stays well within the 60s budget.
    const totalLength = currentScript.length + freshDocumentation.length
    const script = totalLength > 50000
      ? currentScript.substring(0, 25000) + '\n... [TRUNCATED] ...'
      : currentScript
    const documentation = totalLength > 50000
      ? freshDocumentation.substring(0, 15000) + '\n... [TRUNCATED] ...'
      : freshDocumentation

    let responseText: string
    try {
      const result = await generateWithFallback({
        system: AUDIT_SYSTEM_PROMPT,
        content: [
          {
            type: 'text',
            text: `DOCUMENTATION:\n${documentation}`,
            cache_control: { type: 'ephemeral' },
          },
          {
            type: 'text',
            text: `SCRIPT:\n${script}`,
          },
        ],
        maxTokens: 4096,
        models: [SONNET, HAIKU],
      })
      responseText = result.text
    } catch (aiError) {
      return NextResponse.json({
        success: false,
        error: `AI API error: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`
      }, { status: 500 })
    }

    console.log('📝 AI response length:', responseText.length)

    // Strip any markdown fences before parsing
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let analysisResult
    try {
      analysisResult = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      console.log('📝 Raw AI response:', responseText.substring(0, 1000))
      return NextResponse.json({
        success: false,
        error: 'Failed to parse analysis results. Check server logs for details.'
      }, { status: 500 })
    }

    console.log('✅ Script analysis completed')
    console.log('📊 Overall status:', analysisResult.overall_status)
    console.log('🔍 Found', analysisResult.outdated_sections?.length || 0, 'outdated sections')

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      checked_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Script update check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
