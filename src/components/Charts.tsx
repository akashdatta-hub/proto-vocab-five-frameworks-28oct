import React from 'react';

interface BarChartData {
  label: string;
  value: number;
  total: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="space-y-4" role="list" aria-label={title || 'Bar chart'}>
        {data.map((item, index) => {
          const percentage =
            item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
          const barColor = item.color || '#3b82f6'; // Default to blue-500

          return (
            <div
              key={index}
              className="flex flex-col gap-2"
              role="listitem"
              aria-label={`${item.label}: ${item.value} out of ${item.total} (${percentage}%)`}
            >
              {/* Label and stats */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-500">
                  {item.value}/{item.total} ({percentage}%)
                </span>
              </div>

              {/* Bar container */}
              <div className="relative h-8 w-full bg-gray-200 rounded-lg overflow-hidden">
                {/* Bar fill */}
                <div
                  className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                  }}
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${percentage}% complete`}
                />

                {/* Percentage label inside bar (if there's enough space) */}
                {percentage > 15 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {percentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface StackedBarData {
  label: string;
  segments: {
    label: string;
    value: number;
    color: string;
  }[];
}

interface StackedBarChartProps {
  data: StackedBarData[];
  title?: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  title,
}) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="space-y-4" role="list" aria-label={title || 'Stacked bar chart'}>
        {data.map((item, index) => {
          const total = item.segments.reduce((sum, seg) => sum + seg.value, 0);

          return (
            <div key={index} className="flex flex-col gap-2" role="listitem">
              {/* Label */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-500">Total: {total}</span>
              </div>

              {/* Stacked bar container */}
              <div className="relative h-8 w-full bg-gray-200 rounded-lg overflow-hidden flex">
                {item.segments.map((segment, segIndex) => {
                  const percentage =
                    total > 0 ? (segment.value / total) * 100 : 0;

                  return (
                    <div
                      key={segIndex}
                      className="h-full transition-all duration-500 ease-out flex items-center justify-center"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: segment.color,
                      }}
                      role="progressbar"
                      aria-valuenow={Math.round(percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${segment.label}: ${segment.value} (${Math.round(percentage)}%)`}
                      title={`${segment.label}: ${segment.value}`}
                    >
                      {percentage > 10 && (
                        <span className="text-xs font-semibold text-white">
                          {segment.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                {item.segments.map((segment, segIndex) => (
                  <div key={segIndex} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: segment.color }}
                      aria-hidden="true"
                    />
                    <span>
                      {segment.label}: {segment.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
