import * as authSchema from "../auth/schema";
import * as boardSchema from "../board/schema";

export const appSchema = { ...authSchema, ...boardSchema };
