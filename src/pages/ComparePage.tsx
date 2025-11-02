import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents } from '../hooks/useAnalytics';

export const ComparePage: React.FC = () => {
  const [events, setEvents] = useState<Awaited<ReturnType<typeof getAllEvents>>>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const data = await getAllEvents();
      setEvents(data);
    };
    loadEvents();
  }, []);

  const frameworks = ['blooms', 'cefr', 'marzano', 'nation', 'lexical'];

  const frameworkData = frameworks.map((framework) => {
    const frameworkEvents = events.filter((e) => e.framework === framework);
    const stepViews = frameworkEvents.filter((e) => e.event === 'step_view').length;
    const answerResults = frameworkEvents.filter((e) => e.event === 'answer_result');
    const correctAnswers = answerResults.filter((e) => e.meta?.correct === true).length;
    const skippedSteps = frameworkEvents.filter((e) => e.event === 'step_skip').length;
    const totalAttempts = frameworkEvents.filter((e) => e.event === 'answer_submit').length;

    const timeEvents = frameworkEvents.filter((e) => e.event === 'step_view' || e.event === 'complete_word');
    const totalTime = timeEvents.length > 1
      ? timeEvents[timeEvents.length - 1].ts - timeEvents[0].ts
      : 0;

    return {
      framework,
      stepViews,
      correctAnswers,
      totalAnswers: answerResults.length,
      skippedSteps,
      totalAttempts,
      totalTime: Math.floor(totalTime / 1000), // Convert to seconds
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Framework Comparison</h1>
          <p className="text-gray-600">
            Compare performance and engagement across different learning frameworks
          </p>
        </div>

        {events.length === 0 ? (
          <div className="card text-center">
            <p className="text-xl text-gray-600 mb-4">No journey data yet!</p>
            <p className="text-gray-500 mb-6">
              Complete a learning journey to see comparison data here.
            </p>
            <Link to="/" className="btn-primary inline-block">
              Start a Journey
            </Link>
          </div>
        ) : (
          <>
            {/* Visual Summary Section */}
            <div className="card mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {frameworkData.filter((d) => d.stepViews > 0).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Frameworks Attempted</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {frameworkData.reduce((sum, d) => sum + d.correctAnswers, 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">
                    {Math.round(
                      frameworkData.reduce((sum, d) => {
                        const acc = d.totalAnswers > 0 ? (d.correctAnswers / d.totalAnswers) * 100 : 0;
                        return sum + acc;
                      }, 0) / frameworkData.filter((d) => d.totalAnswers > 0).length || 0
                    )}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Average Accuracy</div>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-4 mt-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Summary:</strong> You've explored{' '}
                  {frameworkData.filter((d) => d.stepViews > 0).length} framework(s) with{' '}
                  {frameworkData.reduce((sum, d) => sum + d.totalAnswers, 0)} total attempts.
                  {frameworkData.some((d) => d.totalAnswers > 0 && (d.correctAnswers / d.totalAnswers) >= 0.8) &&
                    " Great job achieving mastery on some frameworks!"}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Performance:</strong> Your best framework is{' '}
                  <span className="font-semibold capitalize">
                    {frameworkData
                      .filter((d) => d.totalAnswers > 0)
                      .sort((a, b) => b.correctAnswers / b.totalAnswers - a.correctAnswers / a.totalAnswers)[0]
                      ?.framework || 'N/A'}
                  </span>{' '}
                  with the highest accuracy rate.
                </p>
              </div>
            </div>
          </>
        )}

        {events.length > 0 && (
          <div className="space-y-6">
            {frameworkData
              .filter((data) => data.stepViews > 0)
              .map((data) => {
                const accuracy = data.totalAnswers > 0
                  ? Math.round((data.correctAnswers / data.totalAnswers) * 100)
                  : 0;
                const avgAttempts = data.totalAnswers > 0
                  ? (data.totalAttempts / data.totalAnswers).toFixed(1)
                  : '0.0';

                return (
                  <div key={data.framework} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold capitalize">{data.framework}</h2>
                        <p className="text-sm text-gray-600">{data.stepViews} steps viewed</p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          accuracy >= 80
                            ? 'bg-green-100 text-green-900'
                            : accuracy >= 60
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {accuracy}% Accuracy
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Correct Answers</div>
                        <div className="text-2xl font-bold text-green-600">
                          {data.correctAnswers}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Answers</div>
                        <div className="text-2xl font-bold">{data.totalAnswers}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Skipped Steps</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {data.skippedSteps}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Avg Attempts</div>
                        <div className="text-2xl font-bold">{avgAttempts}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">Accuracy Progress</div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${
                            accuracy >= 80 ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                    </div>

                    {data.totalTime > 0 && (
                      <div className="mt-4 text-sm text-gray-600">
                        Total time: {Math.floor(data.totalTime / 60)}m {data.totalTime % 60}s
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/debug" className="btn-secondary">
            View Debug Log
          </Link>
        </div>
      </div>
    </div>
  );
};
