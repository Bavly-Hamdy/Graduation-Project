import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const pieData = {
  labels: ['Healthy', 'Warning', 'Critical'],
  datasets: [{
    data: [60, 30, 10],
    backgroundColor: ['#4CAF50', '#FFEB3B', '#FF5722'],
    hoverOffset: 4,
  }],
};

const PieChart = () => (
  <div style={{ width: "50%", height: "250px" }}>
    <Doughnut data={pieData} options={{ cutout: '70%' }} />
  </div>
);

export default PieChart;
