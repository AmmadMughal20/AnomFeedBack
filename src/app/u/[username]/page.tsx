'use client'
import { useState } from 'react'
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import z from "zod"
import
{
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { messageSchema } from '@/schemas/messageSchema'
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

const MessagePage = () =>
{
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);


    const { username } = useParams();

    const router = useRouter();
    //zod implementation
    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof messageSchema>) =>
    {
        setIsSubmitting(true);
        try
        {
            const response = await axios.post('/api/send-message', {
                username: username, // Replace with actual username logic
                content: data.content,
            });
            if (!response.data.success)
            {
                toast.error(response.data.message);
            } else
            {
                form.reset();
                toast.success("Message sent successfully!");
            }

        } catch (error)
        {
            const axiosError = error as { response?: { data?: { message?: string } } };
            if (axiosError.response && axiosError.response.data)
            {
                toast.error(axiosError.response.data.message || "Failed to send message");
            }
            else
            {
                toast.error("An unexpected error occurred while sending the message.");
            }

        } finally
        {
            setIsSubmitting(false);
        }
    }

    const getMessagesSuggestion = async () =>
    {
        setQuestions([]);
        setLoading(true);

        const response = await fetch('/api/suggest-messages', {
            method: 'POST',
        });

        if (!response.body)
        {
            setLoading(false);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = ''; // Buffer to hold incomplete line

        while (true)
        {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Split by newline to detect full questions
            const lines = buffer.split('\n');

            // Keep the last part in buffer (may be incomplete)
            buffer = lines.pop() || '';

            for (const line of lines)
            {
                const trimmed = line.trim();
                if (trimmed.match(/^\d\.\s/))
                {
                    setQuestions((prev) => [...prev, trimmed]);
                }
            }
        }

        // Final buffer flush if the last question came in without newline
        if (buffer.trim().match(/^\d\.\s/))
        {
            setQuestions((prev) => [...prev, buffer.trim()]);
        }

        setLoading(false);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Button
                variant="outline"
                className="mb-4"
                onClick={() => router.replace('/')}
            >
                Back
            </Button>
            <h1 className="text-2xl font-bold mb-4">Send a Message to {username}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message Content</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Type your message here..."
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin mr-2" />
                        ) : (
                            "Send Message"
                        )}
                    </Button>
                </form>
            </Form>
            <p className="mt-4 text-sm text-gray-500">
                Note: Ensure the user is accepting messages before sending.
            </p>
            <div className='mt-8 w-full max-w-md'>
                <h2 className="text-xl font-semibold mb-4">Message Suggestions</h2>
                <p className="text-sm text-gray-500 mb-2">
                    Click the button below to generate suggested messages for {username}.
                </p>
                {loading && <p className="text-sm text-gray-500">Generating suggestions...</p>}

                <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={getMessagesSuggestion}
                >
                    {
                        loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" />
                                Generating Suggestions
                            </>
                        ) : <span>Suggest Messages</span>
                    }

                </Button>
                {questions.length === 0 && !loading && (
                    <p className="text-sm text-gray-500 mt-3">No suggestions generated yet.</p>
                )}
                <ul className="mt-4 space-y-2">
                    {questions.map((q, index) => (
                        <li key={index} className="bg-gray-100 p-2 rounded shadow">
                            {q}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default MessagePage