import UserModel from "@/model/User";
import dbConnect from "@/lib/dbContext";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET()
{
    try
    {
        await dbConnect();
        const session = await getServerSession(authOptions);
        const user: User = session?.user as User;
        console.log("Session user:", user);
        if (!session || !session.user)
        {
            return Response.json({
                success: false,
                message: "Unauthorized",
            }, { status: 401 });
        }
        const userId = new mongoose.Types.ObjectId(user._id);
        console.log("User ID:", userId);
        try
        {
            const user = await UserModel.aggregate([
                { $match: { _id: userId }, },
                { $unwind: "$messages" },
                { $sort: { "messages.createdAt": -1 } },
                { $group: { _id: "$id", messages: { $push: "$messages" } } },
            ]);

            console.log("User messages:", user);

            if (!user || user.length === 0)
            {
                return Response.json({
                    success: false,
                    message: "No messages found for this user",
                }, { status: 404 });
            }
            return Response.json({
                success: true,
                messages: user[0].messages,
            }, { status: 200 });
        } catch (error)
        {
            console.error("Error converting user ID:", error);
            return Response.json({
                success: false,
                message: "Invalid user ID format",
            }, { status: 400 });

        }

    } catch (error)
    {
        console.error("Error in get messages route:", error);
        return Response.json({
            success: false,
            message: "Internal server error",
        }, { status: 500 });
    }
}