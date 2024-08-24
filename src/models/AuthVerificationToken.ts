import { Model, Schema, model, models } from "mongoose";

export interface IAuthVerificationToken {
    identifier: string,
    token: string,
    expires: Date
}

const AuthVerificationTokenSchema = new Schema<IAuthVerificationToken>({
	identifier: { type: String, trim: true },
	token: { type: String, trim: true },
	expires: { type: Date, trim: true }
});

export default models?.RC_Auth_VerificationToken as Model<IAuthVerificationToken> || model<IAuthVerificationToken>("RC_Auth_VerificationToken", AuthVerificationTokenSchema);