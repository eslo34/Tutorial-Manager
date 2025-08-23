import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

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
    console.log('📏 Current script length:', currentScript.length)
    console.log('📏 Fresh documentation length:', freshDocumentation.length)
    console.log('📝 Script preview (first 300 chars):', currentScript.substring(0, 300) + '...')
    console.log('📄 Documentation preview (first 200 chars):', freshDocumentation.substring(0, 200) + '...')
    
    // Check if content is too long (approximate token limit check)
    const totalLength = currentScript.length + freshDocumentation.length
    console.log('📏 Total content length:', totalLength)
    
    if (totalLength > 50000) {
      console.warn('⚠️ Content might be too long, truncating...')
    }

    // Create comprehensive prompt for detecting script updates
    const updateCheckPrompt = `You are an expert video script auditor. Analyze this video script against the documentation for completeness and accuracy.

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

🚨 CRITICAL: For "original_text", you MUST copy the EXACT text from the script word-for-word, including:
- Exact punctuation (periods, quotes, parentheses)
- Exact spacing and line breaks
- Complete sentences or paragraphs, not summaries
- Numbers, step indicators, and formatting exactly as written

DO NOT paraphrase, summarize, or rewrite. Copy the exact text that appears in the script.

SCRIPT:
${totalLength > 50000 ? currentScript.substring(0, 25000) + '\n... [TRUNCATED] ...' : currentScript}

DOCUMENTATION:
${totalLength > 50000 ? freshDocumentation.substring(0, 15000) + '\n... [TRUNCATED] ...' : freshDocumentation}

Return JSON with this exact format:
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

    // Use OpenAI GPT-5 to analyze the script
    if (!process.env.GPT_API_KEY) {
      throw new Error('GPT_API_KEY not configured')
    }

    const openai = new OpenAI({
      apiKey: process.env.GPT_API_KEY,
    })

    console.log('📏 Final prompt length:', updateCheckPrompt.length)
    
    let completion
    try {
      // Note: Using GPT-4 instead of GPT-5 because GPT-5 returns empty {} responses 
      // for older script formats, while GPT-4 handles them perfectly
      completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: updateCheckPrompt
          }
        ],
        max_completion_tokens: 2048,
      });
    } catch (openaiError: any) {
      console.error('❌ OpenAI API error:', openaiError.message || openaiError)
      return NextResponse.json({
        success: false,
        error: `OpenAI API error: ${openaiError.message || 'Unknown error'}`
      }, { status: 500 })
    }

    const responseText = completion.choices[0]?.message?.content || '{}';

    console.log('📝 AI response length:', responseText.length)
    console.log('📝 AI response preview:', responseText.substring(0, 200) + '...')
    
    if (!responseText || responseText === '{}') {
      console.error('❌ Failed to analyze script: No response from AI')
      return NextResponse.json({
        success: false,
        error: 'No response from AI'
      }, { status: 500 })
    }

    // Parse the AI response
    let analysisResult
    // Clean the response to extract JSON
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    try {
      analysisResult = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      console.log('📝 Cleaned response:', cleanedResponse.substring(0, 500))
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