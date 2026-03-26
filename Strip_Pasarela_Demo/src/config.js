import {config} from "dotenv";
config();

export const PORT=4000;
export const STRIPE_KEY=process.env.STRIPE_KEY;