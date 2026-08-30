import { useState, useEffect } from 'react';
import { BookOpen, Search, Clock, Loader2, Volume2, Link as LinkIcon, Trash2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Phonetic {
  text: string;
  audio: string;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface WordData {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  sourceUrls: string[];
}

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// ─── SearchBar ────────────────────────────────────────────────────────────────

function SearchBar({
  value,
  onChange,
  onSearch,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: (word: string) => void;
  loading: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for any word..."
          disabled={loading}
          className="w-full pl-12 pr-24 py-4 bg-gray-800 text-white text-lg rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}

// ─── WordDefinition ───────────────────────────────────────────────────────────

function WordDefinition({ wordData }: { wordData: WordData }) {
  const [playingAudio, setPlayingAudio] = useState(false);

  const playPronunciation = () => {
    const audioUrl = wordData.phonetics.find((p) => p.audio)?.audio;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setPlayingAudio(true);
      audio.play();
      audio.onended = () => setPlayingAudio(false);
    }
  };

  const hasAudio = wordData.phonetics.some((p) => p.audio);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-5xl font-bold text-white mb-2">{wordData.word}</h2>
            {wordData.phonetic && <p className="text-2xl text-blue-400">{wordData.phonetic}</p>}
          </div>
          {hasAudio && (
            <button
              onClick={playPronunciation}
              disabled={playingAudio}
              className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Volume2 className={`w-6 h-6 ${playingAudio ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {wordData.meanings.map((meaning, i) => (
        <div key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-2xl font-semibold text-white capitalize">{meaning.partOfSpeech}</h3>
          </div>

          <div className="space-y-4">
            {meaning.definitions.map((def, di) => (
              <div key={di} className="pl-4 border-l-2 border-blue-500">
                <p className="text-white text-lg mb-2">{def.definition}</p>
                {def.example && <p className="text-gray-400 italic">"{def.example}"</p>}
                {def.synonyms.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-500 text-sm">Synonyms: </span>
                    <span className="text-green-400 text-sm">{def.synonyms.slice(0, 5).join(', ')}</span>
                  </div>
                )}
                {def.antonyms.length > 0 && (
                  <div className="mt-1">
                    <span className="text-gray-500 text-sm">Antonyms: </span>
                    <span className="text-red-400 text-sm">{def.antonyms.slice(0, 5).join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {meaning.synonyms.length > 0 && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-2">Synonyms</h4>
              <div className="flex flex-wrap gap-2">
                {meaning.synonyms.map((s, si) => (
                  <span key={si} className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}

          {meaning.antonyms.length > 0 && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <h4 className="text-red-400 font-semibold mb-2">Antonyms</h4>
              <div className="flex flex-wrap gap-2">
                {meaning.antonyms.map((a, ai) => (
                  <span key={ai} className="px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-sm">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {wordData.sourceUrls.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            <h4 className="font-semibold text-white">Source</h4>
          </div>
          <a
            href={wordData.sourceUrls[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
          >
            {wordData.sourceUrls[0]}
          </a>
        </div>
      )}
    </div>
  );
}

// ─── SearchHistory ────────────────────────────────────────────────────────────

function SearchHistory({
  history,
  onSelectWord,
  onClearHistory,
}: {
  history: string[];
  onSelectWord: (word: string) => void;
  onClearHistory: () => void;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Search History</h3>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-400 text-sm">Your recent searches will appear here</p>
      ) : (
        <div className="space-y-2">
          {history.map((word, i) => (
            <button
              key={i}
              onClick={() => onSelectWord(word)}
              className="w-full text-left px-4 py-3 bg-gray-900/50 hover:bg-gray-900 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-white capitalize">{word}</span>
                <span className="text-gray-500 text-xs group-hover:text-gray-400">Click to search</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dictionary-history');
    if (saved) setSearchHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('dictionary-history', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const searchWord = async (word: string) => {
    if (!word.trim()) return;
    setLoading(true);
    setError(null);
    setWordData(null);
    try {
      const response = await fetch(`${API_BASE}/${word.toLowerCase()}`);
      if (!response.ok) {
        setError(response.status === 404 ? `No definition found for "${word}"` : 'Something went wrong. Please try again.');
        return;
      }
      const data = await response.json();
      setWordData(data[0]);
      setSearchHistory((prev) => [word.toLowerCase(), ...prev.filter((w) => w.toLowerCase() !== word.toLowerCase())].slice(0, 10));
    } catch (err) {
      setError('Failed to fetch word definition');
      console.error('Dictionary API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (word: string) => {
    setSearchQuery(word);
    searchWord(word);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('dictionary-history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-10 h-10 text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold text-white">WordWise</h1>
              <p className="text-gray-400 text-sm">Your English dictionary companion</p>
            </div>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} loading={loading} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin mb-4" />
                <p className="text-white text-lg">Looking up "{searchQuery}"...</p>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
                <p className="text-red-400 text-lg mb-2">{error}</p>
                <p className="text-gray-400 text-sm">Try checking the spelling or search for a different word</p>
              </div>
            )}

            {wordData && !loading && <WordDefinition wordData={wordData} />}

            {!wordData && !loading && !error && (
              <div className="text-center py-20">
                <Search className="w-24 h-24 text-blue-400 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-white mb-4">Search for a word</h2>
                <p className="text-gray-400 mb-8">
                  Enter any English word to see its definition, pronunciation, synonyms, and more
                </p>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-white font-semibold mb-3">Try searching for:</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['eloquent', 'serendipity', 'ephemeral', 'resilience', 'paradigm'].map((word) => (
                      <button
                        key={word}
                        onClick={() => handleSearch(word)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <SearchHistory history={searchHistory} onSelectWord={handleSearch} onClearHistory={clearHistory} />
          </div>
        </div>
      </main>
    </div>
  );
}
