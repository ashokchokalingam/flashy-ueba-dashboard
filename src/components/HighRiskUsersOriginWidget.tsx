import { AlertTriangle, Search, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface RiskyUser {
  user: string;
  cumulative_risk_score: string;
  unique_outliers: number;
  unique_tactics_count: string;
  unique_title_count: number;
}

const HighRiskUsersOriginWidget = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: riskyUsers, isError, isLoading } = useQuery({
    queryKey: ['riskyUsersOrigin'],
    queryFn: async () => {
      const response = await fetch('/api/user_origin_outlier_highrisk');
      if (!response.ok) {
        throw new Error('Failed to fetch high risk users');
      }
      const data = await response.json();
      const sortedUsers = data.user_origin_outlier_highrisk_logs.sort((a: RiskyUser, b: RiskyUser) => 
        parseInt(b.cumulative_risk_score) - parseInt(a.cumulative_risk_score)
      );
      return sortedUsers || [];
    }
  });

  const filteredUsers = riskyUsers?.filter(user => 
    user.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="entity-card">
        <div className="entity-header">
          <div className="entity-title">
            <AlertTriangle className="h-5 w-5 text-purple-400/80" />
            <span>High Risk Users Origin</span>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-purple-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="entity-card">
        <div className="entity-header">
          <div className="entity-title">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>High Risk Users Origin</span>
          </div>
        </div>
        <div className="p-4">
          <div className="text-red-400">Failed to load high risk users</div>
        </div>
      </div>
    );
  }

  return (
    <div className="entity-card">
      <div className="entity-header">
        <div className="entity-title">
          <AlertTriangle className="h-5 w-5 text-purple-400/80" />
          <span>High Risk Users Origin</span>
        </div>
        <span className="entity-count">
          {filteredUsers?.length || 0} risky users
        </span>
      </div>

      <div className="entity-search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities..."
            className="entity-search-input"
          />
        </div>
      </div>

      <div className="entity-content scrollbar-thin scrollbar-thumb-blue-500/10 scrollbar-track-transparent">
        {filteredUsers?.map((user: RiskyUser) => (
          <div key={user.user} className="entity-item">
            <div className="entity-item-left">
              <div className="entity-item-icon">
                <User className="w-5 h-5 text-blue-400/70" />
              </div>
              <div className="entity-item-text">
                <span className="entity-item-title">
                  {user.user}
                </span>
                <span className="entity-item-subtitle">
                  {user.unique_title_count} unique anomalies
                </span>
              </div>
            </div>

            <div className="entity-item-right">
              <div className="risk-score-container">
                <div className="risk-level">
                  <span className="risk-level-text text-red-500 animate-pulse">
                    Risk
                  </span>
                  <span className="risk-level-value text-red-500 animate-pulse">
                    critical
                  </span>
                </div>
                <div className="cardiogram">
                  <svg className="w-[200%] h-full animate-cardiogram" viewBox="0 0 600 100" preserveAspectRatio="none">
                    <path
                      d="M0,50 L100,50 L120,20 L140,80 L160,50 L300,50 L320,20 L340,80 L360,50 L500,50 L520,20 L540,80 L560,50 L600,50"
                      className="stroke-red-500 fill-none stroke-[4] animate-pulse"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="risk-score text-red-500 animate-pulse">
                  {user.cumulative_risk_score}
                </span>
              </div>
            </div>
          </div>
        ))}
        {(!filteredUsers || filteredUsers.length === 0) && (
          <div className="text-blue-400/60 text-center py-4">
            No high risk users found
          </div>
        )}
      </div>
    </div>
  );
};

export default HighRiskUsersOriginWidget;