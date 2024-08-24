import { Model, Schema, model, models } from "mongoose";
import AuthUser from "./AuthUser";

export interface IAuthSession {
    userId: string,
    sessionToken: string,
    expires: Date
}

const AuthSessionSchema = new Schema<IAuthSession>({
	userId: { type: String, ref: AuthUser },
	sessionToken: { type: String, trim: true },
	expires: { type: Date, trim: true },
});

export default models?.RC_Auth_Session as Model<IAuthSession> || model<IAuthSession>("RC_Auth_Session", AuthSessionSchema);