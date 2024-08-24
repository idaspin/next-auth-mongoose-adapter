import { Model, Schema, model, models } from "mongoose";

export interface IAuthUser {
    id: string,
    image: string,
    name: string,
    
    accent_color: number, 
    locale: string, 
    email: string,

    refresh_token: string,
    access_token: string,
    expires_at: number,
    emailVerified: Date | null
}

const AuthUserSchema = new Schema<IAuthUser>({
	id: { type: String, trim: true },
	image: { type: String, trim: true },
	name: { type: String, trim: true },

	accent_color: { type: Number, trim: true },
	locale: { type: String, trim: true },
	email: { type: String, trim: true },

	refresh_token: { type: String, trim: true },
	access_token: { type: String, trim: true },
	expires_at: { type: Number, trim: true },
	emailVerified: { type: Number, default: null } // required for Account type
});

export default models?.RC_Auth_User as Model<IAuthUser> || model<IAuthUser>("RC_Auth_User", AuthUserSchema);