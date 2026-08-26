export const metadata = {
  title: 'Política de Privacidade — Emetis',
  description: 'Como o Emetis coleta, usa e protege seus dados.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F0F4FF]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Logo */}
        <div className="mb-10">
          <span className="text-2xl font-semibold tracking-tight text-[#0B1D4E]">emetis</span>
        </div>

        <h1 className="text-3xl font-bold text-[#0B1D4E] mb-2">Política de Privacidade</h1>
        <p className="text-sm text-[#4A5FA8] mb-10">Última atualização: agosto de 2026</p>

        <div className="space-y-8 text-[#334155] text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">1. Quem somos</h2>
            <p>
              O Emetis é uma plataforma desenvolvida pela <strong>eColabs</strong> para facilitar
              a reconexão física de cristãos por meio da tecnologia. Nosso compromisso com a sua
              privacidade é parte central de como construímos o produto.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">2. Dados que coletamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Conta:</strong> nome, e-mail e senha (armazenada com criptografia bcrypt).</li>
              <li><strong>Perfil:</strong> foto, bio, profissão e telefone — todos opcionais.</li>
              <li><strong>Localização:</strong> coordenadas geográficas aproximadas, apenas quando você ativa o mapa de proximidade.</li>
              <li><strong>Login social:</strong> se você entrar com o Google, recebemos seu nome e e-mail fornecidos pelo Google. Não armazenamos sua senha do Google.</li>
              <li><strong>Uso do app:</strong> histórico de conversas com o assistente Teo, pontos de gamificação e progresso nos cadernos de formação.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Exibir seu perfil para outros membros da sua comunidade.</li>
              <li>Sugerir conexões por proximidade geográfica.</li>
              <li>Enviar notificações sobre grupos, células e eventos.</li>
              <li>Melhorar o assistente de IA Teo com base em perguntas anônimas e agregadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">4. Compartilhamento de dados</h2>
            <p>
              Não vendemos seus dados. Compartilhamos informações apenas com:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Neon (banco de dados):</strong> armazenamento seguro na região AWS São Paulo.</li>
              <li><strong>Vercel:</strong> hospedagem do aplicativo.</li>
              <li><strong>SambaNova / Meta Llama:</strong> processamento das mensagens para o assistente Teo (sem armazenamento permanente pelo provedor).</li>
              <li><strong>Resend:</strong> envio de e-mails transacionais (redefinição de senha).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">5. Seus direitos (LGPD)</h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Acessar os dados que temos sobre você.</li>
              <li>Corrigir dados incorretos ou incompletos.</li>
              <li>Solicitar a exclusão da sua conta e de todos os seus dados.</li>
              <li>Revogar o consentimento para uso de localização a qualquer momento.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer direito, envie um e-mail para{' '}
              <a href="mailto:contato@ecolabs.com.br" className="text-[#1E3FA0] underline">
                contato@ecolabs.com.br
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">6. Retenção de dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar exclusão, removemos
              todos os dados pessoais em até 30 dias, exceto registros exigidos por lei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">7. Segurança</h2>
            <p>
              Utilizamos HTTPS, senhas com hash bcrypt, tokens JWT assinados e banco de dados
              isolado na região de São Paulo. Acesso ao banco é restrito por variáveis de ambiente
              e não exposto publicamente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1D4E] mb-3">8. Contato</h2>
            <p>
              Dúvidas sobre esta política:{' '}
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
