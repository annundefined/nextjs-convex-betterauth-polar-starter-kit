import { defineApp } from "convex/server";
import polar from "@convex-dev/polar/convex.config.js";
import betterAuth from "@convex-dev/better-auth/convex.config";
import resend from "@convex-dev/resend/convex.config";

const app = defineApp();
app.use(polar);
app.use(betterAuth);
app.use(resend);

export default app;
