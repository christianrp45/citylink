import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Church, Users, Heart, HandHeart, BookOpen, BookMarked, ChevronRight, ChevronLeft, MapPin, Phone, CheckCircle, Plus, ThumbsUp, MessageCircle, AlertTriangle, X, Calendar, Star, Bookmark } from 'lucide-react';
import type { SamaritanAlert } from '../types';

type CommunityTab = 'churches' | 'prayer' | 'testimonials' | 'volunteer' | 'bible';

export default function CommunityPage() {
  const [tab, setTab] = useState<CommunityTab>('churches');
  const [showSamaritanModal, setShowSamaritanModal] = useState(false);
  const { currentUser, addSamaritanAlert, userLocation } = useStore();
  const [alertType, setAlertType] = useState<SamaritanAlert['type']>('practical_help');
  const [alertDesc, setAlertDesc] = useState('');

  const tabs: { id: CommunityTab; label: string; icon: React.ReactNode }[] = [
    { id: 'churches', label: 'Igrejas', icon: <Church size={14} /> },
    { id: 'prayer', label: 'Oração', icon: <BookOpen size={14} /> },
    { id: 'testimonials', label: 'Testemunhos', icon: <Heart size={14} /> },
    { id: 'volunteer', label: 'Voluntário', icon: <HandHeart size={14} /> },
    { id: 'bible', label: 'Bíblia', icon: <BookMarked size={14} /> },
  ];

  const handleSendAlert = () => {
    if (!currentUser || !alertDesc.trim()) return;
    addSamaritanAlert({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type: alertType,
      description: alertDesc.trim(),
      location: userLocation ?? currentUser.homeLocation ?? { lat: -16.6864, lng: -49.2643, address: 'Goiânia' },
    });
    setAlertDesc('');
    setShowSamaritanModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                tab === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {tab === 'churches' && <ChurchesTab />}
        {tab === 'prayer' && <PrayerGroupsTab />}
        {tab === 'testimonials' && <TestimonialsTab />}
        {tab === 'volunteer' && <VolunteerTab />}
        {tab === 'bible' && <BibleTab />}
      </div>

      {/* FAB — Botão Bom Samaritano */}
      <button
        onClick={() => setShowSamaritanModal(true)}
        className="absolute bottom-4 right-4 bg-amber-500 text-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2 font-bold text-sm hover:bg-amber-600 transition-colors z-10"
      >
        <AlertTriangle size={18} /> Preciso de Ajuda!
      </button>

      {/* Modal Samaritano — Bottom Sheet */}
      {showSamaritanModal && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-end" onClick={() => setShowSamaritanModal(false)}>
          <div className="w-full bg-white rounded-t-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HandHeart size={20} className="text-amber-500" />
                <p className="font-bold text-slate-800">Botão Bom Samaritano</p>
              </div>
              <button onClick={() => setShowSamaritanModal(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Sua comunidade será notificada. Alguém próximo pode ajudar.</p>

            {/* Tipo */}
            <div className="flex gap-2 mb-4">
              {([
                { id: 'practical_help', label: '🔧 Ajuda Prática' },
                { id: 'prayer', label: '🙏 Oração' },
                { id: 'urgency', label: '🚨 Urgência' },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAlertType(opt.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    alertType === opt.id
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <textarea
              value={alertDesc}
              onChange={e => setAlertDesc(e.target.value)}
              placeholder="Descreva o que você precisa..."
              className="w-full px-3 py-3 border border-slate-200 rounded-2xl text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
            />

            <button
              onClick={handleSendAlert}
              disabled={!alertDesc.trim()}
              className="w-full py-3 bg-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-40"
            >
              <AlertTriangle size={16} /> Enviar Alerta para a Comunidade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChurchesTab() {
  const { churches } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
        {churches.length} igrejas cadastradas
      </p>
      {churches.map(church => (
        <div key={church.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            className="w-full p-4 text-left"
            onClick={() => setExpanded(expanded === church.id ? null : church.id)}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Church size={22} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800">{church.name}</p>
                <p className="text-xs text-purple-600 font-semibold">{church.denomination}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> {church.location.address}
                </p>
              </div>
              <ChevronRight size={16} className={`text-slate-300 flex-shrink-0 transition-transform ${expanded === church.id ? 'rotate-90' : ''}`} />
            </div>

            {expanded === church.id && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 fade-in">
                <p className="text-sm text-slate-600">{church.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone size={12} className="text-purple-500" /> {church.phone}
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Horários de Culto</p>
                  <p className="text-xs text-purple-600">{church.schedule}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  {church.pastor && <span>Pastor(a): <strong>{church.pastor}</strong></span>}
                  <span><Users size={12} className="inline mr-1" />{church.members} membros</span>
                </div>
                <button className="w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors">
                  Ver no Mapa
                </button>
              </div>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

function PrayerGroupsTab() {
  const { prayerGroups, currentUser, joinPrayerGroup } = useStore();

  return (
    <div className="p-4 space-y-3">
      <button className="w-full py-3 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
        <Plus size={16} /> Criar Grupo de Oração
      </button>

      {prayerGroups.map(group => {
        const joined = currentUser ? group.members.includes(currentUser.id) : false;
        return (
          <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-slate-800 text-sm">{group.name}</p>
                  {group.isOnline && (
                    <span className="flex-shrink-0 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Online</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{group.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users size={10} /> {group.members.length} membros
                  </span>
                  <span className="text-xs text-purple-600">{group.schedule}</span>
                </div>
                <div className="mt-1">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{group.topic}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => currentUser && joinPrayerGroup(group.id)}
              className={`mt-3 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                joined
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {joined ? <><CheckCircle size={12} /> Participando</> : 'Participar do Grupo'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function TestimonialsTab() {
  const { testimonials, currentUser, likeTestimonial, addTestimonial, users } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    addTestimonial(title.trim(), content.trim());
    setTitle('');
    setContent('');
    setShowForm(false);
  };

  return (
    <div className="p-4 space-y-3">
      {/* Add testimonial */}
      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 fade-in">
          <p className="font-bold text-slate-800 mb-3">Compartilhar Testemunho</p>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título do testemunho"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Compartilhe o que Deus fez em sua vida..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
              Publicar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
        >
          <Plus size={16} /> Compartilhar Testemunho
        </button>
      )}

      {testimonials.map(t => {
        const author = users.find(u => u.id === t.userId);
        const liked = currentUser ? t.likes.includes(currentUser.id) : false;
        return (
          <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src={author?.avatar} alt={author?.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-slate-800 text-sm">{author?.name}</p>
                <p className="text-xs text-slate-400">
                  {t.createdAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{t.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{t.content}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50">
              <button
                onClick={() => currentUser && likeTestimonial(t.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${liked ? 'text-purple-600' : 'text-slate-400 hover:text-purple-500'}`}
              >
                <ThumbsUp size={14} className={liked ? 'fill-purple-600' : ''} />
                {t.likes.length} Amém
              </button>
              <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-semibold">
                <MessageCircle size={14} /> {t.comments.length} Comentários
              </button>
            </div>
            {t.comments.length > 0 && (
              <div className="mt-3 space-y-2">
                {t.comments.map(c => {
                  const commenter = users.find(u => u.id === c.userId);
                  return (
                    <div key={c.id} className="bg-slate-50 rounded-xl p-3 flex gap-2">
                      <img src={commenter?.avatar} alt={commenter?.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{commenter?.name}</p>
                        <p className="text-xs text-slate-500">{c.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VolunteerTab() {
  const { volunteerOpportunities, currentUser, enrollVolunteer } = useStore();

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
        Oportunidades de Voluntariado
      </p>
      {volunteerOpportunities.map(v => {
        const enrolled = currentUser ? v.enrolled.includes(currentUser.id) : false;
        const spotsLeft = v.spots - v.enrolled.length;
        return (
          <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-bold text-slate-800">{v.title}</h4>
              <span className="flex-shrink-0 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{v.category}</span>
            </div>
            <p className="text-sm text-slate-500 mb-3">{v.description}</p>
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={12} className="text-green-500" /> {v.location.address}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users size={12} className="text-green-500" />
                {v.enrolled.length}/{v.spots} inscritos •
                <span className={spotsLeft <= 5 ? 'text-red-500 font-semibold' : 'text-green-600'}>
                  {spotsLeft} vagas restantes
                </span>
              </div>
              <div className="text-xs text-slate-400">
                por <strong>{v.organizerName}</strong> •{' '}
                {v.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </div>
            </div>
            <button
              onClick={() => currentUser && enrollVolunteer(v.id)}
              disabled={!enrolled && spotsLeft === 0}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                enrolled
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : spotsLeft === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {enrolled ? <><CheckCircle size={14} /> Inscrito</> : spotsLeft === 0 ? 'Sem vagas' : 'Quero Ser Voluntário'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Bible data ────────────────────────────────────────────────────────────────

const DAILY_VERSES = [
  { ref: 'João 3:16', text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.' },
  { ref: 'Salmos 23:1', text: 'O Senhor é o meu pastor; nada me faltará.' },
  { ref: 'Filipenses 4:13', text: 'Tudo posso naquele que me fortalece.' },
  { ref: 'Isaías 41:10', text: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.' },
  { ref: 'Romanos 8:28', text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.' },
  { ref: 'Provérbios 3:5-6', text: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.' },
  { ref: 'Jeremias 29:11', text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.' },
  { ref: 'Mateus 5:16', text: 'Assim resplandeça a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem a vosso Pai, que está nos céus.' },
  { ref: 'Josué 1:9', text: 'Não to mandei eu? Esforça-te e tem bom ânimo; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares.' },
  { ref: 'Salmos 46:1', text: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.' },
];

interface BibleBook { name: string; chapters: number; testament: 'AT' | 'NT'; }

const BIBLE_BOOKS: BibleBook[] = [
  { name: 'Gênesis', chapters: 50, testament: 'AT' },
  { name: 'Êxodo', chapters: 40, testament: 'AT' },
  { name: 'Levítico', chapters: 27, testament: 'AT' },
  { name: 'Números', chapters: 36, testament: 'AT' },
  { name: 'Deuteronômio', chapters: 34, testament: 'AT' },
  { name: 'Josué', chapters: 24, testament: 'AT' },
  { name: 'Juízes', chapters: 21, testament: 'AT' },
  { name: 'Rute', chapters: 4, testament: 'AT' },
  { name: '1 Samuel', chapters: 31, testament: 'AT' },
  { name: '2 Samuel', chapters: 24, testament: 'AT' },
  { name: '1 Reis', chapters: 22, testament: 'AT' },
  { name: '2 Reis', chapters: 25, testament: 'AT' },
  { name: '1 Crônicas', chapters: 29, testament: 'AT' },
  { name: '2 Crônicas', chapters: 36, testament: 'AT' },
  { name: 'Esdras', chapters: 10, testament: 'AT' },
  { name: 'Neemias', chapters: 13, testament: 'AT' },
  { name: 'Ester', chapters: 10, testament: 'AT' },
  { name: 'Jó', chapters: 42, testament: 'AT' },
  { name: 'Salmos', chapters: 150, testament: 'AT' },
  { name: 'Provérbios', chapters: 31, testament: 'AT' },
  { name: 'Eclesiastes', chapters: 12, testament: 'AT' },
  { name: 'Cânticos', chapters: 8, testament: 'AT' },
  { name: 'Isaías', chapters: 66, testament: 'AT' },
  { name: 'Jeremias', chapters: 52, testament: 'AT' },
  { name: 'Lamentações', chapters: 5, testament: 'AT' },
  { name: 'Ezequiel', chapters: 48, testament: 'AT' },
  { name: 'Daniel', chapters: 12, testament: 'AT' },
  { name: 'Oséias', chapters: 14, testament: 'AT' },
  { name: 'Joel', chapters: 3, testament: 'AT' },
  { name: 'Amós', chapters: 9, testament: 'AT' },
  { name: 'Obadias', chapters: 1, testament: 'AT' },
  { name: 'Jonas', chapters: 4, testament: 'AT' },
  { name: 'Miquéias', chapters: 7, testament: 'AT' },
  { name: 'Naum', chapters: 3, testament: 'AT' },
  { name: 'Habacuque', chapters: 3, testament: 'AT' },
  { name: 'Sofonias', chapters: 3, testament: 'AT' },
  { name: 'Ageu', chapters: 2, testament: 'AT' },
  { name: 'Zacarias', chapters: 14, testament: 'AT' },
  { name: 'Malaquias', chapters: 4, testament: 'AT' },
  { name: 'Mateus', chapters: 28, testament: 'NT' },
  { name: 'Marcos', chapters: 16, testament: 'NT' },
  { name: 'Lucas', chapters: 24, testament: 'NT' },
  { name: 'João', chapters: 21, testament: 'NT' },
  { name: 'Atos', chapters: 28, testament: 'NT' },
  { name: 'Romanos', chapters: 16, testament: 'NT' },
  { name: '1 Coríntios', chapters: 16, testament: 'NT' },
  { name: '2 Coríntios', chapters: 13, testament: 'NT' },
  { name: 'Gálatas', chapters: 6, testament: 'NT' },
  { name: 'Efésios', chapters: 6, testament: 'NT' },
  { name: 'Filipenses', chapters: 4, testament: 'NT' },
  { name: 'Colossenses', chapters: 4, testament: 'NT' },
  { name: '1 Tessalonicenses', chapters: 5, testament: 'NT' },
  { name: '2 Tessalonicenses', chapters: 3, testament: 'NT' },
  { name: '1 Timóteo', chapters: 6, testament: 'NT' },
  { name: '2 Timóteo', chapters: 4, testament: 'NT' },
  { name: 'Tito', chapters: 3, testament: 'NT' },
  { name: 'Filemom', chapters: 1, testament: 'NT' },
  { name: 'Hebreus', chapters: 13, testament: 'NT' },
  { name: 'Tiago', chapters: 5, testament: 'NT' },
  { name: '1 Pedro', chapters: 5, testament: 'NT' },
  { name: '2 Pedro', chapters: 3, testament: 'NT' },
  { name: '1 João', chapters: 5, testament: 'NT' },
  { name: '2 João', chapters: 1, testament: 'NT' },
  { name: '3 João', chapters: 1, testament: 'NT' },
  { name: 'Judas', chapters: 1, testament: 'NT' },
  { name: 'Apocalipse', chapters: 22, testament: 'NT' },
];

interface ReadingPlan { id: string; title: string; description: string; totalDays: number; currentDay: number; icon: string; todayReading: string; }

const READING_PLANS: ReadingPlan[] = [
  { id: 'biblia-1-ano', title: 'Bíblia em 1 Ano', description: 'Leia toda a Bíblia em 365 dias', totalDays: 365, currentDay: 115, icon: '📖', todayReading: 'Josué 1–3, Salmos 115' },
  { id: 'nt-90-dias', title: 'Novo Testamento em 90 Dias', description: 'Percorra todo o NT em 3 meses', totalDays: 90, currentDay: 23, icon: '✝️', todayReading: 'Mateus 23–25' },
  { id: 'salmos-30', title: 'Salmos em 30 Dias', description: 'Um Salmo por dia durante um mês', totalDays: 30, currentDay: 8, icon: '🎵', todayReading: 'Salmos 8' },
  { id: 'proverbios-31', title: 'Provérbios do Mês', description: 'Um capítulo de Provérbios por dia', totalDays: 31, currentDay: 12, icon: '💡', todayReading: 'Provérbios 12' },
];

type SampleVerses = Record<string, Record<number, string[]>>;
const SAMPLE_VERSES: SampleVerses = {
  'Gênesis': {
    1: [
      'No princípio criou Deus os céus e a terra.',
      'A terra era sem forma e vazia; e havia trevas sobre a face do abismo, mas o Espírito de Deus se movia sobre a face das águas.',
      'E disse Deus: Haja luz; e houve luz.',
      'E viu Deus que a luz era boa; e fez Deus separação entre a luz e as trevas.',
      'E Deus chamou à luz Dia; e às trevas chamou Noite; e foi a tarde e a manhã, o dia primeiro.',
    ],
  },
  'Salmos': {
    23: [
      'O Senhor é o meu pastor; nada me faltará.',
      'Deitar-me faz em verdes pastos; guia-me mansamente a águas tranquilas.',
      'Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.',
      'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; o teu cajado e o teu báculo me consolam.',
      'Preparas uma mesa perante mim na presença dos meus adversários; unges a minha cabeça com óleo; o meu cálice transborda.',
      'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias.',
    ],
  },
  'João': {
    3: [
      'Havia entre os fariseus um homem chamado Nicodemos, um dos líderes dos judeus.',
      'Este foi ter com Jesus de noite e disse: Rabi, sabemos que você é um mestre que veio de Deus, pois ninguém poderia fazer estes sinais miraculosos que você faz se Deus não fosse com ele.',
      'Jesus respondeu: Digo-lhe a verdade: ninguém pode ver o reino de Deus sem que nasça de novo.',
      'Porque Deus amou o mundo de tal maneira que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.',
      'Porque Deus enviou o seu Filho ao mundo não para condenar o mundo, mas para que o mundo por ele fosse salvo.',
    ],
    14: [
      'Não se perturbe o vosso coração; credes em Deus, crede também em mim.',
      'Na casa de meu Pai há muitas moradas; se assim não fosse, eu vo-lo teria dito; vou preparar-vos lugar.',
      'E quando eu for, e vos preparar lugar, virei outra vez, e vos levarei para mim mesmo, para que onde eu estiver, estejais vós também.',
      'Eu sou o caminho, a verdade e a vida; ninguém vem ao Pai senão por mim.',
      'A paz vos deixo, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.',
    ],
  },
  'Mateus': {
    5: [
      'Bem-aventurados os pobres de espírito, porque deles é o reino dos céus.',
      'Bem-aventurados os que choram, porque eles serão consolados.',
      'Bem-aventurados os mansos, porque eles herdarão a terra.',
      'Bem-aventurados os que têm fome e sede de justiça, porque eles serão fartos.',
      'Bem-aventurados os misericordiosos, porque eles alcançarão misericórdia.',
      'Bem-aventurados os limpos de coração, porque eles verão a Deus.',
      'Bem-aventurados os pacificadores, porque eles serão chamados filhos de Deus.',
      'Bem-aventurados os que são perseguidos por causa da justiça, porque deles é o reino dos céus.',
    ],
  },
  'Romanos': {
    8: [
      'Portanto, já não há nenhuma condenação para os que estão em Cristo Jesus.',
      'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.',
      'Quem nos separará do amor de Cristo? A tribulação, ou a angústia, ou a perseguição, ou a fome, ou a nudez, ou o perigo, ou a espada?',
      'Mas em todas estas coisas somos mais do que vencedores, por meio daquele que nos amou.',
      'Porque estou convicto de que nem a morte, nem a vida, nem os anjos, nem os principados, nem as potestades, nem o presente, nem o porvir, nem a altura, nem a profundidade, nem alguma outra criatura nos poderá separar do amor de Deus, que está em Cristo Jesus nosso Senhor.',
    ],
  },
};

// ─── BibleTab component ────────────────────────────────────────────────────────

function BibleTab() {
  const [view, setView] = useState<'home' | 'chapters' | 'reading'>('home');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [testament, setTestament] = useState<'AT' | 'NT'>('AT');
  const [enrolledPlans, setEnrolledPlans] = useState<string[]>(['biblia-1-ano']);

  const today = new Date();
  const todayVerse = DAILY_VERSES[today.getDate() % DAILY_VERSES.length];

  const togglePlan = (planId: string) => {
    setEnrolledPlans(prev =>
      prev.includes(planId) ? prev.filter(id => id !== planId) : [...prev, planId]
    );
  };

  if (view === 'reading' && selectedBook && selectedChapter !== null) {
    const verses = SAMPLE_VERSES[selectedBook.name]?.[selectedChapter];
    return (
      <div className="p-4 pb-24">
        <button
          onClick={() => setView('chapters')}
          className="flex items-center gap-1.5 text-purple-600 text-sm font-semibold mb-4"
        >
          <ChevronLeft size={16} /> {selectedBook.name}
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-bold text-slate-800 text-lg">{selectedBook.name}</h2>
          <p className="text-sm text-purple-600 font-semibold mb-4">Capítulo {selectedChapter}</p>
          {verses ? (
            <div className="space-y-4">
              {verses.map((verse, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-xs font-bold text-purple-300 mt-0.5 w-5 flex-shrink-0">{idx + 1}</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{verse}</p>
                </div>
              ))}
              <p className="text-xs text-center text-slate-300 mt-6 pt-4 border-t border-slate-50">
                — Almeida Revista e Atualizada —
              </p>
            </div>
          ) : (
            <div className="text-center py-10">
              <BookOpen size={42} className="text-purple-100 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">Conteúdo em breve</p>
              <p className="text-xs text-slate-300 mt-1">Esta é uma versão de demonstração</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'chapters' && selectedBook) {
    return (
      <div className="p-4 pb-24">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-1.5 text-purple-600 text-sm font-semibold mb-4"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
          <h2 className="font-bold text-slate-800 text-xl">{selectedBook.name}</h2>
          <p className="text-xs text-purple-600 font-semibold mt-0.5">
            {selectedBook.testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'} • {selectedBook.chapters} capítulos
          </p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => {
            const hasContent = !!SAMPLE_VERSES[selectedBook.name]?.[ch];
            return (
              <button
                key={ch}
                onClick={() => { setSelectedChapter(ch); setView('reading'); }}
                className={`py-3 rounded-xl text-sm font-bold transition-colors ${
                  hasContent
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ch}
              </button>
            );
          })}
        </div>
        {Object.keys(SAMPLE_VERSES[selectedBook.name] ?? {}).length > 0 && (
          <p className="text-xs text-center text-purple-400 font-semibold mt-3">
            Capítulos em roxo possuem conteúdo disponível
          </p>
        )}
      </div>
    );
  }

  const books = BIBLE_BOOKS.filter(b => b.testament === testament);

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Versículo do Dia */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Star size={13} className="text-yellow-300 fill-yellow-300" />
          <span className="text-xs font-bold text-purple-200 uppercase tracking-wide">Versículo do Dia</span>
        </div>
        <p className="text-sm leading-relaxed font-medium italic mb-3">"{todayVerse.text}"</p>
        <p className="text-xs font-bold text-purple-200">— {todayVerse.ref}</p>
        <div className="flex items-center gap-2 mt-4">
          <button className="flex items-center gap-1 text-xs text-purple-200 hover:text-white transition-colors">
            <Bookmark size={11} /> Salvar
          </button>
          <span className="text-purple-500">•</span>
          <span className="text-xs text-purple-300">
            {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Planos de Leitura */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-slate-500" />
          <h3 className="font-bold text-slate-700 text-sm">Planos de Leitura</h3>
        </div>
        <div className="space-y-3">
          {READING_PLANS.map(plan => {
            const joined = enrolledPlans.includes(plan.id);
            const progress = Math.round((plan.currentDay / plan.totalDays) * 100);
            return (
              <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{plan.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{plan.title}</p>
                      <p className="text-xs text-slate-400">{plan.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePlan(plan.id)}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      joined
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {joined ? <><CheckCircle size={10} /> Ativo</> : 'Iniciar'}
                  </button>
                </div>
                {joined && (
                  <>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Dia {plan.currentDay}/{plan.totalDays} •{' '}
                        <span className="text-purple-600 font-semibold">{plan.todayReading}</span>
                      </p>
                      <span className="text-xs text-slate-400">{progress}%</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explorar a Bíblia */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={14} className="text-slate-500" />
          <h3 className="font-bold text-slate-700 text-sm">Explorar a Bíblia</h3>
        </div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTestament('AT')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              testament === 'AT' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Antigo Testamento (39)
          </button>
          <button
            onClick={() => setTestament('NT')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              testament === 'NT' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Novo Testamento (27)
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {books.map(book => (
            <button
              key={book.name}
              onClick={() => { setSelectedBook(book); setView('chapters'); }}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 text-left hover:border-purple-200 hover:bg-purple-50 transition-colors group"
            >
              <p className="font-semibold text-slate-700 text-sm group-hover:text-purple-700">{book.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{book.chapters} caps.</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
