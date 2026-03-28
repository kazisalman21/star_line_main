import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing getAllBuses...");
  const busesRes = await supabase.from('buses').select('*');
  console.log("buses:", busesRes.error || "OK", busesRes.data?.length);

  console.log("Testing getFleetStatus...");
  const statusRes = await supabase.from('buses').select('status');
  console.log("status:", statusRes.error || "OK", statusRes.data?.length);

  console.log("Testing getDashboardStats...");
  const dRes = await supabase.from('schedules').select('id, routes (origin, destination), buses (name, type)');
  console.log("schedules relational:", dRes.error || "OK", dRes.data?.length);
}

test();
