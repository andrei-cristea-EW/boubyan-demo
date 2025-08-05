import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ChartDataItem {
  product: string
  currentUsage: number
  proposedLicenses: number
}

interface UsageChartProps {
  data: ChartDataItem[]
}

export default function UsageChart({ data }: UsageChartProps) {
  const chartData = {
    labels: data.map(item => item.product),
    datasets: [
      {
        label: 'Current Usage',
        data: data.map(item => item.currentUsage),
        backgroundColor: 'rgba(139, 92, 246, 0.8)', // violet-500 with transparency
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Proposed Licenses',
        data: data.map(item => item.proposedLicenses),
        backgroundColor: 'rgba(14, 165, 233, 0.8)', // sky-500 with transparency
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0', // slate-200
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: '500',
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'License Usage vs Proposal',
        color: '#e2e8f0', // slate-200
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 16,
          weight: '600',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)', // slate-900 with transparency
        titleColor: '#e2e8f0', // slate-200
        bodyColor: '#cbd5e1', // slate-300
        borderColor: 'rgba(139, 92, 246, 0.5)', // violet-500 with transparency
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 13,
          weight: '600',
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
        },
        padding: 12,
        callbacks: {
          title: function(context) {
            return context[0].label || '';
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} license${value !== 1 ? 's' : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)', // slate-600 with transparency
          drawBorder: false,
        },
        ticks: {
          color: '#cbd5e1', // slate-300
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11,
            weight: '500',
          },
          maxRotation: 45,
          minRotation: 0,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(71, 85, 105, 0.3)', // slate-600 with transparency
          drawBorder: false,
        },
        ticks: {
          color: '#cbd5e1', // slate-300
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11,
            weight: '500',
          },
          stepSize: 1,
          callback: function(value) {
            if (Number.isInteger(value)) {
              return value;
            }
            return null;
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
  }

  if (data.length === 0) {
    return (
      <div className="cyber-card p-6">
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">No Chart Data Available</div>
            <div className="text-sm">Chart data will appear when included in the response</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cyber-card p-6">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}