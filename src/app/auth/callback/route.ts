import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// Сюда ведёт ссылка из письма. Проверяем её и пускаем человека в кабинет.
// Бывают два вида ссылок:
//   ?code=…        — стандартное письмо Supabase (работает в том же браузере, где просили ссылку);
//   ?token_hash=…  — наше собственное письмо, когда подключим свою почту (работает в любом браузере).
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") ?? "email") as EmailOtpType;

  const supabase = await createServerSupabase();
  let failed = true;

  if (code) {
    const flowId = url.searchParams.get("sb_flow_id");
    const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    failed = Boolean(error);
  } else if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    failed = Boolean(error);
  }

  return NextResponse.redirect(new URL(failed ? "/login?error=link" : "/account", url.origin));
}
