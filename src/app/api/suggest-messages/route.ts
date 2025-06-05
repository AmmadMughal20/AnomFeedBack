// Force Node.js runtime for streaming compatibility
export const runtime = 'nodejs';

import { OpenAI } from 'openai';

const openai = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY!,
});

export async function POST()
{
    const prompt = `
Create exactly 3 open-ended and engaging questions, numbered 1, 2, and 3, each on a new line.

Respond with ONLY the questions in this exact format:
1. Question one?
2. Question two?
3. Question three?

Do NOT include any introductory text, explanation, or any extra content before or after the questions.

Make sure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversation.
Avoid personal and sensitive topics.
`;

    try
    {
        const completion = await openai.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
        });

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller)
            {
                try
                {
                    for await (const chunk of completion)
                    {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content)
                        {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                    controller.close();
                } catch (error)
                {
                    console.error('Streaming error:', error);
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (err)
    {
        console.error('Stream error:', err);
        return new Response('Failed to generate questions', { status: 500 });
    }
}
