import { IAuthUser } from "../utils/models/AuthUser";
import { HydratedDocument, Model } from "mongoose";
import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

type SessionUser = {
    name: string,
    email: string,
    image: string,
    id: string
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        id: string,
        email: string
    }
}

declare module "next-auth" {
    export interface User extends DefaultUser, IAuthUser {}
    export interface AdapterUser extends User {}
    export interface Profile { id: string, username: string, avatar: string, accent_color: number, locale: string, email: string };
    
    export interface Session extends DefaultSession {
        user: SessionUser,
        expires: undefined
    }
    export interface Account extends Partial<TokenSet> {
        provider: string,
        type: string,
        providerAccountId: string,
        token_type: string,
        access_token: string,
        expires_at: number,
        refresh_token: string,
        scope: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user: {
            id: string
            ...
        }
    }
}  