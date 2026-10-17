type OrderChartPoint = {
  converted: number;
  label: string;
  orders: number;
};

type OrdersComparisonChartProps = {
  data: OrderChartPoint[];
};

const chartWidth = 720;
const chartHeight = 260;
const chartPadding = { bottom: 34, left: 48, right: 18, top: 18 };

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function getChartPoints(
  data: OrderChartPoint[],
  key: "converted" | "orders",
  maxValue: number
) {
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  return data.map((point, index) => {
    const x =
      data.length === 1
        ? chartPadding.left + plotWidth / 2
        : chartPadding.left + (index / (data.length - 1)) * plotWidth;
    const y =
      chartPadding.top +
      plotHeight - (point[key] / maxValue) * plotHeight;

    return { ...point, x, y };
  });
}

function getPolylinePoints(
  points: Array<{ x: number; y: number }>
) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function OrdersComparisonChart({ data }: OrdersComparisonChartProps) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => [point.orders, point.converted])
  );
  const ordersPoints = getChartPoints(data, "orders", maxValue);
  const convertedPoints = getChartPoints(data, "converted", maxValue);
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <header>
        <h2 className="text-sm font-medium sm:text-base">
          Pedidos e convertidos
        </h2>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-primary"
            />
            Pedidos
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-muted-foreground"
            />
            Convertidos
          </span>
        </div>
      </header>

      {data.length > 0 ? (
        <div className="mt-5 h-64 w-full">
          <svg
            aria-label="Pedidos e pedidos convertidos por mês"
            className="h-full w-full"
            role="img"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {yTicks.map((tick) => {
              const y = chartPadding.top + plotHeight - tick * plotHeight;

              return (
                <g key={tick}>
                  <line
                    stroke="var(--border)"
                    strokeOpacity="0.7"
                    x1={chartPadding.left}
                    x2={chartWidth - chartPadding.right}
                    y1={y}
                    y2={y}
                  />
                  <text
                    fill="var(--muted-foreground)"
                    fontSize="11"
                    textAnchor="end"
                    x={chartPadding.left - 8}
                    y={y + 4}
                  >
                    {formatNumber(Math.round(maxValue * tick))}
                  </text>
                </g>
              );
            })}

            <polyline
              fill="none"
              points={getPolylinePoints(ordersPoints)}
              stroke="var(--primary)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            <polyline
              fill="none"
              points={getPolylinePoints(convertedPoints)}
              stroke="var(--muted-foreground)"
              strokeDasharray="7 5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />

            {ordersPoints.map((point) => (
              <circle
                cx={point.x}
                cy={point.y}
                fill="var(--primary)"
                key={`orders-${point.label}`}
                r="3.5"
              >
                <title>{`${point.label}: ${formatNumber(point.orders)} pedidos`}</title>
              </circle>
            ))}
            {convertedPoints.map((point) => (
              <circle
                cx={point.x}
                cy={point.y}
                fill="var(--muted-foreground)"
                key={`converted-${point.label}`}
                r="3.5"
              >
                <title>{`${point.label}: ${formatNumber(
                  point.converted
                )} convertidos`}</title>
              </circle>
            ))}

            {data.map((point, index) => {
              const x =
                data.length === 1
                  ? chartPadding.left + plotWidth / 2
                  : chartPadding.left +
                    (index / (data.length - 1)) * plotWidth;

              return (
                <text
                  fill="var(--muted-foreground)"
                  fontSize="11"
                  key={point.label}
                  textAnchor="middle"
                  x={x}
                  y={chartHeight - 9}
                >
                  {point.label}
                </text>
              );
            })}
          </svg>
        </div>
      ) : (
        <p className="mt-5 rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Não há pedidos no período selecionado.
        </p>
      )}

      <table className="sr-only">
        <caption>Pedidos e convertidos por mês</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Pedidos</th>
            <th scope="col">Convertidos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{formatNumber(point.orders)}</td>
              <td>{formatNumber(point.converted)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
