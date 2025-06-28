import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userRequest, documentationContent } = await request.json();
    
    if (!prompt || !userRequest || !documentationContent) {
      return NextResponse.json({ 
        error: 'Missing required fields: prompt, userRequest, or documentationContent' 
      }, { status: 400 });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format the complete prompt
    const fullPrompt = `${prompt}

User request: ${userRequest}

Documentation: ${documentationContent}`;

    console.log('Generating script with Gemini...');
    console.log('Prompt length:', fullPrompt.length);

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const generatedScript = response.text();

    console.log('Script generated successfully');

    return NextResponse.json({
      success: true,
      script: generatedScript,
      metadata: {
        promptLength: fullPrompt.length,
        scriptLength: generatedScript.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Script generation error:', error);
    
    let errorMessage = 'Failed to generate script';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
} 