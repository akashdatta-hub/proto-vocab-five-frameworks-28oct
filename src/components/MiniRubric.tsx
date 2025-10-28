import React from 'react';

interface SkillScore {
  skill: string;
  score: number;
  total: number;
}

interface MiniRubricProps {
  skills: SkillScore[];
}

export const MiniRubric: React.FC<MiniRubricProps> = ({ skills }) => {
  return (
    <div className="card bg-gray-50">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Skill Breakdown</h3>
      <div className="space-y-3">
        {skills.map((skill) => {
          const percentage = skill.total > 0 ? (skill.score / skill.total) * 100 : 0;
          const passed = percentage >= 80;

          return (
            <div key={skill.skill} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6">
                {passed ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-600"
                    aria-label="Passed"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="16 8 10 14 8 12" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-400"
                    aria-label="Not passed"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium capitalize">{skill.skill}</span>
                  <span className="text-gray-600">
                    {skill.score}/{skill.total}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${passed ? 'bg-green-600' : 'bg-blue-600'}`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
