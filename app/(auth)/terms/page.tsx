export const metadata = {
  title: 'Termos de Uso — Emetis',
  description: 'Termos e condições de uso da plataforma Emetis.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F0F4FF]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Logo */}
        <div className="mb-10">
          <span className="text-2xl font-semibold tracking-tight text-[#0B1D4E]">emetis</span>
        </div>

        <h1 className="text-3xl font-bold text-[#0B1D4E] mb-2">Termos de Uso</h1>
        <p className="text-sm text-[#4A5FA8] mb-10">Última atualização: agosto de 2026</p>

        <div className="space-y-8 text-[#334155] text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta ou utilizar o Emetis, você concorda com estes Termos de Uso e com
              nossa{' '}
              <a href="/privacy" className="text-[#1E3FA0] underline">
                Política de Privacidade
              </a>
              . Se não concordar, não utilize a plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">2. O que é o Emetis</h2>
            <p>
              O Emetis é uma plataforma desenvolvida pela <strong>eColabs</strong> com o propósito
              de facilitar a reconexão física de cristãos por meio de tecnologia. A plataforma oferece
              mapa de proximidade, grupos, célula, cadernos de formação e um assistente de IA chamado Teo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">3. Elegibilidade</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Você deve ter ao menos 13 anos de idade para usar o Emetis.</li>
              <li>Menores entre 13 e 18 anos devem ter consentimento dos pais ou responsáveis.</li>
              <li>Ao se cadastrar, você declara que as informações fornecidas são verdadeiras.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">4. Conta e segurança</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Você é responsável por manter a confidencialidade da sua senha.</li>
              <li>Não compartilhe sua conta com terceiros.</li>
              <li>Notifique-nos imediatamente em caso de acesso não autorizado à sua conta.</li>
              <li>Cada pessoa deve criar apenas uma conta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">5. Uso aceitável</h2>
            <p>Você concorda em não usar o Emetis para:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Publicar conteúdo ofensivo, discriminatório, difamatório ou ilegal.</li>
              <li>Assediar, ameaçar ou prejudicar outros usuários.</li>
              <li>Divulgar informações falsas ou enganosas.</li>
              <li>Tentar acessar sistemas ou dados de outros usuários sem autorização.</li>
              <li>Usar a plataforma para fins comerciais sem aprovação prévia da eColabs.</li>
              <li>Enviar spam ou conteúdo não solicitado em massa.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">6. Conteúdo do usuário</h2>
            <p>
              Você mantém a propriedade do conteúdo que publica no Emetis (fotos de perfil, bio,
              mensagens para o assistente Teo). Ao publicar, você concede à eColabs uma licença
              limitada para exibir esse conteúdo dentro da plataforma e melhorar os serviços,
              de forma agregada e anônima.
            </p>
            <p className="mt-3">
              Você é o único responsável pelo conteúdo que compartilha e garante que ele não viola
              direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">7. Assistente Teo (IA)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>O Teo é um assistente de inteligência artificial com foco em formação cristã.</li>
              <li>As respostas do Teo são geradas automaticamente e podem conter imprecisões.</li>
              <li>Não use o Teo como substituto para aconselhamento pastoral, médico ou jurídico.</li>
              <li>Suas conversas com o Teo são processadas por um provedor de IA terceiro (SambaNova / Meta Llama) sem armazenamento permanente pelo provedor.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">8. Localização geográfica</h2>
            <p>
              O recurso de mapa de proximidade é opcional e ativa o compartilhamento de sua
              localização aproximada com outros membros da sua comunidade. Você pode desativar
              esse recurso a qualquer momento nas configurações do perfil.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">9. Encerramento de conta</h2>
            <p>
              Você pode solicitar a exclusão da sua conta a qualquer momento pelo e-mail{' '}
              <a href="mailto:contato@ecolabs.com.br" className="text-[#1E3FA0] underline">
                contato@ecolabs.com.br
              </a>
              . Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos,
              sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">10. Limitação de responsabilidade</h2>
            <p>
              O Emetis é fornecido "como está". A eColabs não garante disponibilidade ininterrupta
              da plataforma e não se responsabiliza por danos indiretos decorrentes do uso ou da
              impossibilidade de uso do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">11. Alterações nos termos</h2>
            <p>
              Podemos atualizar estes Termos de Uso periodicamente. Notificaremos sobre mudanças
              relevantes por e-mail ou aviso dentro da plataforma. O uso continuado após a
              notificação constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">12. Lei aplicável</h2>
            <p>
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será submetida
              ao foro da Comarca de São Paulo — SP, com renúncia a qualquer outro.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">13. Contato</h2>
            <p>
              Dúvidas sobre estes termos:{' '}
              <a href="mailto:contato@ecolabs.com.br" className="text-[#1E3FA0] underline">
                contato@ecolabs.com.br
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#0B1D4E]/10">
          <p className="text-xs text-[#4A5FA8]">
            © 2026 eColabs · Emetis · אמת
          </p>
        </div>
      </div>
    </main>
  );
}
