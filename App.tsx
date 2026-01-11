import React, { useEffect, useRef, useState } from 'react';

// --- DADOS E TIPOS ---

interface Question {
  id: string;
  label: string;
  subLabel?: string;
  type: 'text' | 'tel' | 'email' | 'select'; // Adicionado 'select'
  placeholder?: string;
  options?: string[]; // Opções para múltipla escolha
}

interface Country {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

// Lista expandida de países (Principais e Lusófonos)
const countries: Country[] = [
  { code: 'BR', name: 'Brasil', dial_code: '+55', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', dial_code: '+1', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', dial_code: '+351', flag: '🇵🇹' },
  { code: 'AO', name: 'Angola', dial_code: '+244', flag: '🇦🇴' },
  { code: 'MZ', name: 'Moçambique', dial_code: '+258', flag: '🇲🇿' },
  { code: 'ES', name: 'Espanha', dial_code: '+34', flag: '🇪🇸' },
  { code: 'FR', name: 'França', dial_code: '+33', flag: '🇫🇷' },
  { code: 'GB', name: 'Reino Unido', dial_code: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemanha', dial_code: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', dial_code: '+39', flag: '🇮🇹' },
  { code: 'AR', name: 'Argentina', dial_code: '+54', flag: '🇦🇷' },
  { code: 'UY', name: 'Uruguai', dial_code: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', dial_code: '+595', flag: '🇵🇾' },
  { code: 'CL', name: 'Chile', dial_code: '+56', flag: '🇨🇱' },
  { code: 'CA', name: 'Canadá', dial_code: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Austrália', dial_code: '+61', flag: '🇦🇺' },
  { code: 'JP', name: 'Japão', dial_code: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dial_code: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'Índia', dial_code: '+91', flag: '🇮🇳' },
  { code: 'MX', name: 'México', dial_code: '+52', flag: '🇲🇽' },
];

const questions: Question[] = [
  { 
    id: 'nome', 
    label: 'Nome*', 
    type: 'text', 
    placeholder: 'Digite sua resposta aqui...' 
  },
  { 
    id: 'telefone', 
    label: 'Telefone*', 
    type: 'tel', 
    placeholder: '(DDD) 99999-9999' 
  },
  { 
    id: 'email', 
    label: 'E-mail*', 
    type: 'email', 
    placeholder: 'name@example.com' 
  },
  { 
    id: 'instagram', 
    label: 'Qual seu @ do Instagram?*', 
    subLabel: 'Ex: @soupedrolaterza',
    type: 'text', 
    placeholder: 'Digite sua resposta aqui...' 
  },
  // Novas perguntas de Múltipla Escolha
  {
    id: 'infoprodutos',
    label: 'Quantos infoprodutos você tem hoje?*',
    type: 'select',
    options: [
      '0 infoprodutos',
      '1 infoproduto',
      '2 ou mais infoprodutos'
    ]
  },
  {
    id: 'assessoria',
    label: 'Você tem assessoria atualmente?*',
    type: 'select',
    options: [
      'Não, não possuo assessoria',
      'Sim, já possuo assessoria'
    ]
  },
  {
    id: 'comecar_vender',
    label: 'Quando você pretende começar a vender para sua audiência?*',
    type: 'select',
    options: [
      'O mais breve possível',
      'Ainda este mês',
      'Ainda não sei'
    ]
  }
];

// --- COMPONENTE PRINCIPAL ---

const App: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  
  // 0 = Intro
  // 1...N = Perguntas
  // N + 1 = Success
  const [currentStep, setCurrentStep] = useState(0); 
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  
  // Estado específico para telefone
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [showCountryList, setShowCountryList] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Efeito de movimento do mouse no grid
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gridRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        gridRef.current.style.maskImage = `radial-gradient(circle at ${x}px ${y}px, black, transparent 60%)`;
        gridRef.current.style.webkitMaskImage = `radial-gradient(circle at ${x}px ${y}px, black, transparent 60%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Foco automático no campo de busca de país
  useEffect(() => {
    if (showCountryList && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showCountryList]);

  // Gerenciamento de foco e recuperação de dados
  useEffect(() => {
    // Apenas tenta focar ou recuperar dados se estivermos nas etapas de pergunta
    if (currentStep > 0 && currentStep <= questions.length) {
      const questionIndex = currentStep - 1;
      const question = questions[questionIndex];

      // Se não for pergunta de seleção, foca no input
      if (question.type !== 'select') {
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 100);
      }
      
      const key = question.id;
      // Se for telefone, remove o DDI visualmente para edição
      let savedValue = formData[key] || '';
      if (question.type === 'tel' && savedValue.startsWith(selectedCountry.dial_code)) {
         savedValue = savedValue.replace(selectedCountry.dial_code, '').trim();
      }
      setInputValue(savedValue);
    }
  }, [currentStep, formData, selectedCountry.dial_code]);

  // Formatação de Telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número

    if (selectedCountry.code === 'BR') {
      // Máscara Brasil: (XX) XXXXX-XXXX
      if (value.length > 11) value = value.slice(0, 11);
      
      if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      }
      if (value.length > 9) { // (XX) XXXXX
        value = `${value.slice(0, 10)}-${value.slice(10)}`;
      }
    } else {
      // Formatação genérica simples
      if (value.length > 15) value = value.slice(0, 15);
    }
    
    setInputValue(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = currentStep - 1;
    if (index >= 0 && questions[index] && questions[index].type === 'tel') {
      handlePhoneChange(e);
    } else {
      setInputValue(e.target.value);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryList(false);
    setCountrySearch('');
    setInputValue(''); // Limpa input ao trocar país
    if (inputRef.current) inputRef.current.focus();
  };

  // Filtragem de países
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.dial_code.includes(countrySearch)
  );

  const handleNext = (overrideValue?: string) => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    const valueToSubmit = overrideValue !== undefined ? overrideValue : inputValue;
    if (!valueToSubmit || !valueToSubmit.trim()) return;

    const questionIndex = currentStep - 1;
    const currentQuestion = questions[questionIndex];
    
    // Se for telefone, salvamos com o DDI
    let finalValue = valueToSubmit;
    if (currentQuestion.type === 'tel') {
       finalValue = `${selectedCountry.dial_code} ${valueToSubmit}`;
    }

    const newFormData = { ...formData, [currentQuestion.id]: finalValue };
    setFormData(newFormData);

    if (questionIndex < questions.length - 1) {
      // Próxima pergunta
      setCurrentStep(prev => prev + 1);
      setInputValue('');
    } else {
      // Última pergunta -> Construir mensagem e enviar para WhatsApp
      
      const title = "Growth Partner inscrição";
      
      // Cria o corpo da mensagem iterando sobre as perguntas e pegando as respostas
      const messageBody = questions.map(q => {
        // Pega a resposta do novo objeto newFormData
        const answer = newFormData[q.id];
        // Formata: Pergunta em negrito (usando asteriscos do WhatsApp) e resposta abaixo
        return `*${q.label}*\n${answer}`;
      }).join('\n\n'); // Duas quebras de linha entre cada bloco

      const fullMessage = `*${title}*\n\n${messageBody}`;
      
      // Número de destino: 55 11 988600997
      const phoneNumber = "5511988600997";
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fullMessage)}`;
      
      // Abre o WhatsApp
      window.open(whatsappUrl, '_blank');

      // Avança para tela de sucesso
      setCurrentStep(prev => prev + 1); 
    }
  };

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    // Avanço automático sutil
    setTimeout(() => {
      handleNext(option);
    }, 250);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  // Renderização da Tela de Boas-vindas
  const renderWelcome = () => (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto">
      <h1 className="font-serif text-3xl md:text-4xl text-ink mb-6 animate-blurIn">Pedro L - Growth Partner</h1>
      
      <div className="font-sans text-sm md:text-base text-ink/80 leading-relaxed space-y-4 mb-10 text-left md:text-center px-2 animate-blurIn" style={{ animationDelay: '0.2s' }}>
        <p>
          Construímos a máquina de vendas para criadores, experts e influenciadores.
        </p>
        <p>
          Não somos uma agência de marketing nem prestadores de serviços. Mas sim sócios de crescimento do seu negócio.
        </p>
        <p>
          Te ajudamos a elevar sua autoridade com produtos que atraem e vendem no automático.
        </p>
        <p>
          Sem mensalidades, R$0 custo inicial. Você ganha, nós ganhamos!
        </p>
        <p className="font-medium text-white">
          Faça a sua aplicação e veja como podemos ajudar você.
        </p>
      </div>

      <button 
        onClick={() => handleNext()}
        className="w-full md:w-auto bg-gold text-white font-serif text-lg py-3 px-12 rounded-[4px] hover:bg-[#b08d4b] transition-colors shadow-lg animate-slideUpFade"
        style={{ animationDelay: '0.4s' }}
      >
        Vamos
      </button>
    </div>
  );

  // Renderização da Tela de Sucesso
  const renderSuccess = () => (
    <div className="flex flex-col items-center text-center animate-slideUpFade max-w-xl mx-auto px-4">
      <h2 className="font-serif text-2xl md:text-4xl text-white mb-10 leading-snug">
        Muito obrigado, entraremos em contato em breve!
      </h2>
      
      <div className="text-ink font-serif text-lg md:text-xl leading-relaxed">
        <p>Um abraço,</p>
        <p>Pedro Laterza.</p>
      </div>
    </div>
  );

  // Renderização dos inputs (Texto ou Telefone)
  const renderInput = (question: Question, isPhone: boolean) => (
    <div className="relative group">
      {/* Seção do Telefone (Dropdown e Prefixo) */}
      {isPhone && (
        <div className="absolute left-0 bottom-3 flex items-center z-20">
          {/* Botão da Bandeira */}
          <button 
            type="button"
            onClick={() => setShowCountryList(!showCountryList)}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 p-1.5 rounded transition mr-2 border border-white/5"
          >
            <span className="text-xl leading-none">{selectedCountry.flag}</span>
            <span className="text-[10px] text-white/50">▼</span>
          </button>

          {/* Prefixo (DDI) */}
          <span className="text-lg md:text-xl text-white/60 font-sans mr-2">
            {selectedCountry.dial_code}
          </span>

          {/* Lista de Países (Dropdown com Busca) */}
          {showCountryList && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[#0d1f29] border border-white/10 rounded-md shadow-2xl overflow-hidden animate-slideUpFade">
              {/* Campo de Busca */}
              <div className="p-2 border-b border-white/10 sticky top-0 bg-[#0d1f29] z-10">
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Pesquisar países..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full bg-black/20 text-white text-sm px-3 py-2 rounded border border-white/10 focus:border-gold outline-none"
                />
              </div>
              
              {/* Lista */}
              <div className="max-h-60 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition border-b border-white/5 last:border-0"
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-sm text-ink font-sans flex-1">{country.name}</span>
                      <span className="text-xs text-gold font-mono">{country.dial_code}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-white/40">Nenhum país encontrado</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      <input
        ref={inputRef}
        id="input-field"
        type={isPhone ? 'text' : question.type} 
        inputMode={isPhone ? 'numeric' : 'text'}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={isPhone ? '(99) 99999-9999' : question.placeholder}
        className={`
          w-full bg-transparent border-b border-thread py-3 text-lg md:text-xl text-white outline-none 
          transition-all duration-300 focus:border-white placeholder:text-white/20 font-sans
          ${isPhone ? 'pl-[100px] md:pl-[110px]' : ''}
        `}
        autoComplete="off"
      />
      
      {/* Fundo para fechar dropdown */}
      {showCountryList && (
        <div 
          className="fixed inset-0 z-10 bg-transparent" 
          onClick={() => setShowCountryList(false)}
        />
      )}
    </div>
  );

  // Renderização das Opções de Múltipla Escolha
  const renderOptions = (question: Question) => (
    <div className="flex flex-col gap-3 mt-4">
      {question.options?.map((option, idx) => {
        const letter = String.fromCharCode(65 + idx); // A, B, C...
        const isSelected = inputValue === option;
        
        return (
          <button
            key={idx}
            onClick={() => handleOptionSelect(option)}
            className={`
              group flex items-center gap-4 w-full p-3 rounded-[4px] border transition-all duration-200 text-left
              ${isSelected 
                ? 'bg-white/5 border-white' 
                : 'bg-[#102028] border-thread hover:bg-[#162a33] hover:border-gold/50'}
            `}
          >
            {/* Caixa da Letra */}
            <div className={`
              w-7 h-7 flex items-center justify-center rounded-[3px] text-xs font-mono border transition-colors
              ${isSelected 
                ? 'bg-white text-canvas border-white font-bold' 
                : 'bg-transparent text-white/60 border-white/20 group-hover:border-gold group-hover:text-gold'}
            `}>
              {letter}
            </div>
            
            {/* Texto da Opção */}
            <span className={`font-sans text-base md:text-lg ${isSelected ? 'text-white' : 'text-ink'}`}>
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Renderização Principal da Pergunta
  const renderQuestion = () => {
    const index = currentStep - 1;
    const question = questions[index];
    const isPhone = question.type === 'tel';
    const isSelect = question.type === 'select';

    return (
      <div className="flex flex-col w-full max-w-lg mx-auto animate-slideUpFade">
        
        {/* Indicador de Passo */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white text-canvas font-mono text-xs font-bold w-6 h-6 flex items-center justify-center rounded-[2px]">
            {currentStep}
          </div>
          <span className="text-white/30 text-xs font-mono">
            / {questions.length}
          </span>
        </div>

        {/* Pergunta */}
        <label htmlFor="input-field" className="font-serif text-xl md:text-2xl text-ink mb-2 block leading-snug">
          {question.label}
        </label>

        {/* Subtítulo (se houver) */}
        {question.subLabel && (
          <p className="font-sans text-sm text-gold/80 mb-6 italic">
            {question.subLabel}
          </p>
        )}
        {!question.subLabel && !isSelect && <div className="mb-8" />}

        {/* Conteúdo Variável (Input ou Opções) */}
        {isSelect ? renderOptions(question) : renderInput(question, isPhone)}

        {/* Ações / Botões */}
        <div className="mt-12 flex gap-3">
            {/* Botão Voltar */}
            <button 
              onClick={handleBack}
              className="bg-gold hover:bg-[#b08d4b] text-white w-12 h-12 flex items-center justify-center rounded-[4px] transition-colors"
              aria-label="Voltar"
            >
              <span className="font-mono text-lg">{'<'}</span>
            </button>

            {/* Botão OK (apenas se não for seleção automática ou para confirmar) */}
            <button 
              onClick={() => handleNext()}
              className="flex-1 bg-gold hover:bg-[#b08d4b] text-white font-bold font-serif text-lg h-12 rounded-[4px] transition-colors shadow-lg flex items-center justify-center"
            >
              OK <span className="ml-2 text-xs font-sans font-normal opacity-70 hidden md:inline">press Enter ↵</span>
            </button>
        </div>
      </div>
    );
  };

  // Barra de progresso
  // Se estiver na tela de sucesso (currentStep > questions.length), progresso é 100%
  const isFinished = currentStep > questions.length;
  const progress = currentStep === 0 ? 0 : isFinished ? 100 : (currentStep / questions.length) * 100;

  // Lógica de Renderização Principal
  const renderContent = () => {
    if (currentStep === 0) return renderWelcome();
    if (currentStep > questions.length) return renderSuccess();
    return renderQuestion();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center text-ink selection:bg-gold selection:text-white overflow-hidden bg-canvas">
      
      {/* --- BACKGROUND LAYERS --- */}
      <svg className="hidden">
        <filter id="linen-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.3" />
            <feFuncG type="linear" slope="0.3" />
            <feFuncB type="linear" slope="0.3" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </svg>

      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-50 opacity-20 mix-blend-overlay"
        style={{ filter: 'url(#linen-grain) contrast(120%) brightness(100%)' }}
      />

      <div 
        ref={gridRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #162a33 1px, transparent 1px),
            linear-gradient(to bottom, #162a33 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)',
        }}
      />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="relative z-10 w-full max-w-2xl mx-auto p-6 md:p-12 flex flex-col min-h-[60vh] justify-center">
        {renderContent()}
      </main>

      {/* Barra de Progresso Superior */}
      {currentStep > 0 && !isFinished && (
        <div className="fixed top-0 left-0 h-1 bg-thread w-full z-20">
          <div 
            className="h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

    </div>
  );
};

export default App;