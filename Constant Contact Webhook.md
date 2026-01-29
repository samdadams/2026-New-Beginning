<div id="wishing-well-app-root"></div>

<script src="https://cdn.tailwindcss.com"></script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    
    #wishing-well-app-root {
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif !important;
        background-color: transparent;
        color: #444;
    }
    
    .font-serif { font-family: 'Playfair Display', serif !important; }
    
    /* Smooth Animations */
    .animate-enter { animation: enter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    @keyframes enter {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .7; }
    }
</style>

<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<script type="text/babel">
const { useState, useEffect } = React;

const QUESTIONS = [
  {
    id: 1,
    question: "What is the main signal your body has been sending you lately?",
    options: [
      { id: 'A', text: "Persistent stiffness or joint restrictions." },
      { id: 'B', text: "Racing thoughts or inability to switch off." },
      { id: 'C', text: "A heavy heart or unexplained sadness." },
      { id: 'D', text: "Visible signs of aging or dull skin." },
      { id: 'E', text: "Feeling disconnected from your purpose." },
    ]
  },
  {
    id: 2,
    question: "How does this challenge show up in your day-to-day?",
    options: [
      { id: 'A', text: "I have trouble moving freely." },
      { id: 'B', text: "I feel reactive to small things." },
      { id: 'C', text: "I feel stuck in the past or drained." },
      { id: 'D', text: "I feel insecure about my appearance." },
      { id: 'E', text: "I'm just 'going through the motions'." },
    ]
  },
  {
    id: 3,
    question: "When you first wake up, how do you honestly feel?",
    options: [
      { id: 'A', text: "Achey and rigid." },
      { id: 'B', text: "Mind racing immediately." },
      { id: 'C', text: "A weight on my chest." },
      { id: 'D', text: "Puffy or tired-looking." },
      { id: 'E', text: "Uninspired or wanting to stay in bed." },
    ]
  },
  {
    id: 4,
    question: "What feels like your biggest block right now?",
    options: [
      { id: 'A', text: "My physical structure." },
      { id: 'B', text: "My overactive nervous system." },
      { id: 'C', text: "Old emotional wounds." },
      { id: 'D', text: "Physical signs of stress." },
      { id: 'E', text: "A lack of energetic clarity." },
    ]
  },
  {
    id: 5,
    question: "If you could change one thing instantly, what would it be?",
    options: [
      { id: 'A', text: "To be pain-free and flexible." },
      { id: 'B', text: "To have a calm, silent mind." },
      { id: 'C', text: "To feel light and emotionally free." },
      { id: 'D', text: "To look radiant and youthful." },
      { id: 'E', text: "To feel deeply intuitive." },
    ]
  },
  {
    id: 6,
    question: "Are you open to using sound & light technology to accelerate healing?",
    options: [
      { id: 'YES', text: "Yes, I want modern relief." },
      { id: 'NO', text: "No, I prefer manual approaches." },
    ]
  }
];

const AssessmentApp = () => {
  const [step, setStep] = useState('intro'); // intro, questions, email, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const calculateResult = (finalAnswers) => {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (let i = 1; i <= 5; i++) {
      const ans = finalAnswers[i];
      if (ans && counts[ans] !== undefined) counts[ans]++;
    }
    let winner = 'A';
    let max = 0;
    Object.keys(counts).forEach(k => { if(counts[k] > max) { max = counts[k]; winner = k; } });

    const isTechOpen = finalAnswers[6] === 'YES';
    const mapping = {
      A: { title: "Quantum Body Sculpting", desc: "Your frame is seeking balance.", course: "Body Sculpting Workshop", url: "https://thewishingwellacademy.com/qbsc/", practice: { name: "Wall Grounding Reset", steps: "Stand with your back against a wall. Breathe low into the belly for 5 breaths. Imagine your spine lengthening." } },
      B: { title: "Clinical Hypnotherapy", desc: "Your nervous system requires a profound quiet.", course: "Private Hypnotherapy", url: "https://thewishingwellacademy.com/therapies/", practice: { name: "Orienting Breath", steps: "Inhale for 4, exhale for 6, five times. Look around and name 5 quiet details." } },
      C: { title: "Regression & Trauma Release", desc: "You are ready to set down the emotional density of the past.", course: "Trauma Release Workshop", url: "https://thewishingwellacademy.com/therapies/", practice: { name: "Hand on Heart Unsent Truth", steps: "Place one hand on your heart, one on your lower belly. Whisper: 'The truth I have not let myself feel is...' 3 times. Feel it for 10 seconds." } },
      D: { title: "Quantum Facelift", desc: "Your vitality is blocked at the cellular level.", course: "Quantum Facelift Workshop", url: "https://thewishingwellacademy.com/qfl/", practice: { name: "Face Softening", steps: "Unclench teeth. Let the eyes soften. Inhale, lift checks. Exhale, let the forehead widen." } },
      E: { title: "Intuitive Workshops", desc: "Your soul is calling for deeper connection.", course: "Academy Workshops", url: "https://thewishingwellacademy.com/workshops/", practice: { name: "Cord and Container", steps: "Imagine a root from your tailbone. Imagine a soft container around you. Say 'I am here' on 6 exhales." } }
    };

    if (isTechOpen && (winner === 'A' || winner === 'B')) {
       return { title: "Zero Point Energy Therapy", desc: "Advanced light frequencies are your fastest route.", course: "Zero Point Energy Machine", url: "https://thewishingwellacademy.com/zero-point-energy-machine/", practice: { name: "Coherence Set Point", steps: "Inhale for 5, exhale for 5 for one minute. Remember a moment you felt supported." } };
    }
    return mapping[winner];
  };

  const handleAnswer = (id) => {
    const newAnswers = { ...answers, [currentQuestion + 1]: id };
    setAnswers(newAnswers);
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 150);
    } else {
      setResult(calculateResult(newAnswers));
      setIsAnalyzing(true);
      setTimeout(() => { setIsAnalyzing(false); setStep('email'); }, 1500);
    }
  };

  // --- UPDATED EMAIL SUBMIT FUNCTION ---
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    
    // Check if email is valid first
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      
      // SEND DATA TO MAKE.COM
      // *** REPLACE THE URL BELOW WITH YOUR WEBHOOK URL ***
      fetch("https://hook.us2.make.com/h3pnmjo4ego0qhi5gu6h5dduub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          result_title: result ? result.title : "",
          result_description: result ? result.desc : "",
          recommended_path: result ? result.course : ""
        })
      }).catch((err) => console.log("Webhook error:", err)); // Prevent crash on error
      
      // Move to result step
      setStep('result');
      
    } else {
      setEmailError('Please enter a valid email address.');
    }
  };

  // --- STYLING CONSTANTS ---
  const btnClass = "w-full bg-[#4285F4] text-white h-24 px-8 rounded-[2rem] text-[21px] font-bold transition-all duration-300 transform hover:-translate-y-1 active:scale-95 shadow-xl hover:shadow-[0_20px_40px_rgba(212,175,55,0.4)] hover:bg-[#D4AF37] flex items-center justify-center tracking-wide font-sans";
  
  const textBody = "text-[21px] leading-relaxed font-sans text-stone-600";
  const textSmall = "text-[21px] leading-snug font-sans text-stone-500 italic";
  const textHeading = "text-[32px] md:text-[36px] font-serif font-bold text-stone-900 leading-tight";

  // Card: luxurious shadow, large radius, white background
  const cardClass = "max-w-xl mx-auto bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(66,133,244,0.15)] p-8 md:p-12 border border-white/50 animate-enter relative overflow-hidden";

  return (
    <div className="py-12 px-4">
      {step === 'intro' && (
        <div className={cardClass}>
           <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-white rounded-full flex items-center justify-center mx-auto text-[#4285F4] shadow-inner border border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-stone-900">
                Discover what your <br /><span className="text-[#4285F4] italic">body is asking for</span>
              </h1>
              <p className={textBody}>Answer 6 honest questions to reveal a personalized healing practice and reflection.</p>
              
              <div className="pt-2">
                  <button onClick={() => setStep('questions')} className={btnClass}>Begin Assessment Now</button>
                  <p className="mt-6 text-[14px] text-stone-400 font-bold uppercase tracking-[0.25em]">No diagnosis. No obligation. No Spam. Anonymous. No one will see your answers but you.</p>
              </div>
           </div>
        </div>
      )}

      {step === 'questions' && !isAnalyzing && (
        <div className={cardClass}>
           {/* Progress Bar */}
           <div className="absolute top-0 left-0 w-full h-2 bg-stone-50">
             <div 
               className="h-full bg-gradient-to-r from-blue-300 to-[#4285F4] transition-all duration-700 ease-out" 
               style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
             />
           </div>

           <div className="space-y-8 pt-4">
              <div className="flex justify-between items-end border-b border-stone-100 pb-4">
                 <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#4285F4]">Step {currentQuestion + 1} of 6</span>
                 <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">The Wishing Well Academy</span>
              </div>
              
              <h2 className="text-[34px] font-serif font-bold text-stone-900 leading-tight min-h-[3em] flex items-center">
                 {QUESTIONS[currentQuestion].question}
              </h2>
              
              <div className="grid gap-3">
                 {QUESTIONS[currentQuestion].options.map(opt => (
                   <button 
                     key={opt.id} 
                     onClick={() => handleAnswer(opt.id)} 
                     className="group w-full text-left p-6 rounded-[1.5rem] bg-stone-50 border border-transparent hover:bg-white hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-5"
                   >
                     <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-stone-200 group-hover:border-[#4285F4] flex items-center justify-center transition-colors shadow-sm">
                        <div className="w-4 h-4 rounded-full bg-[#4285F4] opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100" />
                     </span>
                     <span className="text-[21px] font-medium leading-snug text-stone-600 group-hover:text-stone-900 font-sans">{opt.text}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {isAnalyzing && (
         <div className={cardClass}>
            <div className="text-center py-20 space-y-8">
               <div className="relative w-24 h-24 mx-auto">
                   <div className="absolute inset-0 rounded-full border-4 border-stone-100"></div>
                   <div className="absolute inset-0 rounded-full border-4 border-[#4285F4] border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 rounded-full border-4 border-[#4285F4]/30 border-b-transparent animate-pulse"></div>
               </div>
               <div className="space-y-3">
                   <h3 className="text-[30px] font-serif font-bold text-stone-900">Calculating your insight...</h3>
                   <p className="text-sm font-bold uppercase tracking-widest text-stone-400 animate-pulse-slow">Connecting to your frequency</p>
               </div>
            </div>
         </div>
      )}

      {step === 'email' && (
        <div className={cardClass}>
           <form onSubmit={handleEmailSubmit} className="text-center space-y-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-white rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-inner border border-amber-100">
                 <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              
              <div className="space-y-4">
                  <h2 className="text-[40px] font-serif font-bold text-stone-900">Insight Ready</h2>
                  <p className={textBody}>Enter your email to claim your <span className="text-amber-600 font-bold underline decoration-amber-200 decoration-2 underline-offset-4">Free Healing Gift</span> and reveal results.</p>
              </div>

              <div className="space-y-4 pt-4">
                  <div className="relative">
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => { setEmail(e.target.value); setEmailError(''); }} 
                        placeholder="Your primary email" 
                        className="w-full h-24 px-8 rounded-[2rem] border-2 border-stone-100 bg-stone-50 text-[21px] outline-none focus:border-[#4285F4] focus:bg-white focus:ring-4 focus:ring-[#4285F4]/5 transition-all shadow-inner font-sans placeholder:text-stone-300" 
                      />
                  </div>
                  {emailError && <p className="text-red-500 text-left text-[16px] font-bold pl-4 animate-enter">{emailError}</p>}
                  
                  <button type="submit" className={btnClass}>Reveal Results →</button>
                  <p className="text-[13px] text-stone-400 mt-6 leading-relaxed max-w-sm mx-auto">
                    You will receive helpful updates and information exclusive to The Wishing Well Academy. We respect your privacy and never spam.
                  </p>
              </div>
           </form>
        </div>
      )}

      {step === 'result' && result && (
        <div className={cardClass}>
           <div className="space-y-10">
              <div className="text-center space-y-3 border-b border-stone-100 pb-8">
                 <span className="inline-block px-4 py-1 rounded-full bg-blue-50 text-[#4285F4] text-xs font-bold uppercase tracking-widest mb-2">Your Personal Insight</span>
                 <h2 className="text-[42px] font-serif font-bold text-stone-900 leading-none">{result.title}</h2>
                 <p className={textSmall}>"{result.desc}"</p>
              </div>

              {/* Practice Card */}
              <div className="bg-gradient-to-br from-sky-50 to-white p-8 rounded-[2.5rem] border border-sky-100 space-y-4 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-sky-100 rounded-full blur-2xl opacity-50"></div>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#4285F4] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-[24px] font-bold text-stone-800 leading-none font-serif">{result.practice.name}</h3>
                 </div>
                 <div className="bg-white/80 p-6 rounded-[1.5rem] border border-white/50 shadow-sm backdrop-blur-sm">
                    <p className={textBody}>{result.practice.steps}</p>
                 </div>
              </div>

              {/* Heart Bonus */}
              <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-[2.5rem] border border-amber-100 space-y-4 shadow-sm relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-amber-100 rounded-full blur-2xl opacity-50"></div>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <h3 className="text-[24px] font-bold text-stone-800 leading-none font-serif">Heart Healing Bonus</h3>
                 </div>
                 <p className="text-[21px] italic leading-relaxed text-stone-600 border-l-4 border-amber-300 pl-6 py-1 font-serif relative z-10">
                    Place a hand on heart. Inhale 4, exhale 6. Ask: 'What is one thing I can do today that helps my body trust me again?'
                 </p>
              </div>

              {/* Pathway */}
              <div className="bg-stone-50 p-8 rounded-[2.5rem] border border-stone-100 text-center space-y-4">
                 <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Recommended Pathway</p>
                 <h4 className="text-[26px] font-serif font-bold text-stone-800">{result.course}</h4>
                 <button onClick={() => window.open(result.url, '_blank')} className={btnClass}>Explore Pathway Details</button>
              </div>
              
              {/* Premium Bonus */}
              <div className="border-t border-stone-100 pt-8 space-y-6 text-center">
                 <div className="inline-block bg-stone-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-stone-200">Premium Bonus</div>
                 <h4 className="text-[32px] font-serif font-bold text-stone-900 leading-tight">Healing from the Heart Masterclass</h4>
                 <button onClick={() => window.open('https://thewishingwellacademy.com/presentation-gift', '_blank')} className={btnClass}>Watch Masterclass Now</button>
              </div>

              <button onClick={() => { setStep('intro'); setCurrentQuestion(0); }} className="group flex items-center justify-center gap-2 mx-auto text-stone-300 hover:text-stone-500 transition-colors py-2">
                 <span className="text-[12px] font-bold uppercase tracking-[0.3em] group-hover:-translate-x-1 transition-transform">Restart Assessment</span>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('wishing-well-app-root'));
root.render(<AssessmentApp />);
</script>