import dbConnect from "@/lib/dbContext";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Enter your email" },
                password: { label: "Password", type: "password", placeholder: "Enter your password" },
            },
            async authorize(credentials: any, req): Promise<any>
            {
                await dbConnect();
                try
                {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }, // Allow username as email);
                        ]
                    });
                    if (!user)
                    {
                        throw new Error("User not found");
                    }

                    if (!user.isVerified)
                    {
                        throw new Error("Please verify your account first");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid)
                    {
                        throw new Error("Invalid username or password");
                    }

                    return user;
                }
                catch (error: any)
                {
                    throw new Error(error.message || "Authorization failed");
                }
            },
        }),
    ],
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user })
        {
            if (user)
            {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.username = user.username;
                token.isAcceptingMessages = user.isAcceptingMessage;
            }
            return token;
        },
        async session({ session, token })
        {
            if (token)
            {
                session.user._id = token._id as string;
                session.user.isVerified = token.isVerified as boolean;
                session.user.username = token.username as string;
                session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
            }
            return session;
        },
    },
}



