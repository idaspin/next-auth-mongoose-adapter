import AuthUser, { IAuthUser } from "../../../../utils/models/AuthUser";
import MongooseAdapter from "../../../../utils/MongooseAdapter";
import { NextAuthOptions, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";
import DiscordProvider from "next-auth/providers/discord";

const scopes = ["identify", "email", "guilds", "guilds.members.read"].join(" ");
const adapter = MongooseAdapter();

export const authOptions: NextAuthOptions = {
    adapter: adapter,
    session: { strategy: "jwt" },    
    providers: [
        DiscordProvider({
            clientId: `${process.env.DISCORD_ID}`,
            clientSecret: `${process.env.DISCORD_SECRET}`,
            authorization: { params: { scope: scopes } }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            let updateRequest: Partial<AdapterUser> & Pick<IAuthUser, "id"> = { id: user.id };
            if (account) {
                updateRequest = {
                    ...updateRequest,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    refresh_token: account.refresh_token,
                    id: account.providerAccountId
                };
            }
            if (profile) {
                updateRequest = {
                    ...updateRequest,
                    name: profile.username,
                    email: profile.email,
                    image: profile.avatar,
                    locale: profile.locale,
                    accent_color: profile.accent_color,
                    id: profile.id
                };
            }
            console.log("signIn:", updateRequest)
            if (Object.keys(updateRequest).length != 0) {
                adapter.updateUser!(updateRequest);
                return true
            }
            return false;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.user.id
                }
            };
        },
        async jwt({ token, user, account }) {
            const response: JWT = { ...token };
            if (account) {
                const data: Partial<User | AdapterUser> = {
                    refresh_token: account.refresh_token,
                    access_token: account.access_token,
                    expires_at: account.expires_at
                };
                AuthUser.updateOne({ id: account.providerAccountId }, data).exec();
                response.user = { ...response.user, ...data };
            }
            if (user) {
                response.user = {
                    ...response.user,
                    // email: user.email,
                    // image: user.image,
                    // name: user.name,
                    id: user.id
                };
            }
            return response;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
