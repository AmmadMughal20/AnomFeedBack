'use client'

import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"
import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Message } from "@/model/User"; // or wherever it's defined

const Dashboard = () =>
{
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSwithcLoading, setIsSwitchLoading] = useState(false)
    const [baseUrl, setBaseUrl] = useState('');

    const handleDeleteMessage = (messageId: string) =>
    {
        setMessages(messages.filter((message: Message) => message._id !== messageId))
    }

    const { data: session } = useSession()

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema)
    })

    const { register, watch, setValue } = form

    const acceptMessages = watch("isAcceptingMessage");

    const fetchAcceptMessage = useCallback(async () =>
    {
        setIsSwitchLoading(true)
        try
        {
            const response = await axios.get('/api/accept-messages')
            setValue("isAcceptingMessage", response.data.isAcceptingMessage)
        } catch (error)
        {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || "Failed to fetch accept messages")
        } finally
        {
            setIsSwitchLoading(false)
        }
    }, [setValue])

    const fetchMessages = useCallback(async (refresh: boolean = false) =>
    {
        setIsLoading(true)
        setIsSwitchLoading(false)
        try
        {
            const response = await axios.get<ApiResponse>('/api/get-messages')
            setMessages(response.data.messages || [])

            if (refresh)
            {
                toast.success("Messages refreshed successfully")
            } else
            {
                toast.error(response.data.message || "Failed to fetch messages")
            }
        } catch (error)
        {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || "Failed to fetch messages")
        }
        finally
        {
            setIsSwitchLoading(false)
            setIsLoading(false)
        }
    }, [setIsLoading, setMessages])

    useEffect(() =>
    {
        if (!session || !session?.user)
        {
            return
        } else
        {
            fetchMessages()
            fetchAcceptMessage()
        }
    }, [session, setValue, fetchAcceptMessage, fetchMessages])

    const handleSwitchChange = async () =>
    {
        try
        {
            const response = await axios.post<ApiResponse>('/api/accept-messages', {
                acceptMessages: !acceptMessages
            })
            setValue("isAcceptingMessage", !acceptMessages)
            toast.success(response.data.message || "Accept messages updated successfully")
        } catch (error)
        {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || "Failed to update accept messages")
        }
    }

    const username = session?.user?.username as User
    const profileUrl = username ? `${baseUrl}/u/${username}` : ''

    useEffect(() =>
    {
        if (typeof window !== 'undefined')
        {
            setBaseUrl(`${window.location.protocol}//${window.location.host}`);
        }
    }, []);

    const handleCopyProfileUrl = () =>
    {
        navigator.clipboard.writeText(profileUrl)
        toast.success("Profile URL copied to clipboard")
    }

    if (!session || !session?.user)
    {
        return <div>Please login</div>
    }

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
                <div className="flex items-center">
                    {username && (
                        <input
                            type="text"
                            value={profileUrl}
                            disabled
                            className="input input-rounded w-full p-2 mr-2"
                        />
                    )}
                    <Button
                        onClick={handleCopyProfileUrl}
                    >
                        Copy
                    </Button>
                </div>
            </div>
            <div className="mb-4">
                <Switch {...register("isAcceptingMessage")}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwithcLoading}
                />
                <span className="ml-2">
                    {acceptMessages ? "On" : "Off"}
                </span>

            </div>
            <Separator />
            <Button className="mt-4"
                variant={"outline"}
                onClick={(e) =>
                {
                    e.preventDefault();
                    fetchMessages(true);

                }}
            >
                {isLoading ? <Loader2 className="h4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            </Button>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    messages.length > 0 ? messages.map((message) => (
                        <MessageCard
                            key={message._id as string}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    )) : (
                        <p>No messages found</p>
                    )
                }
            </div>
        </div>

    )
}

export default Dashboard