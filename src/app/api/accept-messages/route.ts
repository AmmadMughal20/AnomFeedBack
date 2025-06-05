import dbConnect from "@/lib/dbContext";
import UserModel from "@/model/User";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request)
{
    try
    {
        await dbConnect();
        const session = await getServerSession(authOptions);
        const user: User = session?.user as User;
        if (!session || !session.user)
        {
            return Response.json({
                success: false,
                message: "Unauthorized",
            }, { status: 401 });
        }
        const userId = user._id;
        const result = await request.json();
        console.log("Received data:", result);
        const acceptMessages = result.acceptMessages;

        if (typeof acceptMessages !== "boolean")
        {
            return Response.json({
                success: false,
                message: "Value of parameter acceptMessages must be boolean",
            }, { status: 400 });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        );
        if (!updatedUser)
        {
            return Response.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }


        return Response.json({
            success: true,
            message: "Messages acceptance flag updated successfully",
            updatedUser,
        }, { status: 200 });
    } catch (error)
    {
        console.error("Error in accept messages route:", error);
        return Response.json({
            success: false,
            message: "Internal server error",
        }, { status: 500 });
    }
}


export async function GET()
{
    try
    {
        await dbConnect();
        const session = await getServerSession(authOptions);
        const user: User = session?.user as User;
        if (!session || !session.user)
        {
            return Response.json({
                success: false,
                message: "Unauthorized",
            }, { status: 401 });
        }
        const userId = user._id;

        const foundUser = await UserModel.findById(userId).select("isAcceptingMessage");
        if (!foundUser)
        {
            return Response.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            isAcceptingMessage: foundUser.isAcceptingMessage,
        }, { status: 200 });
    } catch (error)
    {
        console.error("Error in accept messages route:", error);
        return Response.json({
            success: false,
            message: "Internal server error",
        }, { status: 500 });
    }
}