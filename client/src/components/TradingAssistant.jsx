
import { useEffect, useRef, useState } from "react";

import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Clock,
} from "lucide-react";

function TradingAssistant({ pair, price }) {
  const priceRef = useRef(price);

  const [history, setHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Keep the latest price available to the sampling timer
  priceRef.current = price;

  // Reset analysis when the selected pair changes
  useEffect(() => {
    setHistory([]);
    setLastUpdated(null);

    const samplePrice = () => {
      const currentPrice = priceRef.current;

      if (!Number.isFinite(currentPrice)) return;

      setHistory((previous) => [
        ...previous.slice(-4),
        currentPrice,
      ]);

      setLastUpdated(new Date());
    };

    // Take the first sample immediately
    samplePrice();

    // Then analyse at controlled 10-second intervals
    const timer = setInterval(samplePrice, 10000);

    return () => clearInterval(timer);
  }, [pair]);

  let signal = "COLLECTING DATA";
  let reason = "Waiting for enough price samples to analyse.";
  let changePercent = 0;
  let direction = "Analysing...";

  if (history.length >= 5) {
    const firstPrice = history[0];
    const lastPrice = history[history.length - 1];

    changePercent =
      ((lastPrice - firstPrice) / firstPrice) * 100;

    if (changePercent > 0.005) {
      signal = "BUY";
      direction = "Upward";
      reason =
        "The sampled prices show upward movement during the observation period. This is a demo trend signal, not a prediction.";
    } else if (changePercent < -0.005) {
      signal = "SELL";
      direction = "Downward";
      reason =
        "The sampled prices show downward movement during the observation period. This is a demo trend signal, not a prediction.";
    } else {
      signal = "HOLD";
      direction = "Sideways";
      reason =
        "The sampled prices have moved within a relatively small range. Waiting for a clearer direction may be preferable.";
    }
  }

  const signalIcon =
    signal === "BUY" ? (
      <TrendingUp size={25} />
    ) : signal === "SELL" ? (
      <TrendingDown size={25} />
    ) : (
      <Minus size={25} />
    );

  const signalClass =
    signal === "BUY"
      ? "signal-buy"
      : signal === "SELL"
      ? "signal-sell"
      : "signal-hold";

  return (
    <section className="panel assistant-panel">

      <div className="panel-heading">
        <div className="assistant-title">
          <BrainCircuit size={23} />

          <div>
            <h3>AI Trading Assistant</h3>
            <p className="chart-description">
              Demo market analysis
            </p>
          </div>
        </div>

        <span className="simulated-label">
          DEMO
        </span>
      </div>

      <div className="assistant-signal">
        <div className="signal-icon">
          {signalIcon}
        </div>

        <div>
          <small>Current Signal</small>

          <h2 className={signalClass}>
            {signal}
          </h2>

          <span>{pair}</span>
        </div>
      </div>

      <div className="assistant-details">

        <div className="analysis-item">
          <span>Market direction</span>
          <strong>{direction}</strong>
        </div>

        <div className="analysis-item">
          <span>Price change</span>
          <strong>
            {history.length < 5
              ? "--"
              : `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(4)}%`}
          </strong>
        </div>

        <div className="analysis-item">
          <span>Price samples</span>
          <strong>{history.length}/5</strong>
        </div>

        <div className="analysis-item">
          <span>Analysis interval</span>
          <strong>10 seconds</strong>
        </div>

      </div>

      <div className="assistant-explanation">
        <div className="explanation-heading">
          <Activity size={17} />
          <strong>Why this signal?</strong>
        </div>

        <p>{reason}</p>
      </div>

      <div className="assistant-update">
        <Clock size={15} />

        <span>
          Last analysed:{" "}
          {lastUpdated
            ? lastUpdated.toLocaleTimeString()
            : "Waiting for data"}
        </span>
      </div>

      <p className="assistant-disclaimer">
        This is a simple rule-based demo indicator using simulated
        prices. It is not a trained AI model, financial advice or
        a guarantee of trading results.
      </p>

    </section>
  );
}

export default TradingAssistant;
