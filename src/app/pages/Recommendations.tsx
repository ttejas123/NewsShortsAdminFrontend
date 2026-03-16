import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services/api';
import { AdminConfig } from '../types/api';
import { useTheme } from '../context/ThemeContext';

const CONFIG_KEYS = {
  INTERACTION: [
    'user_interest_weight_view',
    'user_interest_weight_like',
    'user_interest_weight_share',
    'user_interest_weight_save'
  ],
  RANKING: [
    'ranking_user_score_weight',
    'ranking_global_score_weight'
  ],
  LIMITS: [
    'ranking_candidate_limit',
    'ranking_result_limit'
  ]
};

const Recommendations: React.FC = () => {
  const [configs, setConfigs] = useState<AdminConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [simulationWeights, setSimulationWeights] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const { darkMode } = useTheme();
  const dm = darkMode;

  // Dark mode standard classes
  const textTitle = dm ? "text-gray-100" : "text-gray-900";
  const textBody = dm ? "text-gray-300" : "text-gray-800";
  const textMuted = dm ? "text-gray-400" : "text-gray-500";
  const cardBg = dm ? "bg-gray-900/70 border-gray-700/80" : "bg-white border-gray-200 shadow-sm";

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await apiClient.getAdminConfigs();
      setConfigs(data);
      const initialWeights: Record<string, number> = {};
      data.forEach(c => {
        initialWeights[c.key] = parseFloat(c.value) || 0;
      });
      setSimulationWeights(initialWeights);
    } catch (err) {
      showToast('Failed to fetch configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleWeightChange = (key: string, value: number) => {
    setSimulationWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      // Update all changed configs
      for (const key in simulationWeights) {
        const original = configs.find(c => c.key === key);
        if (original && parseFloat(original.value) !== simulationWeights[key]) {
          await apiClient.updateAdminConfig({
            key,
            value: simulationWeights[key].toString(),
            description: original.description
          });
        }
      }
      await apiClient.refreshConfigCache();
      await apiClient.recalculateScores();
      showToast('Changes deployed and scores recalculated successfully!', 'success');
      fetchConfigs();
    } catch (err) {
      showToast('Deployment failed', 'error');
    } finally {
      setDeploying(false);
    }
  };

  const renderSlider = (key: string) => {
    const config = configs.find(c => c.key === key);
    const value = simulationWeights[key] ?? 0;
    const isInteraction = CONFIG_KEYS.INTERACTION.includes(key);
    const isRanking = CONFIG_KEYS.RANKING.includes(key);
    const min = 0;
    const max = isInteraction ? 10 : (isRanking ? 1 : 1000);
    const step = isInteraction || isRanking ? 0.1 : 1;

    const isActive = activeStep === key;
    const bg = isActive
      ? (dm ? 'bg-indigo-500/20 border-l-4 border-indigo-500' : 'bg-indigo-50 border-l-4 border-indigo-600')
      : (dm ? 'bg-white/5 border-l-4 border-transparent' : 'bg-gray-100 border-l-4 border-transparent');

    return (
      <div 
        key={key} 
        className={`mb-6 p-4 rounded-lg transition-colors duration-300 ${bg}`}
        onMouseEnter={() => setActiveStep(key)}
        onMouseLeave={() => setActiveStep(null)}
      >
        <div className="flex justify-between mb-2">
          <span className={`text-sm font-medium capitalize ${textBody}`}>
            {key.replace(/_/g, ' ')}
          </span>
          <span className={`text-sm font-semibold ${textTitle}`}>{value}</span>
        </div>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => handleWeightChange(key, parseFloat(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <p className={`text-xs mt-2 ${textMuted}`}>{config?.description}</p>
      </div>
    );
  };

  const mockRankingShift = useMemo(() => {
    const userWeight = simulationWeights['ranking_user_score_weight'] || 0.7;
    const globalWeight = simulationWeights['ranking_global_score_weight'] || 0.3;
    
    return [
      { id: 1, title: "Personalized News A", score: (0.9 * userWeight + 0.2 * globalWeight).toFixed(2), trend: 'up' },
      { id: 2, title: "Trending News B", score: (0.3 * userWeight + 0.9 * globalWeight).toFixed(2), trend: 'down' },
      { id: 3, title: "Mix News C", score: (0.6 * userWeight + 0.5 * globalWeight).toFixed(2), trend: 'stable' },
    ].sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
  }, [simulationWeights]);

  if (loading) return (
    <div className={`p-8 text-center min-h-[calc(100vh-64px)] transition-colors duration-200 ${dm ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      Loading Recommendation Engine...
    </div>
  );

  return (
    <div className={`p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] transition-colors duration-200 ${dm ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${textTitle}`}>Recommendation Engine</h1>
          <p className={`text-sm mt-1 ${textMuted}`}>Fine-tune ranking algorithms and weights in real-time.</p>
        </div>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 hover:translate-y-[-2px] hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          onClick={handleDeploy}
          disabled={deploying}
        >
          {deploying ? 'Deploying...' : 'Deploy Changes'}
        </button>
      </header>

      {toast && (
        <div className={`fixed top-8 right-8 py-3 px-6 rounded-lg z-[1000] text-white shadow-lg animate-[slideIn_0.3s_ease-out] ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_340px] gap-6">
        {/* Left Column: Controls */}
        <aside className={`rounded-xl border p-6 ${cardBg} ${dm ? 'backdrop-blur-md' : ''}`}>
          <section className="mb-8 last:mb-0">
            <h3 className={`text-lg font-semibold mb-4 ${textTitle}`}>Interaction Weights</h3>
            {CONFIG_KEYS.INTERACTION.map(renderSlider)}
          </section>

          <section className="mb-8 last:mb-0">
            <h3 className={`text-lg font-semibold mb-4 ${textTitle}`}>Ranking Mix</h3>
            {CONFIG_KEYS.RANKING.map(renderSlider)}
          </section>

          <section className="mb-8 last:mb-0">
            <h3 className={`text-lg font-semibold mb-4 ${textTitle}`}>Pool Limits</h3>
            {CONFIG_KEYS.LIMITS.map(renderSlider)}
          </section>
        </aside>

        {/* Middle Column: Logic Visualization */}
        <main className={`flex flex-col rounded-xl border p-6 ${cardBg} ${dm ? 'backdrop-blur-md' : ''}`}>
          <h3 className={`text-lg font-semibold mb-4 ${textTitle}`}>Ranking Flow Logic</h3>
          <div className="w-full text-center flex-1">
            <svg viewBox="0 0 800 500" className="w-full h-auto max-w-[800px] mx-auto overflow-visible mt-6">
              {/* Connections */}
              {[
                "M 100 250 L 250 150",
                "M 100 250 L 250 350",
                "M 400 150 L 550 250",
                "M 400 350 L 550 250",
                "M 700 250 L 780 250"
              ].map((d, i) => (
                <path 
                  key={i} 
                  d={d} 
                  fill="none" 
                  stroke={dm ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
                  strokeWidth="2" 
                  strokeDasharray="5, 5" 
                />
              ))}

              {/* Nodes */}
              <g className="transition-all duration-300">
                <rect x="250" y="100" width="150" height="100" rx="10" className={`${activeStep?.includes('user_interest') ? 'fill-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]' : (dm ? 'fill-gray-800' : 'fill-white')} stroke-indigo-500 stroke-2 transition-colors`} />
                <text x="325" y="145" textAnchor="middle" className={`text-[14px] font-medium ${activeStep?.includes('user_interest') ? 'fill-white' : (dm ? 'fill-white' : 'fill-gray-900')}`}>User Interests</text>
                <text x="325" y="165" className={`text-[10px] ${activeStep?.includes('user_interest') ? 'fill-indigo-100' : (dm ? 'fill-gray-400' : 'fill-gray-500')}`} textAnchor="middle">Personal Score</text>
              </g>

              <g className="transition-all duration-300">
                <rect x="250" y="300" width="150" height="100" rx="10" className={`${activeStep === 'ranking_global_score_weight' ? 'fill-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]' : (dm ? 'fill-gray-800' : 'fill-white')} stroke-indigo-500 stroke-2 transition-colors`} />
                <text x="325" y="345" textAnchor="middle" className={`text-[14px] font-medium ${activeStep === 'ranking_global_score_weight' ? 'fill-white' : (dm ? 'fill-white' : 'fill-gray-900')}`}>Trending Logic</text>
                <text x="325" y="365" className={`text-[10px] ${activeStep === 'ranking_global_score_weight' ? 'fill-indigo-100' : (dm ? 'fill-gray-400' : 'fill-gray-500')}`} textAnchor="middle">Global Score</text>
              </g>

              <g className="transition-all duration-300">
                <rect x="550" y="200" width="150" height="100" rx="10" className={`${dm ? 'fill-gray-800' : 'fill-white'} stroke-indigo-500 stroke-2 transition-colors`} />
                <text x="625" y="245" textAnchor="middle" className={`text-[14px] font-medium ${dm ? 'fill-white' : 'fill-gray-900'}`}>Weighted Sum</text>
                <text x="625" y="265" className={`text-[10px] ${dm ? 'fill-gray-400' : 'fill-gray-500'}`} textAnchor="middle">Final Rank Calculation</text>
              </g>

              <circle cx="100" cy="250" r="40" className={`${dm ? 'fill-gray-800' : 'fill-white'} stroke-indigo-500 stroke-2 transition-colors`} />
              <text x="100" y="255" textAnchor="middle" className={`text-[14px] font-medium ${dm ? 'fill-white' : 'fill-gray-900'}`}>Input</text>
            </svg>
          </div>

          <div className="mt-8">
            <h4 className={`text-sm font-semibold mb-2 ${textTitle}`}>Mathematical Model</h4>
            <div className={`p-4 rounded-lg font-mono text-sm overflow-x-auto ${dm ? 'bg-black text-emerald-400' : 'bg-gray-100 text-emerald-600'}`}>
              <code>
                Final Score = (Σ(Interactions × Weights) × Personalization_Weight)<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (Normalized_Engagement × Global_Weight)<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;× exp(-age / 24)
              </code>
            </div>
          </div>
        </main>

        {/* Right Column: Simulator & Decay */}
        <section className="flex flex-col gap-6">
          <div className={`rounded-xl border p-6 ${cardBg} ${dm ? 'backdrop-blur-md' : ''}`}>
            <h3 className={`text-lg font-semibold mb-2 ${textTitle}`}>"What If" Simulator</h3>
            <p className={`text-sm mb-4 ${textMuted}`}>Live preview of ranking shifts based on current sliders.</p>
            <div className="flex flex-col">
              {mockRankingShift.map((item, idx) => (
                <div key={item.id} className={`flex items-center py-3 border-b last:border-0 ${dm ? 'border-white/5' : 'border-gray-200'}`}>
                  <span className="font-extrabold text-indigo-500 mr-4 w-6 text-lg">#{idx + 1}</span>
                  <div className="flex-1">
                    <span className={`block text-sm font-medium flex items-center ${textTitle}`}>{item.title}</span>
                    <span className={`text-xs ${textMuted}`}>Match Score: {item.score}</span>
                  </div>
                  {item.trend === 'up' && <span className="text-emerald-500 text-xl font-bold">↑</span>}
                  {item.trend === 'down' && <span className="text-red-500 text-xl font-bold">↓</span>}
                  {item.trend === 'stable' && <span className="text-gray-400 text-xl font-bold">-</span>}
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${cardBg} ${dm ? 'backdrop-blur-md' : ''}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textTitle}`}>Time Decay Curve</h3>
            <div>
              <svg viewBox="0 0 200 120" className="w-full h-[120px] mt-2">
                <path d="M 10 10 Q 100 10, 190 90" fill="none" stroke="#6366f1" strokeWidth="3" />
                <text x="10" y="115" fontSize="10" className={dm ? 'fill-gray-400' : 'fill-gray-500'}>0h</text>
                <text x="100" y="115" fontSize="10" className={dm ? 'fill-gray-400' : 'fill-gray-500'}>24h</text>
                <text x="190" y="115" fontSize="10" className={dm ? 'fill-gray-400' : 'fill-gray-500'}>48h</text>
              </svg>
              <p className={`text-xs text-center mt-3 ${textMuted}`}>
                Posts lose 50% visibility after 24 hours.
              </p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Recommendations;
