import dbConnect from "@/lib/dbContext";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationemail";

export async function POST(request: Request)
{
    await dbConnect();
    try
    {
        const { username, email, password } = await request.json();
        if (!username || !email || !password)
        {
            return Response.json({
                success: false,
                message: "All fields are required",
            }, { status: 400 });
        }
        const existingYserVerifiedByUsername = await UserModel.findOne({ username, isVerified: true })
        if (existingYserVerifiedByUsername)
        {
            return Response.json({
                success: false,
                message: "Username already exists",
            }, { status: 409 });
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({ email })
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit code

        if (existingUserVerifiedByEmail)
        {
            if (existingUserVerifiedByEmail.isVerified)
            {
                return Response.json({
                    success: false,
                    message: "Email already exists",
                }, { status: 409 });
            } else
            {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserVerifiedByEmail.password = hashedPassword; // Update password if user exists but is not verified
                // Update the existing user with new verification code and expiry
                existingUserVerifiedByEmail.varificationCode = verificationCode;
                existingUserVerifiedByEmail.varificationCodeExpiry = new Date(Date.now() + 3600000); // 1 hour from now
                await existingUserVerifiedByEmail.save();
            }
        } else
        {
            const hashedPassword = await bcrypt.hash(password, 10)
            const exipryDate = new Date();
            exipryDate.setHours(exipryDate.getHours() + 1); // Set expiry to 1 hour from now

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                varificationCode: verificationCode, // Generate a random 6-digit code
                varificationCodeExpiry: exipryDate,
                isVerified: false,
            })

            await newUser.save();
        }
        const verificationResponse = await sendVerificationEmail(email, username, verificationCode);
        if (!verificationResponse.success)
        {
            return Response.json({
                success: false,
                message: verificationResponse.message,
                error: verificationResponse.error,
            }, { status: 500 });
        } else
        {
            return Response.json({
                success: true,
                message: "User registered successfully. Please check your email for verification.",
            }, { status: 201 });
        }
    } catch (error)
    {
        console.error("Error registering user:", error);
        return Response.json({
            success: false,
            message: "Failed to register user",
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}