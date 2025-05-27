import { Resend } from 'resend';

console.log('RESEND_API_KEY is:', process.env.RESEND_API_KEY); // Should print the actual key

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey)
{
    throw new Error('RESEND_API_KEY is missing from environment variables');
}

export const resend = new Resend(apiKey);