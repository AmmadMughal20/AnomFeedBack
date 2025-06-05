import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbContext";
import UserModel from "@/model/User";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

interface SessionUser
{
    id: string;
    email: string;
    name?: string;
}

export async function DELETE(req: NextRequest)
{
    try
    {
        const pathname = req.nextUrl.pathname;
        const messageid = pathname.split("/").pop()?.trim();

        if (!messageid || !mongoose.Types.ObjectId.isValid(messageid))
        {
            return NextResponse.json(
                { success: false, message: "Valid Message ID is required" },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session || !session.user)
        {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = (session.user as SessionUser)?.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId))
        {
            return NextResponse.json(
                { success: false, message: "Invalid user ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        const result = await UserModel.updateOne(
            { _id: userId },
            { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageid) } } }
        );

        if (result.modifiedCount === 0)
        {
            return NextResponse.json(
                { success: false, message: "Message not found or already deleted" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Message deleted successfully" },
            { status: 200 }
        );
    } catch (error)
    {
        console.error("Error deleting message:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
