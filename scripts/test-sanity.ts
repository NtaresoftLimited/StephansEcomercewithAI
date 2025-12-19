
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { writeClient } from "../sanity/lib/client";

console.log("Write client initialized:", writeClient.config().projectId);
