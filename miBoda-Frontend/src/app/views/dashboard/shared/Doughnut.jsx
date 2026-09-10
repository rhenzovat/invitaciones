import ReactEcharts from "echarts-for-react";
import { useTheme } from "@mui/material/styles";

const defaultData = [
  { value: 65, name: "Google" },
  { value: 20, name: "Facebook" },
  { value: 15, name: "Others" }
];

export default function DoughnutChart({ height, color = [], data }) {
  const theme = useTheme();
  const chartData = data && data.length > 0 ? data : defaultData;
  const isMobile = window.innerWidth < 768;
  const option = {
    legend: {
      bottom: 0,
      show: true,
      itemGap: 20,
      icon: "circle",
      textStyle: { color: theme.palette.text.secondary, fontSize: 13, fontFamily: "roboto" }
    },
    tooltip: { show: true, trigger: "item", formatter: "{b}: {c} ({d}%)" },
    xAxis: [{ axisLine: { show: false }, splitLine: { show: false } }],
    yAxis: [{ axisLine: { show: false }, splitLine: { show: false } }],

    series: [
      {
        name: "Categorias",
        type: "pie",
        hoverOffset: 5,
        radius: isMobile ? ["40%", "65%"] : ["45%", "72.55%"],
        center: isMobile ? ["50%", "35%"] : ["50%", "45%"],
        avoidLabelOverlap: false,
        stillShowZeroSum: false,
        labelLine: { show: false },
        label: {
          show: false,
          fontSize: 13,
          formatter: "{a}",
          position: "center",
          fontFamily: "roboto",
          color: theme.palette.text.secondary
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "14",
            padding: 4,
            fontWeight: "normal",
            formatter: "{b} ({d}%)"
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        data: chartData
      }
    ]
  };

  return <ReactEcharts style={{ height }} option={{ ...option, color: [...color] }} />;
}
