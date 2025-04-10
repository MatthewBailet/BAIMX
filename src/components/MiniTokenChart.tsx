import React, { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface MiniTokenChartProps {
  symbol: string; // e.g., BTC - Still useful for potential keys/alt text
  chartOption: EChartsOption | null;
  error: string | null;
  percentageChange: number | null; // Add prop for percentage change
}

const CHART_HEIGHT = '30px'; // Keep height consistent

export const MiniTokenChart: React.FC<MiniTokenChartProps> = memo(({ symbol, chartOption, error, percentageChange }) => {
  return (
    <div className="w-full relative" style={{ height: CHART_HEIGHT }}>
      {/* Render based on props passed from Header */}
      {error && (
        <div className="w-full h-full flex items-center justify-center bg-red-900 bg-opacity-30 rounded-sm" title={error}>
          <span className="text-red-400 text-xs font-mono">!</span>
        </div>
      )}
      {!error && chartOption && (
        <ReactECharts
          option={chartOption}
          style={{ height: CHART_HEIGHT, width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      )}
      {/* Placeholder if no error and no chart option yet (initial state in parent) */}
      {!error && !chartOption && (
         <div className="w-full h-full flex items-center justify-center bg-gray-700 bg-opacity-20 rounded-sm">
           <span className="text-gray-500 text-xs">-</span>
         </div>
      )}
    </div>
  );
});

MiniTokenChart.displayName = 'MiniTokenChart'; 