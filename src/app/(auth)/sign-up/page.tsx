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
import { signUpSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useDebounceCallback } from 'usehooks-ts'
import z from "zod"


const Page = () =>
{
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const debounced = useDebounceCallback(setUsername, 300);

    const router = useRouter();

    //zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    useEffect(() =>
    {
        const checkUsernameUnique = async () =>
        {
            if (username)
            {
                setIsCheckingUsername(true);
                setUsernameError("");
                try
                {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    setUsernameError(response.data.message || "");
                } catch (error)
                {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameError(axiosError.response?.data.message || "An error occurred while checking username");
                }
                finally
                {
                    setIsCheckingUsername(false);
                }
            } else
            {
                setUsernameError("");
            }
        }
        checkUsernameUnique()
    }, [username]);

    const onSubmit = async (data: z.infer<typeof signUpSchema>) =>
    {
        setIsSubmitting(true);
        try
        {
            const response = await axios.post<ApiResponse>("/api/sign-up", data);
            toast.message("Success!", {
                description: response.data.message || "Sign up successful. Please check your email to verify your account.",
            });
            console.log(username, 'username');
            router.replace(`/verify/${username}`);
        }
        catch (error)
        {
            const axiosError = error as AxiosError<ApiResponse>;
            if (axiosError.response)
            {
                const errorMessage = axiosError.response?.data.message || "An error occurred during sign up";
                toast.error("Signup failed", {
                    description: errorMessage || "Sign up successful. Please check your email to verify your account.",
                });
            }
            else
            {
                console.error("Sign up error:", error);
                toast.error("An unexpected error occurred during sign up");
            }
        }
        finally
        {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-center">Join Mystery Message</h1>
                    <p className="mb-4">Sign up to start your anonumous adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="username" {...field}
                                            onChange={(e) =>
                                            {
                                                field.onChange(e);
                                                debounced(e.target.value);
                                            }} />
                                    </FormControl>
                                    {isCheckingUsername && (
                                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    )}
                                    <p className={`text-sm ${usernameError === "Username is unique" ? 'text-green-500' : 'text-red-500'}`}>
                                        {usernameError}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email" {...field} />
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
                                : "Signup"}</Button>
                    </form>
                </Form>
                <div className="text-sm text-gray-500 mt-4">
                    Already have an account?
                    <Link href="/sign-in" className="text-blue-500 hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Page