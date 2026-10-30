
import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  ColorType,
} from "lightweight-charts";

function MarketChart({ pair }) {
  const chartContainer = useRef(null);

  useEffect(() => {
    const container = chartContainer.current;

    if (!container) return;

    const basePrices = {
      "EUR/USD": 1.08500,
      "GBP/USD": 1.27000,
      "USD/JPY": 149.500,
      "XAU/USD": 2650.00,
    };

    const base = basePrices[pair] || 1.08500;

    const step = pair === "XAU/USD"
      ? 1.5
      : pair === "USD/JPY"
      ? 0.04
      : 0.0003;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 330,

      layout: {
        background: {
          type: ColorType.Solid,
          color: "#13171d",
        },
        textColor: "#9299a4",
      },

      grid: {
        vertLines: { color: "#252a30" },
        horzLines: { color: "#252a30" },
      },

      rightPriceScale: {
        borderColor: "#343b45",
      },

      timeScale: {
        borderColor: "#343b45",
        timeVisible: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#20b486",
      downColor: "#e05b64",
      borderVisible: false,
      wickUpColor: "#20b486",
      wickDownColor: "#e05b64",
    });

    const now = Math.floor(Date.now() / 1000);
    const currentMinute = Math.floor(now / 60) * 60;

    let previousClose = base;
    const candleData = [];

    for (let i = 40; i >= 0; i--) {
      const open = previousClose;
      const close = open + (Math.random() - 0.5) * step;

      const high = Math.max(open, close) + Math.random() * step * 0.3;
      const low = Math.min(open, close) - Math.random() * step * 0.3;

      candleData.push({
        time: currentMinute - i * 60,
        open,
        high,
        low,
        close,
      });

      previousClose = close;
    }

    candleSeries.setData(candleData);

    let activeCandle = { ...candleData[candleData.length - 1] };
    let activeMinute = currentMinute;

    const timer = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const newMinute = Math.floor(currentTime / 60) * 60;

      const movement = (Math.random() - 0.5) * step * 0.35;

      const newPrice = Math.max(
        0.00001,
        activeCandle.close + movement
      );

      if (newMinute > activeMinute) {
        activeMinute = newMinute;

        activeCandle = {
          time: newMinute,
          open: activeCandle.close,
          high: Math.max(activeCandle.close, newPrice),
          low: Math.min(activeCandle.close, newPrice),
          close: newPrice,
        };
      } else {
        activeCandle = {
          ...activeCandle,
          high: Math.max(activeCandle.high, newPrice),
          low: Math.min(activeCandle.low, newPrice),
          close: newPrice,
        };
      }

      candleSeries.update(activeCandle);
    }, 2000);

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        chart.applyOptions({
          width: entries[0].contentRect.width,
        });
      }
    });

    resizeObserver.observe(container);

    return () => {
      clearInterval(timer);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [pair]);

  return <div ref={chartContainer} className="market-chart" />;
}

export default MarketChart;
