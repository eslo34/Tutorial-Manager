import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateScript } from '@/lib/gemini'

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

    // Create specialized prompt for detecting script updates
    const updateCheckPrompt = `You are an expert script analyzer for video tutorials. Your job is to compare an existing video script against updated documentation to identify outdated sections.

TASK: Analyze the current script against the fresh documentation and identify any sections that are outdated, incorrect, or missing important updates.

For each outdated section you find, provide:
1. The exact text from the current script that is outdated
2. Why it's outdated (what changed in the documentation)
3. A suggested replacement based on the fresh documentation
4. The severity level (critical, moderate, minor)

Return your analysis in this exact JSON format:
{
  "overall_status": "current" | "outdated" | "major_changes",
  "summary": "Brief summary of findings",
  "outdated_sections": [
    {
      "original_text": "exact text from script that needs updating",
      "reason": "explanation of what changed",
      "suggested_replacement": "new text based on fresh documentation",
      "severity": "critical" | "moderate" | "minor",
      "line_start": estimated line number where this text appears,
      "section_type": "narrator" | "instructions" | "both"
    }
  ]
}

If the script is completely up to date, return:
{
  "overall_status": "current",
  "summary": "Script is up to date with current documentation",
  "outdated_sections": []
}

CURRENT SCRIPT:
${currentScript}

FRESH DOCUMENTATION:
${freshDocumentation}

Respond ONLY with the JSON object, no additional text.`

    // Use the Gemini API directly to analyze the script
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent(updateCheckPrompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      console.error('❌ Failed to analyze script: No response from Gemini')
      return NextResponse.json({
        success: false,
        error: 'No response from Gemini AI'
      }, { status: 500 })
    }

    // Parse the AI response
    let analysisResult
    try {
      // Clean the response to extract JSON
      const cleanedResponse = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      analysisResult = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      console.log('Raw AI response:', text)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse analysis results'
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