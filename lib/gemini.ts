export interface ScriptGenerationRequest {
  prompt: string;
  userRequest: string;
  documentationContent: string;
}

export interface ScriptGenerationResponse {
  success: boolean;
  script?: string;
  error?: string;
  metadata?: {
    promptLength: number;
    scriptLength: number;
    generatedAt: string;
  };
}

export async function generateScript(request: ScriptGenerationRequest): Promise<ScriptGenerationResponse> {
  try {
    const response = await fetch('/api/generate-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Script generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 