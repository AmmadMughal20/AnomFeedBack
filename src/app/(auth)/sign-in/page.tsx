'use client'
import { Button } from "@/components/ui/button"
import
{
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signInSchema } from "@/schemas/signInSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"


const Page = () =>
{
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    //zod implementation
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof signInSchema>) =>
    {
        setIsSubmitting(true);
        const result = await signIn("credentials", {
            identifier: data.identifier,
            password: data.password,
            redirect: false,
        })

        if (result?.error)
        {
            if (result.error === "CredentialsSignin")
            {
                toast.error("Invalid email or password");
            } else
            {
                toast.error(result.error);
            }
            setIsSubmitting(false);
        }
        if (result?.url)
        {
            router.replace('/dashboard')
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-center">Join Mystery Message</h1>
                    <p className="mb-4">Sign in to your anonumous adventure account</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            name="identifier"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email/Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email/username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type='password' placeholder="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>{
                            isSubmitting ?
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                                </>
                                : "Signin"}</Button>
                    </form>
                </Form>
                <div className="text-sm text-gray-500 mt-4">
                    New to Mystry Message?
                    <Link href="/sign-up" className="text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Page