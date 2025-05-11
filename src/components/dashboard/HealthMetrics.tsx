'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Mock data - this would be replaced with real data from an API
const bloodPressureData = [
  { date: 'Jan', systolic: 120, diastolic: 80 },
  { date: 'Feb', systolic: 125, diastolic: 82 },
  { date: 'Mar', systolic: 123, diastolic: 79 },
  { date: 'Apr', systolic: 128, diastolic: 83 },
  { date: 'May', systolic: 125, diastolic: 80 },
  { date: 'Jun', systolic: 120, diastolic: 78 },
  { date: 'Jul', systolic: 118, diastolic: 76 },
];

const glucoseData = [
  { date: 'Mon', value: 110 },
  { date: 'Tue', value: 115 },
  { date: 'Wed', value: 105 },
  { date: 'Thu', value: 120 },
  { date: 'Fri', value: 112 },
  { date: 'Sat', value: 108 },
  { date: 'Sun', value: 110 },
];

const cholesterolData = [
  { name: 'Total', value: 180 },
  { name: 'HDL', value: 50 },
  { name: 'LDL', value: 110 },
  { name: 'Triglycerides', value: 90 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Custom tooltip for blood pressure chart
const BloodPressureTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white rounded-lg shadow border border-gray-100">
        <p className="font-medium text-gray-700">{`${label}`}</p>
        <p className="text-sm text-red-500">{`Systolic: ${payload[0].value} mmHg`}</p>
        <p className="text-sm text-blue-500">{`Diastolic: ${payload[1].value} mmHg`}</p>
      </div>
    );
  }
  return null;
};

export default function HealthMetrics() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-4 shadow-md overflow-hidden"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Blood Pressure Trends</h3>
        <div className="h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={bloodPressureData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis domain={[60, 140]} />
              <Tooltip content={<BloodPressureTooltip />} />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#ef4444" 
                strokeWidth={2}
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#3b82f6" 
                strokeWidth={2}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Systolic</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Diastolic</span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Normal Range
            </span>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-md overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Glucose Levels</h3>
          <div className="h-52 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={glucoseData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis domain={[80, 140]} />
                <Tooltip />
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGlucose)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p className="flex items-center justify-between">
              <span>Average: 110 mg/dL</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Normal Range
              </span>
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-md overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Cholesterol Profile</h3>
          <div className="h-52 md:h-56 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cholesterolData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {cholesterolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:text-sm">
            {cholesterolData.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span>{item.name}: {item.value} mg/dL</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 