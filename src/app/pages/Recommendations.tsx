import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services/api';
import { AdminConfig } from '../types/api';

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

    return (
      <div 
        key={key} 
        className={`weight-control ${activeStep === key ? 'active' : ''}`}
        onMouseEnter={() => setActiveStep(key)}
        onMouseLeave={() => setActiveStep(null)}
      >
        <div className="weight-info">
          <span className="weight-label">{key.replace(/_/g, ' ')}</span>
          <span className="weight-value">{value}</span>
        </div>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => handleWeightChange(key, parseFloat(e.target.value))}
          className="slider"
        />
        <p className="weight-desc">{config?.description}</p>
      </div>
    );
  };

  // Mock Ranking Shift Simulation
  const mockRankingShift = useMemo(() => {
    // Simple logic to show "shift"
    const userWeight = simulationWeights['ranking_user_score_weight'] || 0.7;
    const globalWeight = simulationWeights['ranking_global_score_weight'] || 0.3;
    
    return [
      { id: 1, title: "Personalized News A", score: (0.9 * userWeight + 0.2 * globalWeight).toFixed(2), trend: 'up' },
      { id: 2, title: "Trending News B", score: (0.3 * userWeight + 0.9 * globalWeight).toFixed(2), trend: 'down' },
      { id: 3, title: "Mix News C", score: (0.6 * userWeight + 0.5 * globalWeight).toFixed(2), trend: 'stable' },
    ].sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
  }, [simulationWeights]);

  if (loading) return <div className="loading-screen">Loading Recommendation Engine...</div>;

  return (
    <div className="recommendations-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Recommendation Engine</h1>
          <p>Fine-tune ranking algorithms and weights in real-time.</p>
        </div>
        <button 
          className={`deploy-btn ${deploying ? 'loading' : ''}`} 
          onClick={handleDeploy}
          disabled={deploying}
        >
          {deploying ? 'Deploying...' : 'Deploy Changes'}
        </button>
      </header>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Column: Controls */}
        <aside className="controls-panel card glass">
          <section className="control-group">
            <h3>Interaction Weights</h3>
            {CONFIG_KEYS.INTERACTION.map(renderSlider)}
          </section>

          <section className="control-group">
            <h3>Ranking Mix</h3>
            {CONFIG_KEYS.RANKING.map(renderSlider)}
          </section>

          <section className="control-group">
            <h3>Pool Limits</h3>
            {CONFIG_KEYS.LIMITS.map(renderSlider)}
          </section>
        </aside>

        {/* Middle Column: Logic Visualization */}
        <main className="visualization-panel card glass">
          <h3>Ranking Flow Logic</h3>
          <div className="flow-diagram">
            <svg viewBox="0 0 800 500" className="logic-tree">
              {/* Connections */}
              <path d="M 100 250 L 250 150" className="connector" />
              <path d="M 100 250 L 250 350" className="connector" />
              <path d="M 400 150 L 550 250" className="connector" />
              <path d="M 400 350 L 550 250" className="connector" />
              <path d="M 700 250 L 780 250" className="connector" />

              {/* Nodes */}
              <g className={`node ${activeStep?.includes('user_interest') ? 'highlight' : ''}`}>
                <rect x="250" y="100" width="150" height="100" rx="10" />
                <text x="325" y="145" textAnchor="middle">User Interests</text>
                <text x="325" y="165" className="sub" textAnchor="middle">Personal Score</text>
              </g>

              <g className={`node ${activeStep === 'ranking_global_score_weight' ? 'highlight' : ''}`}>
                <rect x="250" y="300" width="150" height="100" rx="10" />
                <text x="325" y="345" textAnchor="middle">Trending Logic</text>
                <text x="325" y="365" className="sub" textAnchor="middle">Global Score</text>
              </g>

              <g className="node special">
                <rect x="550" y="200" width="150" height="100" rx="10" />
                <text x="625" y="245" textAnchor="middle">Weighted Sum</text>
                <text x="625" y="265" className="sub" textAnchor="middle">Final Rank Calculation</text>
              </g>

              <circle cx="100" cy="250" r="40" className="node-start" />
              <text x="100" y="255" textAnchor="middle" className="start-text">Input</text>
            </svg>
          </div>

          <div className="math-breakdown">
            <h4>Mathematical Model</h4>
            <div className="formula card">
              <code>
                Final Score = (Σ(Interactions × Weights) × Personalization_Weight) 
                + (Normalized_Engagement × Global_Weight) 
                × exp(-age / 24)
              </code>
            </div>
          </div>
        </main>

        {/* Right Column: Simulator & Decay */}
        <section className="analysis-panel">
          <div className="simulator-card card glass">
            <h3>"What If" Simulator</h3>
            <p className="help-text">Live preview of ranking shifts based on current sliders.</p>
            <div className="simulation-list">
              {mockRankingShift.map((item, idx) => (
                <div key={item.id} className="simulation-item">
                  <span className="rank">#{idx + 1}</span>
                  <div className="item-details">
                    <span className="item-title">{item.title}</span>
                    <span className="item-score">Match Score: {item.score}</span>
                  </div>
                  <div className={`trend-icon ${item.trend}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="decay-card card glass">
            <h3>Time Decay Curve</h3>
            <div className="curve-container">
              <svg viewBox="0 0 200 100" className="decay-graph">
                <path d="M 10 10 Q 100 10, 190 90" fill="none" stroke="var(--accent)" strokeWidth="3" />
                <text x="10" y="105" fontSize="8" fill="#888">0h</text>
                <text x="100" y="105" fontSize="8" fill="#888">24h</text>
                <text x="190" y="105" fontSize="8" fill="#888">48h</text>
              </svg>
              <p className="decay-note">Posts lose 50% visibility after 24 hours.</p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .recommendations-container {
          padding: 2rem;
          color: #fff;
          background: #0f172a;
          min-height: calc(100vh - 64px);
        }

        .glass {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card {
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .deploy-btn {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .deploy-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 320px 1fr 340px;
          gap: 1.5rem;
        }

        .weight-control {
          margin-bottom: 1.5rem;
          padding: 1rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          transition: 0.3s;
        }

        .weight-control.active {
          background: rgba(99, 102, 241, 0.2);
          border-left: 4px solid #6366f1;
        }

        .weight-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .slider {
          width: 100%;
          accent-color: #6366f1;
        }

        .weight-desc {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        .logic-tree {
          width: 100%;
          height: auto;
        }

        .connector {
          fill: none;
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 2;
          stroke-dasharray: 5, 5;
        }

        .node rect {
          fill: #1e293b;
          stroke: #6366f1;
          stroke-width: 2;
        }

        .node.highlight rect {
          fill: #6366f1;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
        }

        .node text {
          fill: white;
          font-size: 14px;
          font-weight: 500;
        }

        .node .sub {
          font-size: 10px;
          fill: #94a3b8;
        }

        .formula {
          background: #000;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: monospace;
          color: #10b981;
        }

        .simulation-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .rank {
          font-weight: 800;
          color: #6366f1;
          margin-right: 1rem;
          width: 30px;
        }

        .item-details {
          flex: 1;
        }

        .item-title {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .item-score {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .decay-graph {
          width: 100%;
          height: 120px;
          margin-top: 1rem;
        }

        .toast {
          position: fixed;
          top: 2rem;
          right: 2rem;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }

        .toast.success { background: #10b981; }
        .toast.error { background: #ef4444; }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Recommendations;
