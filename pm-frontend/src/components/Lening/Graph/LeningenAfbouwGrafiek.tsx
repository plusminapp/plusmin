import { AgCharts } from "ag-charts-react";
import { AgAreaSeriesOptions, AgChartOptions } from "ag-charts-community";
import { getData, getSeries } from "./data";

type ChartProps = {
  huidigePeriode: string;
}

export const LeningenAfbouwGrafiek = (props: ChartProps) => {
  const chartOptions: AgChartOptions = {
    data: getData(),
    series: getSeries() as AgAreaSeriesOptions[],
    axes: [
      {
        type: "category",
        position: "bottom",
        crossLines: [
          {
            type: 'line',
            value: props.huidigePeriode, 
            label: {
              text: props.huidigePeriode,
              position: 'top',
              fontSize: 12,
          },
          },
        ],
        label: {
          formatter: (params: { index: number; value: string }) =>
            params.index % 6 === 0 ? params.value : "",
        },
      },
      {
        type: "number",
        position: "left",
        label: {
          formatter: (params) => {
            return `${new Intl.NumberFormat("nl-NL", {style: "currency", currency: "EUR",}).format(params.value)}`;
          },
        },
      },
    ],
    height: 400,
  };

  return <AgCharts options={chartOptions} />;
};
