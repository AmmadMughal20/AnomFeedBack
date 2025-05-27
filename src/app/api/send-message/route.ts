import UserModel from "@/model/User";
import dbConnect from "@/lib/dbContext";
import { Message } from "@/model/User";

export async function POST(request: Request)
{
    try
    {
        await dbConnect();
        const { username, content } = await request.json();
        const user = await UserModel.findOne({ username });
        if (!user)
        {
            return Response.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }
        if (user.isAcceptingMessage === false)
        {
            return Response.json({
                success: false,
                message: "User is not accepting messages",
            }, { status: 403 });
        }
        if (!content || typeof content !== "string")
        {
            return Response.json({
                success: false,
                message: "Content is required and must be a string",
            }, { status: 400 });
        }
        const newMessage: Message = {
            content,
            createdAt: new Date(),
        } as Message;

        user.messages.push(newMessage);

        await user.save();

        return Response.json({
            success: true,
            message: "Message sent successfully",
            newMessage,
        }, { status: 200 });

    } catch (error)
    {
        console.error("Error in send message route:", error);
        return Response.json({
            success: false,
            message: "Internal server error",
        }, { status: 500 });
    }
}
