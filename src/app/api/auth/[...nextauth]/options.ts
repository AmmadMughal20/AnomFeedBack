import dbConnect from "@/lib/dbContext";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "Username or Email", type: "text", placeholder: "Enter your email" },
                password: { label: "Password", type: "password", placeholder: "Enter your password" },
            },
            async authorize(
                credentials: Record<"identifier" | "password", string> | undefined
            ): Promise<User | null>
            {
                {
                    if (!credentials)
                    {
                        throw new Error("Missing credentials");
                    }

                    const { identifier, password } = credentials;

                    await dbConnect();

                    try
                    {
                        const user = await UserModel.findOne({
                            $or: [
                                { email: identifier },
                                { username: identifier },
                            ],
                        });

                        if (!user)
                        {
                            throw new Error("User not found");
                        }

                        if (!user.isVerified)
                        {
                            throw new Error("Please verify your account first");
                        }

                        const isPasswordValid = await bcrypt.compare(password, user.password);

                        if (!isPasswordValid)
                        {
                            throw new Error("Invalid username or password");
                        }

                        return {
                            id: user._id.toString(),
                            email: user.email,
                            username: user.username,
                        };
                    } catch (error)
                    {
                        console.error("Error during authorization:", error);
                        throw new Error("Authorization failed");
                    }
                }
            }
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