import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Proxy — «охранник на входе»: срабатывает перед каждой страницей.
// Его задача здесь одна: если вход скоро истечёт, Supabase выдаёт свежий,
// и мы кладём обновлённые cookie в ответ. Так человек не «вылетает» из кабинета.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Этот вызов и обновляет вход, если нужно. Ничего больше не делаем.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  // Не запускаем охранника для картинок, видео, шрифтов и служебных файлов Next.js
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|videos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
