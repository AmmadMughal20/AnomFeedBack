'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { verifySchema } from '@/schemas/verifySchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

const VerifyAccount = () =>
{
    const router = useRouter()
    const params = useParams<{ username: string }>()
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            verificationCode: ''
        }
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) =>
    {
        alert("Submitting verification code...")
        try
        {
            const response = await axios.post(`/api/verify-code`, {
                username: params.username,
                code: data.verificationCode
            })

            toast.success(response.data.message || "Account verified successfully")
            router.replace("/sign-in")
        } catch (error)
        {
            const axiosError = error as AxiosError<ApiResponse>

            if (axiosError.response)
            {
                toast.error(axiosError.response.data.message || "An error occurred while verifying the account")
            } else
            {
                toast.error("An unexpected error occurred")
            }
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <div className='text-center mb-6'>
                    <h2 className="text-2xl font-bold text-center mb-4">Verify Your Account</h2>
                    <p className="text-center mb-6">Enter the verification code sent to your email</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="verificationCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default VerifyAccount