'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/citylink-bottom-nav';

// ─── Mock Users ───────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 'u1', name: 'Joao Silva',    avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 'u2', name: 'Maria Santos',  avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 'u3', name: 'Pedro Oliveira',avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 'u4', name: 'Ana Costa',     avatar: 'https://i.pravatar.cc/150?img=9' },
];

const CURRENT_USER = { id: 'u1', name: 'João Silva', avatar: 'https://i.pravatar.cc/150?img=1' };

// ─── Mock Churches ────────────────────────────────────────────────────────────
const MOCK_CHURCHES = [
  {
    id: 'c1',
    name: 'Igreja Comunidade da Graca',
    denomination: 'Evangelica',
    location: { address: 'Setor Bueno, Goiania' },
    description: 'Uma comunidade vibrante focada no amor e no servico.',
    phone: '(62) 3333-1111',
    schedule: 'Domingos 9h e 18h | Quartas 19h30',
    pastor: 'Pedro Oliveira',
    members: 320,
  },
  {
    id: 'c2',
    name: 'Igreja Batista Central',
    denomination: 'Batista',
    location: { address: 'Setor Central, Goiania' },
    description: 'Servindo a cidade de Goiania ha mais de 50 anos.',
    phone: '(62) 3333-2222',
    schedule: 'Domingos 8h e 19h | Terca 19h30',
    pastor: 'Ana Lima',
    members: 580,
  },
  {
    id: 'c3',
    name: 'Assembleia de Deus',
    denomination: 'Pentecostal',
    location: { address: 'Jardim Goias, Goiania' },
    description: 'Igreja pentecostal com forte ministerio de missoes.',
    phone: '(62) 3333-3333',
    schedule: 'Domingos 9h e 19h | Quinta 20h',
    pastor: 'Carlos Ferreira',
    members: 1200,
  },
];

// ─── Mock Prayer Groups ───────────────────────────────────────────────────────
const MOCK_PRAYER_GROUPS = [
  {
    id: 'pg1',
    name: 'Guerreiros da Manha',
    description: 'Oracao e devocional todos os dias as 6h',
    members: ['u1', 'u3'],
    schedule: 'Seg a Sex, 6h',
    topic: 'Intercessao',
    isOnline: true,
  },
  {
    id: 'pg2',
    name: 'Mulheres em Oracao',
    description: 'Grupo de oracao e edificacao para mulheres',
    members: ['u2', 'u4'],
    schedule: 'Quartas, 19h',
    topic: 'Familia',
    isOnline: false,
  },
  {
    id: 'pg3',
    name: 'Jovens que Oram',
    description: 'Jovens unidos pela oracao e pela Palavra',
    members: ['u1'],
    schedule: 'Sabados, 15h',
    topic: 'Avivamento',
    isOnline: true,
  },
];

// ─── Mock Testimonials ────────────────────────────────────────────────────────
const MOCK_TESTIMONIALS = [
  {
    id: 't1',
    userId: 'u3',
    title: 'Cura de uma doenca grave',
    content:
      'Fui diagnosticado com uma doenca seria no inicio do ano. A comunidade se uniu em oracao e hoje estou completamente curado. Gloria a Deus!',
    likes: ['u1', 'u2'],
    comments: [{ id: 'c1', userId: 'u1', content: 'Que testemunho lindo! Deus e fiel!' }],
    createdAt: new Date('2024-03-15'),
  },
  {
    id: 't2',
    userId: 'u2',
    title: 'Restauracao do meu casamento',
    content:
      'Nosso casamento estava a beira do fim. Atraves de aconselhamento e muita oracao, Deus restaurou tudo. Somos mais fortes do que nunca.',
    likes: ['u3'],
    comments: [],
    createdAt: new Date('2024-04-02'),
  },
];

// ─── Mock Volunteer ───────────────────────────────────────────────────────────
const MOCK_VOLUNTEER = [
  {
    id: 'v1',
    title: 'Distribuicao de Alimentos',
    description: 'Ajude a distribuir cestas basicas para familias carentes da comunidade.',
    category: 'Social',
    location: { address: 'Setor Pedro Ludovico, Goiania' },
    spots: 20,
    enrolled: ['u1', 'u2'],
    organizerName: 'Diaconia Central',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'v2',
    title: 'Visitas ao Lar dos Idosos',
    description: 'Leve alegria e companhia aos idosos do lar. Musica, conversa e amor.',
    category: 'Assistencia',
    location: { address: 'Setor Oeste, Goiania' },
    spots: 10,
    enrolled: ['u3'],
    organizerName: 'Grupo Vida',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'v3',
    title: 'Aulas de Reforco Escolar',
    description: 'Voluntarios para dar aulas de matematica e portugues para criancas carentes.',
    category: 'Educacao',
    location: { address: 'Setor Jardim America, Goiania' },
    spots: 5,
    enrolled: [],
    organizerName: 'Instituto Educar',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
];

// ─── Bible Data ───────────────────────────────────────────────────────────────
const DAILY_VERSES = [
  {
    reference: 'Filipenses 4:13',
    text: 'Tudo posso naquele que me fortalece.',
    theme: 'Força',
  },
  {
    reference: 'Salmos 23:1',
    text: 'O Senhor é meu pastor; nada me faltará.',
    theme: 'Provisão',
  },
  {
    reference: 'João 3:16',
    text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    theme: 'Amor',
  },
  {
    reference: 'Jeremias 29:11',
    text: 'Porque eu bem sei os planos que tenho para vós, diz o Senhor; planos de paz e não de mal, para vos dar um futuro e uma esperança.',
    theme: 'Esperança',
  },
  {
    reference: 'Romanos 8:28',
    text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.',
    theme: 'Propósito',
  },
  {
    reference: 'Provérbios 3:5-6',
    text: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
    theme: 'Confiança',
  },
  {
    reference: 'Isaías 40:31',
    text: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.',
    theme: 'Renovação',
  },
];

const BIBLE_BOOKS = [
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
  { name: 'Cântico dos Cânticos', chapters: 8, testament: 'AT' },
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

const BIBLE_VERSIONS = [
  { id: 'ARC', name: 'Almeida Revista e Corrigida', abbr: 'ARC' },
  { id: 'NVI', name: 'Nova Versão Internacional', abbr: 'NVI' },
  { id: 'ACF', name: 'Almeida Corrigida Fiel', abbr: 'ACF' },
  { id: 'NAA', name: 'Nova Almeida Atualizada', abbr: 'NAA' },
  { id: 'NTLH', name: 'Nova Tradução na Linguagem de Hoje', abbr: 'NTLH' },
];

const VERSIONED_VERSES: Record<string, { reference: string; text: string }> = {
  ARC: {
    reference: 'João 3:16 (ARC)',
    text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
  },
  NVI: {
    reference: 'João 3:16 (NVI)',
    text: '"Porque Deus amou o mundo de tal forma que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna."',
  },
  ACF: {
    reference: 'João 3:16 (ACF)',
    text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
  },
  NAA: {
    reference: 'João 3:16 (NAA)',
    text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho Unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
  },
  NTLH: {
    reference: 'João 3:16 (NTLH)',
    text: 'Porque Deus amou o mundo tanto que deu o seu Filho único, para que todo aquele que acreditar nele não morra, mas tenha a vida eterna.',
  },
};

const READING_PLANS = [
  {
    id: 'rp1',
    name: 'Bíblia em 1 Ano',
    description: 'Leia a Bíblia completa em 365 dias',
    duration: '365 dias',
    progress: 35,
    currentReading: 'Números 15-17',
    icon: '📅',
  },
  {
    id: 'rp2',
    name: 'Novo Testamento em 90 Dias',
    description: 'Percorra todo o NT em 3 meses',
    duration: '90 dias',
    progress: 60,
    currentReading: 'Atos 10',
    icon: '⚡',
  },
  {
    id: 'rp3',
    name: 'Salmos e Provérbios',
    description: 'Sabedoria e louvor todos os dias',
    duration: '60 dias',
    progress: 15,
    currentReading: 'Salmos 23',
    icon: '🎵',
  },
  {
    id: 'rp4',
    name: 'Evangelhos',
    description: 'A vida de Jesus nos 4 evangelhos',
    duration: '30 dias',
    progress: 0,
    currentReading: 'Mateus 1',
    icon: '✝️',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type Testimonial = {
  id: string;
  userId: string;
  title: string;
  content: string;
  likes: string[];
  comments: { id: string; userId: string; content: string }[];
  createdAt: Date;
};

type PrayerGroup = {
  id: string;
  name: string;
  description: string;
  members: string[];
  schedule: string;
  topic: string;
  isOnline: boolean;
};

type VolunteerOp = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: { address: string };
  spots: number;
  enrolled: string[];
  organizerName: string;
  date: Date;
};

type Church = {
  id: string;
  name: string;
  denomination: string;
  location: { address: string };
  description: string;
  phone: string;
  schedule: string;
  pastor: string;
  members: number;
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function getUserById(id: string) {
  return MOCK_USERS.find((u) => u.id === id) ?? { id, name: 'Usuário', avatar: 'https://i.pravatar.cc/150?img=0' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChurchesTab({ churches }: { churches: Church[] }) {
  const [selected, setSelected] = useState<Church | null>(null);

  return (
    <div className="space-y-4">
      {selected ? (
        <div className="bg-white rounded-2xl shadow p-5 space-y-3">
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-indigo-600 font-medium flex items-center gap-1"
          >
            ← Voltar
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl">⛪</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                {selected.denomination}
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">{selected.description}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Pastor</p>
              <p className="font-semibold text-gray-900">{selected.pastor}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Membros</p>
              <p className="font-semibold text-gray-900">{selected.members}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="text-gray-500 text-xs mb-1">📍 Endereço</p>
            <p className="font-medium text-gray-900">{selected.location.address}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="text-gray-500 text-xs mb-1">🕐 Cultos</p>
            <p className="font-medium text-gray-900">{selected.schedule}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="text-gray-500 text-xs mb-1">📞 Telefone</p>
            <p className="font-medium text-gray-900">{selected.phone}</p>
          </div>
          <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition">
            Entrar em Contato
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Buscar igrejas..."
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          {churches.map((church) => (
            <button
              key={church.id}
              onClick={() => setSelected(church)}
              className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">⛪</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm">{church.name}</h3>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      {church.denomination}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {church.location.address}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{church.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>👤 {church.pastor}</span>
                    <span>👥 {church.members} membros</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function PrayerGroupsTab({
  groups,
  joinedGroups,
  onJoin,
}: {
  groups: PrayerGroup[];
  joinedGroups: string[];
  onJoin: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <button className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-2xl text-sm font-medium hover:bg-indigo-50 transition">
        + Criar Novo Grupo de Oração
      </button>
      {groups.map((group) => {
        const joined = joinedGroups.includes(group.id) || group.members.includes(CURRENT_USER.id);
        return (
          <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{group.name}</h3>
                  {group.isOnline && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Online</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>🕐 {group.schedule}</span>
                  <span>🏷️ {group.topic}</span>
                  <span>👥 {group.members.length}</span>
                </div>
              </div>
              <button
                onClick={() => onJoin(group.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  joined
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {joined ? 'Participando' : 'Entrar'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TestimonialsTab({
  testimonials,
  onLike,
  onAdd,
}: {
  testimonials: Testimonial[];
  onLike: (id: string) => void;
  onAdd: (t: { title: string; content: string }) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAdd({ title: newTitle.trim(), content: newContent.trim() });
    setNewTitle('');
    setNewContent('');
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm((v) => !v)}
        className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-2xl text-sm font-medium hover:bg-purple-50 transition"
      >
        + Compartilhar Testemunho
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h4 className="font-bold text-gray-900">Novo Testemunho</h4>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título do testemunho"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Conte o que Deus fez em sua vida..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
            >
              Compartilhar
            </button>
          </div>
        </form>
      )}

      {testimonials.map((t) => {
        const author = getUserById(t.userId);
        const liked = t.likes.includes(CURRENT_USER.id);
        return (
          <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{author.name}</p>
                <p className="text-xs text-gray-500">
                  {t.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <h3 className="font-bold text-gray-900">🙌 {t.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{t.content}</p>
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={() => onLike(t.id)}
                className={`flex items-center gap-1.5 text-sm font-medium transition ${
                  liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'
                }`}
              >
                {liked ? '❤️' : '🤍'} {t.likes.length}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-500 transition">
                💬 {t.comments.length}
              </button>
            </div>
            {t.comments.length > 0 && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                {t.comments.map((c) => {
                  const cu = getUserById(c.userId);
                  return (
                    <div key={c.id} className="flex items-start gap-2">
                      <img src={cu.avatar} alt={cu.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      <div className="bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 flex-1">{c.content}</div>
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

function VolunteerTab({
  opportunities,
  enrolledIds,
  onEnroll,
}: {
  opportunities: VolunteerOp[];
  enrolledIds: string[];
  onEnroll: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {opportunities.map((op) => {
        const isEnrolled = enrolledIds.includes(op.id) || op.enrolled.includes(CURRENT_USER.id);
        const spotsLeft = op.spots - op.enrolled.length;
        return (
          <div key={op.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900">{op.title}</h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {op.category}
                </span>
              </div>
              <div className="text-right text-xs text-gray-500 flex-shrink-0">
                <p className="font-semibold text-gray-900">
                  {op.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{op.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span>📍 {op.location.address}</span>
              <span>🏢 {op.organizerName}</span>
              <span className={spotsLeft <= 2 ? 'text-rose-500 font-semibold' : ''}>
                🎟️ {spotsLeft} vagas restantes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-amber-400 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (op.enrolled.length / op.spots) * 100)}%` }}
                />
              </div>
              <button
                onClick={() => onEnroll(op.id)}
                disabled={isEnrolled}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  isEnrolled
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {isEnrolled ? '✓ Inscrito' : 'Inscrever-se'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BibleTab() {
  const todayIndex = new Date().getDay();
  const dailyVerse = DAILY_VERSES[todayIndex % DAILY_VERSES.length];

  const [selectedVersion, setSelectedVersion] = useState('ARC');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'verse' | 'books' | 'plans' | 'version'>('verse');

  const currentBook = BIBLE_BOOKS.find((b) => b.name === selectedBook);
  const versionVerse = VERSIONED_VERSES[selectedVersion] ?? VERSIONED_VERSES['ARC'];

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(
          [
            { id: 'verse', label: '📖 Versículo do Dia' },
            { id: 'books', label: '📚 Livros' },
            { id: 'plans', label: '📅 Planos' },
            { id: 'version', label: '🔄 Versão' },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeSection === s.id
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Versículo do Dia */}
      {activeSection === 'verse' && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☀️</span>
            <div>
              <p className="font-bold text-amber-800 text-sm">Versículo do Dia</p>
              <p className="text-xs text-amber-600">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
            </div>
          </div>
          <blockquote className="text-gray-800 text-base leading-relaxed italic">
            "{dailyVerse.text}"
          </blockquote>
          <p className="text-amber-700 font-bold text-sm">— {dailyVerse.reference}</p>
          <span className="inline-block text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
            {dailyVerse.theme}
          </span>
          <div className="flex gap-2 pt-2">
            <button className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition">
              📤 Compartilhar
            </button>
            <button className="flex-1 py-2 border border-amber-300 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-50 transition">
              🔖 Favoritar
            </button>
          </div>
        </div>
      )}

      {/* Versão atual */}
      {activeSection === 'verse' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">Versão selecionada</p>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              {selectedVersion}
            </span>
          </div>
          <blockquote className="text-sm text-gray-700 italic leading-relaxed">"{versionVerse.text}"</blockquote>
          <p className="text-xs text-indigo-600 font-semibold">{versionVerse.reference}</p>
        </div>
      )}

      {/* Books */}
      {activeSection === 'books' && (
        <div className="space-y-3">
          {selectedBook && currentBook ? (
            <div className="space-y-3">
              <button
                onClick={() => { setSelectedBook(null); setSelectedChapter(null); }}
                className="text-sm text-indigo-600 font-medium flex items-center gap-1"
              >
                ← Voltar aos Livros
              </button>
              {selectedChapter ? (
                <div className="bg-white rounded-2xl shadow p-5 space-y-3">
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className="text-sm text-indigo-600 font-medium flex items-center gap-1"
                  >
                    ← Capítulos de {selectedBook}
                  </button>
                  <h3 className="font-bold text-gray-900">
                    {selectedBook} — Capítulo {selectedChapter}
                  </h3>
                  <p className="text-sm text-gray-500 italic">
                    (Conteúdo do capítulo seria carregado de uma API Bíblica)
                  </p>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedBook} {selectedChapter}:1 — "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus..."
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900">
                    {selectedBook} — {currentBook.chapters} capítulos
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setSelectedChapter(ch)}
                        className="py-2 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-sm font-medium transition"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <h4 className="font-bold text-gray-700 text-sm">Antigo Testamento</h4>
              <div className="grid grid-cols-2 gap-2">
                {BIBLE_BOOKS.filter((b) => b.testament === 'AT').map((book) => (
                  <button
                    key={book.name}
                    onClick={() => setSelectedBook(book.name)}
                    className="text-left bg-white border border-gray-100 rounded-xl px-3 py-2 hover:border-indigo-300 hover:bg-indigo-50 transition"
                  >
                    <p className="text-sm font-medium text-gray-800">{book.name}</p>
                    <p className="text-xs text-gray-400">{book.chapters} cap.</p>
                  </button>
                ))}
              </div>
              <h4 className="font-bold text-gray-700 text-sm mt-2">Novo Testamento</h4>
              <div className="grid grid-cols-2 gap-2">
                {BIBLE_BOOKS.filter((b) => b.testament === 'NT').map((book) => (
                  <button
                    key={book.name}
                    onClick={() => setSelectedBook(book.name)}
                    className="text-left bg-white border border-gray-100 rounded-xl px-3 py-2 hover:border-indigo-300 hover:bg-indigo-50 transition"
                  >
                    <p className="text-sm font-medium text-gray-800">{book.name}</p>
                    <p className="text-xs text-gray-400">{book.chapters} cap.</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reading Plans */}
      {activeSection === 'plans' && (
        <div className="space-y-3">
          {READING_PLANS.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{plan.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900">{plan.name}</h4>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                  <p className="text-xs text-indigo-600 font-medium mt-1">⏱️ {plan.duration}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progresso</span>
                  <span className="font-semibold">{plan.progress}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Leitura atual: <span className="font-semibold text-gray-700">{plan.currentReading}</span>
                </p>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition">
                  {plan.progress > 0 ? 'Continuar' : 'Iniciar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Version Picker */}
      {activeSection === 'version' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium mb-3">Selecione a versão da Bíblia:</p>
          {BIBLE_VERSIONS.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVersion(v.id)}
              className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                selectedVersion === v.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div>
                <p className="font-bold text-gray-900 text-sm">{v.abbr}</p>
                <p className="text-xs text-gray-500">{v.name}</p>
              </div>
              {selectedVersion === v.id && <span className="text-indigo-600 text-lg">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Samaritan Alert Modal ────────────────────────────────────────────────────
function SamaritanModal({ onClose }: { onClose: () => void }) {
  const [alertType, setAlertType] = useState<'urgency' | 'prayer' | 'practical_help'>('prayer');
  const [description, setDescription] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // no-op for now — just close
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">🆘 Alerta Samaritano</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>
        <p className="text-sm text-gray-500">Solicite ajuda da sua comunidade de forma anônima.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Necessidade</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: 'urgency', label: '🚨 Urgência' },
                  { value: 'prayer', label: '🙏 Oração' },
                  { value: 'practical_help', label: '🤝 Ajuda Prática' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAlertType(opt.value)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition ${
                    alertType === opt.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva sua necessidade..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition"
          >
            Enviar Alerta
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'churches',   label: '⛪ Igrejas' },
  { id: 'prayer',     label: '🙏 Oração' },
  { id: 'testimonials', label: '🙌 Testemunhos' },
  { id: 'volunteer',  label: '🤝 Voluntário' },
  { id: 'bible',      label: '📖 Bíblia' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabId>('churches');
  const [showSamaritanModal, setShowSamaritanModal] = useState(false);

  // Prayer groups
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  function handleJoinGroup(id: string) {
    setJoinedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  // Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>(MOCK_TESTIMONIALS);
  function handleLike(id: string) {
    setTestimonials((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const liked = t.likes.includes(CURRENT_USER.id);
        return {
          ...t,
          likes: liked
            ? t.likes.filter((uid) => uid !== CURRENT_USER.id)
            : [...t.likes, CURRENT_USER.id],
        };
      })
    );
  }
  function handleAddTestimonial({ title, content }: { title: string; content: string }) {
    const newT: Testimonial = {
      id: `t${Date.now()}`,
      userId: CURRENT_USER.id,
      title,
      content,
      likes: [],
      comments: [],
      createdAt: new Date(),
    };
    setTestimonials((prev) => [newT, ...prev]);
  }

  // Volunteer
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  function handleEnroll(id: string) {
    setEnrolledIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-indigo-900">Comunidade</h1>
              <p className="text-xs text-gray-500">Conecte-se, ore e sirva</p>
            </div>
            <button
              onClick={() => setShowSamaritanModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition shadow"
            >
              🆘 Alerta
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        {activeTab === 'churches' && <ChurchesTab churches={MOCK_CHURCHES} />}
        {activeTab === 'prayer' && (
          <PrayerGroupsTab
            groups={MOCK_PRAYER_GROUPS}
            joinedGroups={joinedGroups}
            onJoin={handleJoinGroup}
          />
        )}
        {activeTab === 'testimonials' && (
          <TestimonialsTab
            testimonials={testimonials}
            onLike={handleLike}
            onAdd={handleAddTestimonial}
          />
        )}
        {activeTab === 'volunteer' && (
          <VolunteerTab
            opportunities={MOCK_VOLUNTEER}
            enrolledIds={enrolledIds}
            onEnroll={handleEnroll}
          />
        )}
        {activeTab === 'bible' && <BibleTab />}
      </div>

      {/* Samaritan Modal */}
      {showSamaritanModal && (
        <SamaritanModal onClose={() => setShowSamaritanModal(false)} />
      )}

      <BottomNav />
    </div>
  );
}
