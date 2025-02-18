import { AgCharts } from "ag-charts-react";
import { AgAreaSeriesOptions, AgChartOptions } from "ag-charts-community";
import { getData, getSeries } from "./data";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useCustomContext } from "../../../context/CustomContext";
import { Aflossing } from "../../../model/Aflossing";
import dayjs from "dayjs";

export const AflossingenAfbouwGrafiek = () => {

  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager, gekozenPeriode } = useCustomContext();

  const [aflossingen, setAflossingen] = useState<Aflossing[]>([]);

  const fetchAflossingen = useCallback(async () => {
    if (gebruiker) {  
      const token = await getIDToken();
      const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
      const response = await fetch(`/api/v1/aflossing/hulpvrager/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const result = await response.json();
        setAflossingen(result);
      } else {
        console.error("Ophalen van het aflossingen is mislukt.", response.status);
      }
    }
  }, [getIDToken, actieveHulpvrager, gebruiker]);

  useEffect(() => {
    fetchAflossingen();
  }, [fetchAflossingen]);

  const getoondePeriode = dayjs(gekozenPeriode?.periodeEindDatum).format("YYYY-MM"); 

  const chartOptions: AgChartOptions = {
    data: Object.values(getData(aflossingen)),
    series: getSeries(aflossingen) as AgAreaSeriesOptions[],
    axes: [
      {
        type: "category",
        position: "bottom",
        crossLines: [
          {
            type: 'line',
            value: getoondePeriode,
            label: {
              text: getoondePeriode,
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
            return `${new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", }).format(params.value)}`;
          },
        },
      },
    ],
    height: 400,
  };

  return <AgCharts options={chartOptions} />;
};
