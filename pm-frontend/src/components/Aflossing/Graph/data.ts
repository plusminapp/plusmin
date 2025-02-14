export function getData() {
  return [
    { month: '2024-05', bdtoeslagen: 7425.00, smaal: 851.40, infomedics: 386.40, flanderijn: 1304.00, woningcorporatie: 669.91, waterschap: 644.41, tribuut: 632.74 },
    { month: '2024-06', bdtoeslagen: 7166.00, smaal: 776.40, infomedics: 361.40, flanderijn: 1229.00, woningcorporatie: 644.91, waterschap: 619.41, tribuut: 592.74 },
    { month: '2024-07', bdtoeslagen: 6907.00, smaal: 701.40, infomedics: 336.40, flanderijn: 1154.00, woningcorporatie: 619.91, waterschap: 594.41, tribuut: 552.74 },
    { month: '2024-08', bdtoeslagen: 6648.00, smaal: 626.40, infomedics: 311.40, flanderijn: 1079.00, woningcorporatie: 594.91, waterschap: 569.41, tribuut: 512.74 },
    { month: '2024-09', bdtoeslagen: 6389.00, smaal: 551.40, infomedics: 286.40, flanderijn: 1004.00, woningcorporatie: 569.91, waterschap: 544.41, tribuut: 472.74 },
    { month: '2024-10', bdtoeslagen: 6130.00, smaal: 476.40, infomedics: 261.40, flanderijn: 929.00, woningcorporatie: 544.91, waterschap: 519.41, tribuut: 432.74 },
    { month: '2024-11', bdtoeslagen: 5871.00, smaal: 401.40, infomedics: 236.40, flanderijn: 854.00, woningcorporatie: 519.91, waterschap: 494.41, tribuut: 392.74 },
    { month: '2024-12', bdtoeslagen: 5612.00, smaal: 326.40, infomedics: 211.40, flanderijn: 779.00, woningcorporatie: 494.91, waterschap: 469.41, tribuut: 352.74 },
    { month: '2025-01', bdtoeslagen: 5353.00, smaal: 251.40, infomedics: 186.40, flanderijn: 704.00, woningcorporatie: 469.91, waterschap: 444.41, tribuut: 312.74 },
    { month: '2025-02', bdtoeslagen: 5094.00, smaal: 176.40, infomedics: 161.40, flanderijn: 629.00, woningcorporatie: 444.91, waterschap: 419.41, tribuut: 272.74 },
    { month: '2025-03', bdtoeslagen: 4835.00, smaal: 101.40, infomedics: 136.40, flanderijn: 554.00, woningcorporatie: 419.91, waterschap: 394.41, tribuut: 232.74 },
    { month: '2025-04', bdtoeslagen: 4576.00, smaal: 26.40, infomedics: 111.40, flanderijn: 479.00, woningcorporatie: 394.91, waterschap: 369.41, tribuut: 192.74 },
    { month: '2025-05', bdtoeslagen: 4317.00, infomedics: 86.40, flanderijn: 404.00, woningcorporatie: 369.91, waterschap: 344.41, tribuut: 152.74 },
    { month: '2025-06', bdtoeslagen: 4058.00, infomedics: 61.40, flanderijn: 329.00, woningcorporatie: 344.91, waterschap: 319.41, tribuut: 112.74 },
    { month: '2025-07', bdtoeslagen: 3799.00, infomedics: 36.40, flanderijn: 254.00, woningcorporatie: 319.91, waterschap: 294.41, tribuut: 72.74 },
    { month: '2025-08', bdtoeslagen: 3540.00, infomedics: 11.40, flanderijn: 179.00, woningcorporatie: 294.91, waterschap: 269.41, tribuut: 32.74 },
    { month: '2025-09', bdtoeslagen: 3281.00, flanderijn: 104.00, woningcorporatie: 269.91, waterschap: 244.41 },
    { month: '2025-10', bdtoeslagen: 3022.00, flanderijn: 29.00, woningcorporatie: 244.91, waterschap: 219.41 },
    { month: '2025-11', bdtoeslagen: 2763.00, woningcorporatie: 219.91, waterschap: 194.41 },
    { month: '2025-12', bdtoeslagen: 2504.00, woningcorporatie: 194.91, waterschap: 169.41 },
    { month: '2026-01', bdtoeslagen: 2245.00, woningcorporatie: 169.91, waterschap: 144.41 },
    { month: '2026-02', bdtoeslagen: 1986.00, woningcorporatie: 144.91, waterschap: 119.41 },
    { month: '2026-03', bdtoeslagen: 1727.00, woningcorporatie: 119.91, waterschap: 94.41 },
    { month: '2026-04', bdtoeslagen: 1468.00, woningcorporatie: 94.91, waterschap: 69.41 },
    { month: '2026-05', bdtoeslagen: 1209.00, woningcorporatie: 69.91, waterschap: 44.41 },
    { month: '2026-06', bdtoeslagen: 950.00, woningcorporatie: 44.91, waterschap: 19.41 },
    { month: '2026-07', bdtoeslagen: 691.00, woningcorporatie: 19.91 },
    { month: '2026-08', bdtoeslagen: 432.00 },
    { month: '2026-09', bdtoeslagen: 173.00 },
  ];
}

export function getSeries() {
  return [
    {
      type: "area",
      xKey: "month",
      yKey: "bdtoeslagen",
      yName: "BD Toeslagen",
      stacked: true,
    },
    {
      type: "area",
      xKey: "month",
      yKey: "smaal",
      yName: "Smaal",
      stacked: true,
    },
    {
      type: "area",
      xKey: "month",
      yKey: "infomedics",
      yName: "Infomedics",
      stacked: true,
    },
    {
      type: "area",
      xKey: "month",
      yKey: "flanderijn",
      yName: "Flanderijn",
      stacked: true,
    },
    {
      type: "area",
      xKey: "month",
      yKey: "woningcorporatie",
      yName: "Woningcorporatie",
      stacked: true,
    },
    {
      type: "area",
      xKey: "month",
      yKey: "waterschap",
      yName: "Waterschap",
      stacked: true,
    },
    {
      type: "area",
      xKey: "month",
      yKey: "tribuut",
      yName: "Tribuut",
      stacked: true,
    },

  ];
}
