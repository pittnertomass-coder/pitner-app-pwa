export async function GET() {
  return Response.json({
    ok: true,
    openAccess: process.env.OPEN_ACCESS ?? "(not set)",
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
