import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/login/actions';

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/gallery" className="text-lg font-bold tracking-tight">
          PinsApp
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/gallery" className="hover:text-neutral-500">
            Galería
          </Link>

          {user ? (
            <>
              <Link href="/upload" className="hover:text-neutral-500">
                Subir
              </Link>
              <Link href="/dashboard" className="hover:text-neutral-500">
                Mi perfil
            </Link>
              <form>
                <button
                  formAction={logout}
                  className="rounded-full bg-neutral-900 px-4 py-1.5 text-white hover:bg-neutral-700"
                >
                  Salir
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-white hover:bg-neutral-700"
            >
              Ingresar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}