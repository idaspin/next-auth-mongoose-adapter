import mongoose, {Mongoose, Model} from "mongoose";
import type {
    Adapter,
    AdapterSession,
    VerificationToken as AdapterVerificationToken,
} from "next-auth/adapters";
import type { Account as AdapterAccount, AdapterUser, Awaitable, TokenSet } from "next-auth";
import AuthUser, { IAuthUser } from "./models/AuthUser";
import AuthSession, { IAuthSession } from "./models/AuthSession";
import AuthVerificationToken, { IAuthVerificationToken } from "./models/AuthVerificationToken";
import dbConnect from "./dbConnect";

const MongooseAdapter = (): Adapter => {
    const adapterMethods: Adapter = {
        async getUserByAccount({ providerAccountId }) {
            console.log("getUserByAccount: ", providerAccountId);

            await dbConnect();

            return await adapterMethods.getUser!(providerAccountId);
        },
        async createUser(data) {
            console.log("createUser: ", data);

            await dbConnect();

            const dataset: Partial<IAuthUser> = {};
            if (data.name) dataset.name = data.name;
            if (data.email) dataset.email = data.email;
            if (data.image) {
                if (data.image.includes("http")) {
                    const vars = data.image.split("/");
                    dataset.id = vars[vars.length - 2];
                    dataset.image = vars[vars.length - 1].substring(0, vars[vars.length - 1].indexOf("."));
                } else dataset.image = data.image;
            }
            return await AuthUser.create(dataset);
        },
        async linkAccount(data) {
            console.log("linkAccount: ", data);

            await dbConnect();

            const updateRequest: Partial<IAuthUser> = {
                refresh_token: data.refresh_token,
                access_token: data.access_token,
                expires_at: data.expires_at,
            };
            const user = await adapterMethods.getUser!(data.providerAccountId);
            await AuthUser.updateOne({ id: data.providerAccountId }, updateRequest).exec();
            return { ...user!, ...updateRequest } as any; // "as any" or "/// @ts-ignore"
        },
        async createSession(data) {
            console.log("createSession: ", data);

            await dbConnect();

            const session = await AuthSession.create(data);
            return session;
        },
        async getSessionAndUser(sessionToken) {
            console.log("getSessionAndUser: ", sessionToken);

            await dbConnect();

            const session = await AuthSession.findOne({ sessionToken: sessionToken }).lean().exec();
            if (!session) return null;
            const user = await adapterMethods.getUser!(session.userId);
            if (!user) return null;
            return { user, session };
        },
        async getUser(id) {
            console.log("getUser: ", id);

            await dbConnect();

            return await AuthUser.findOne({ id: id }).lean().exec();
        },
        async getUserByEmail(email) {
            console.log("getUserByEmail: ", email);

            await dbConnect();

            return await AuthUser.findOne({ email: email }).lean().exec();
        },
        async updateUser(data) {
            console.log("updateUser: ", data);

            await dbConnect();
            
            const { id, ...restData } = data;
            let user = await adapterMethods.getUser!(id);
            await AuthUser.updateOne({ id: id }, restData).exec();
            return { ...user!, ...restData as IAuthUser };
        },
        async deleteUser(id) {
            console.log("deleteUser: ", id);

            await dbConnect();

            await AuthUser.deleteOne({ userId: id }).exec();
        },
        async unlinkAccount(data) {
            console.log("unlinkAccount: ", data);

            await dbConnect();

            await AuthUser.deleteOne({ userId: data.providerAccountId }).exec();
        },
        async updateSession(data) {
            console.log("updateSession: ", data);

            await dbConnect();

            await AuthSession.updateOne({ userId: data.userId }, data).lean().exec();
            return { ...data as AdapterSession };
        },
        async deleteSession(sessionToken) {
            console.log("deleteSession: ", sessionToken);

            await dbConnect();

            await AuthSession.deleteOne({ sessionToken: sessionToken }).exec();
        },
        async createVerificationToken(data) {
            console.log("createVerificationToken: ", data);

            await dbConnect();

            const verificationToken = await AuthVerificationToken.create(data);
            return verificationToken;
        },
        async useVerificationToken(data) {
            console.log("useVerificationToken: ", data);
            
            await dbConnect();

            const { identifier, token } = data;
            return await AuthVerificationToken.findOne({ userIdentifier: identifier, token: token }).lean().exec();
        }
    };
  
    return adapterMethods;
}

export default MongooseAdapter;