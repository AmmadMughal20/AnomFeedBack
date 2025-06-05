import dbConnect from "@/lib/dbContext";
import UserModel from "@/model/User";

export async function POST(request: Request)
{
    try
    {
        await dbConnect();
        const { username, code } = await request.json();
        console.log("Verifying code for username:", username, "with code:", code);
        if (!username || !code)
        {
            return new Response(JSON.stringify({ success: false, message: "Username and verification code are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({ username: decodedUsername });
        if (!user)
        {
            return Response.json({ success: false, message: "User not found" }, {
                status: 404,
            });
        }

        const isCodeValid = user.varificationCode === code;
        const isCodeNotExpired = new Date(user.varificationCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired)
        {
            user.isVerified = true;
            await user.save();

            return Response.json({
                success: true,
                message: "User successfully verified",
            }, { status: 200 });
        } else if (!isCodeValid)
        {
            return Response.json({
                success: false,
                message: "Invalid verification code",
            }, { status: 400 });
        } else if (!isCodeNotExpired)
        {
            return Response.json({
                success: false,
                message: "Verification code has expired",
            }, { status: 400 });
        }
        return Response.json({
            success: false,
            message: "Verification failed",
        }, { status: 400 });

    } catch (error)
    {
        console.error("Error verifying code:", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            {
                status: 500,
            }
        );
    }
}