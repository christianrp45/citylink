import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from './(auth)/auth';

export const metadata = {
  title: 'Emetis — Conectando cristãos pela proximidade',
  description:
    'O Emetis ajuda cristãos a encontrar amigos, grupos e comunidades próximas, com mapa de proximidade, cadernos de formação e o assistente de IA Teo.',
};

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect('/map');

  return (
    <main className="min-h-screen bg-[#F0F4FF] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <Image
          src="/emetis-logo.svg"
          alt="Emetis"
          width={120}
          height={27}
          priority
        />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[#1E3FA0] hover:underline"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-[#1E3FA0] text-white px-4 py-2 rounded-lg hover:bg-[#0B1D4E] transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <Image
              src="/emetis-icon.svg"
              alt="Emetis"
              width={80}
              height={80}
              priority
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B] mb-4">
            Plataforma cristã de proximidade
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1D4E] leading-tight mb-6">
            Encontre cristãos<br />perto de você
          </h1>
          <p className="text-[#4A5FA8] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            O Emetis conecta cristãos pela proximidade geográfica. Descubra amigos, grupos e
            comunidades da sua vizinhança, participe de células e aprofunde sua formação com
            o assistente de IA Teo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-[#1E3FA0] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#0B1D4E] transition-colors text-sm"
            >
              Começar gratuitamente
            </Link>
            <Link
              href="/login"
              className="border border-[#1E3FA0]/30 text-[#1E3FA0] font-semibold px-8 py-3 rounded-xl hover:bg-[#1E3FA0]/5 transition-colors text-sm"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-[#0B1D4E] mb-12">
            Tudo para a sua comunidade
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#F0F4FF] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E3FA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-[#0B1D4E] mb-2">Mapa de proximidade</h3>
              <p className="text-sm text-[#4A5FA8] leading-relaxed">
                Veja cristãos, grupos e igrejas próximos a você no mapa interativo.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#F0F4FF] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E3FA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="font-semibold text-[#0B1D4E] mb-2">Grupos e células</h3>
              <p className="text-sm text-[#4A5FA8] leading-relaxed">
                Encontre e participe de grupos pequenos e células da sua região.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#F0F4FF] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E3FA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10"/>
                  <path d="M12 6v6l4 2"/>
                  <circle cx="19" cy="5" r="3" fill="#F59E0B" stroke="none"/>
                </svg>
              </div>
              <h3 className="font-semibold text-[#0B1D4E] mb-2">Formação e IA</h3>
              <p className="text-sm text-[#4A5FA8] leading-relaxed">
                Cadernos de formação cristã e o assistente Teo para aprofundar sua fé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center">
        <p className="text-xs text-[#4A5FA8] mb-3">© 2026 eColabs · Emetis · אמת</p>
        <div className="flex gap-4 justify-center text-xs text-[#4A5FA8]">
          <Link href="/privacy" className="hover:text-[#1E3FA0] underline">Privacidade</Link>
          <Link href="/terms" className="hover:text-[#1E3FA0] underline">Termos</Link>
        </div>
      </footer>
    </main>
  );
}
