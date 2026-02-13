import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "talent-iq" });

// Note: Inngest functions can be added here for background jobs
// Since we're using custom JWT auth instead of Clerk, 
// user creation/deletion is handled directly in the auth controller

export const functions = [];
