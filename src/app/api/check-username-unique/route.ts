import UserModel from "@/model/User";
import { z } from "zod";
import dbConnect from "@/lib/dbContext";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: Request)
{
    try
    {
        await dbConnect();
        const url = new URL(request.url);
        const username = url.searchParams.get("username");

        if (!username)
        {
            return new Response(JSON.stringify({ success: false, message: "Username is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const parsedData = UsernameQuerySchema.safeParse({ username });

        if (!parsedData.success)
        {
            const usernameError = parsedData.error.format().username?._errors || [];
            return Response.json({ success: false, message: usernameError?.length > 0 ? usernameError.join(', ') : 'Invalid query parameters' }, { status: 400 })
        }
        console.log(username, 'printing username');

        const existingVerifiedUser = await UserModel.findOne({ username: username });

        console.log(existingVerifiedUser, 'printing existingVerifiedUser');

        if (existingVerifiedUser)
        {
            return Response.json({
                success: false,
                message: "Username is already taken by a verified user",
            }, { status: 400 })
        }

        return Response.json({
            success: true,
            message: "Username is unique",
        }, { status: 200 })
    } catch (error)
    {
        console.error("Error checking username uniqueness:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}