import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document
{
    content: string;
    createdAt: Date
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: [true, 'Enter your message!']
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})


export interface User extends Document
{
    username: string,
    email: string,
    password: string,
    varificationCode: string,
    varificationCodeExpiry: Date,
    isVerified: boolean,
    isAcceptingMessage: boolean,
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter valid email']
    },
    password: {
        type: String,
        required: true,
    },
    varificationCode: {
        type: String,
        required: true,
    },
    varificationCodeExpiry: {
        type: Date,
        required: [true, 'Verification code exipry is required!'],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true
    },
    messages: [MessageSchema]
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || (mongoose.model<User>("User", UserSchema))

export default UserModel;