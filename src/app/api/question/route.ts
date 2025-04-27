import { NextResponse } from 'next/server';
import { DocumentStore } from '@/app/lib/documentStore';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    const documentContent = DocumentStore.getInstance().getContent();
    
    const enhancedQuestion = `
      You are an expert research analyst and academic advisor. Your task is to provide accurate, well-reasoned answers based on the given context.

      Document Context:
      ${documentContent}

      User Question:
      ${question}

      Response Guidelines:
      1. Primary Analysis:
         - First address the question directly from the document context
         - If the answer isn't in the context, clearly state this
         - Support answers with relevant quotes or references from the document

      2. Response Quality:
         - Use clear, professional language
         - Maintain appropriate technical depth
         - Structure the response logically
         - Keep answers concise but thorough

      3. Additional Considerations:
         - For general questions outside the document scope, provide expert knowledge
         - Correct any grammatical errors in the response
         - If relevant, suggest related topics from the document
         - Maintain academic professionalism

      Please provide your expert response:
    `;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDilNinnnPpvFAThbAQdSrtet_7PFEuff4",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: enhancedQuestion }]
          }]
        })
      }
    );

    const result = await response.json();
    const answer = result.candidates[0].content.parts[0].text;

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error processing question:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
} 