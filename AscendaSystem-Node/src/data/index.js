import { env } from "../config/env.js";
import { mockDataAdapter } from "./mockStore.js";
import { supabaseDataAdapter } from "./supabaseStore.js";

export const dataAdapter = env.dataProvider === "supabase" ? supabaseDataAdapter : mockDataAdapter;
