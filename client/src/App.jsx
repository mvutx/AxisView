
import { useEffect, useState } from "react";
import {
  Bell,
  User,
  Pause,
  Play,
  Activity,
  Wallet,
  TrendingUp,
  History,
  Settings,
  LayoutDashboard,
} from "lucide-react";

import MarketChart from "./components/MarketChart";
import TradingAssistant from "./components/TradingAssistant";
import "./App.css";

const marketItems = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", decimals: 5, movement: 0.0002 },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", decimals: 5, movement: 0.0002 },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", decimals: 3, movement: 0.03 },
  { symbol: "XAU/USD", name: "Gold / US Dollar", decimals: 2, movement: 1 },
];

const navigationItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Markets", icon: TrendingUp },
  { name: "My Wallet", icon: Wallet },
  { name: "Trade History", icon: History },
  { name: "Settings", icon: Settings },
];

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [pair, setPair] = useState("EUR/USD");
  const [marketPaused, setMarketPaused] = useState(false);

  const [prices, setPrices] = useState({
    "EUR/USD": 1.08500,
    "GBP/USD": 1.27000,
    "USD/JPY": 149.500,
    "XAU/USD": 2650.00,
  });

  const [demoBalance, setDemoBalance] = useState(10000);
  const [lots, setLots] = useState("0.10");
  const [positions, setPositions] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);

  // Simulated market prices
  useEffect(() => {
    if (marketPaused) return undefined;

    const timer = setInterval(() => {
      setPrices((previous) => {
        const updated = { ...previous };

        marketItems.forEach((market) => {
          const movement =
            (Math.random() - 0.5) * market.movement;

          updated[market.symbol] = Number(
            (updated[market.symbol] + movement).toFixed(
              market.decimals
            )
          );
        });

        return updated;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [marketPaused]);

  // Simplified demo profit calculation
  const calculateProfit = (position) => {
    const currentPrice = prices[position.pair];

    const difference =
      position.side === "BUY"
        ? currentPrice - position.entryPrice
        : position.entryPrice - currentPrice;

    const market = marketItems.find(
      (item) => item.symbol === position.pair
    );

    const multiplier =
      market?.symbol === "XAU/USD" ? 100 : 100000;

    return (
      (difference / position.entryPrice) *
      multiplier *
      position.lots
    );
  };

  // Open demo trade
  const openTrade = (side) => {
    const lotSize = Number(lots);

    if (
      !Number.isFinite(lotSize) ||
      lotSize < 0.01 ||
      lotSize > 10
    ) {
      alert("Enter a lot size between 0.01 and 10.");
      return;
    }

    const newPosition = {
      id: `${Date.now()}-${Math.random()}`,
      pair,
      side,
      lots: lotSize,
      entryPrice: prices[pair],
      openedAt: new Date().toLocaleString(),
    };

    setPositions((previous) => [...previous, newPosition]);
  };

  // Close demo trade
  const closeTrade = (position) => {
    const closingPrice = prices[position.pair];
    const profit = calculateProfit(position);

    const closedTrade = {
      ...position,
      closingPrice,
      profit,
      closedAt: new Date().toLocaleString(),
    };

    setDemoBalance((previous) => previous + profit);

    setTradeHistory((previous) => [
      closedTrade,
      ...previous,
    ]);

    setPositions((previous) =>
      previous.filter((item) => item.id !== position.id)
    );
  };

  const totalOpenProfit = positions.reduce(
    (total, position) => total + calculateProfit(position),
    0
  );

  const formatPrice = (symbol) => {
    const market = marketItems.find(
      (item) => item.symbol === symbol
    );

    return prices[symbol].toFixed(market?.decimals ?? 5);
  };

  return (
    <div className="app">
      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">
          <div className="brand-area">
            <h2 className="logo">
              traders<span>.vuti</span>
            </h2>
            <p>Demo Trading Terminal</p>
          </div>

          <div className="top-actions">
            <select
              className="nav-dropdown"
              value={activeTab}
              onChange={(event) => setActiveTab(event.target.value)}
              aria-label="Navigate website"
            >
              {navigationItems.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>

            <span className="demo-status">DEMO ACCOUNT</span>
            <Bell size={19} />

            <div className="profile">
              <User size={18} />
              <span>My Account</span>
            </div>
          </div>
        </header>

        {/* ACCOUNT SUMMARY */}
        <section className="summary-strip">
          <div className="summary-item">
            <span>Demo balance</span>
            <strong>
              ${demoBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>

          <div className="summary-item">
            <span>Open trade P&amp;L</span>
            <strong className={totalOpenProfit >= 0 ? "positive" : "negative"}>
              {totalOpenProfit >= 0 ? "+" : "-"}$
              {Math.abs(totalOpenProfit).toFixed(2)}
            </strong>
          </div>

          <div className="summary-item">
            <span>Open positions</span>
            <strong>{positions.length}</strong>
          </div>

          <div className="summary-item">
            <span>Market status</span>
            <strong className={marketPaused ? "negative" : "positive"}>
              {marketPaused ? "Paused" : "Simulated"}
            </strong>
          </div>
        </section>

        {/* MAIN WORKSPACE */}
        <section className="workspace-grid">

          {/* LEFT COLUMN */}
          <div className="workspace-main">

            {/* CHART */}
            <section className="panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h3>{pair} Price Chart</h3>
                  <p className="chart-description">
                    Simulated prices · Demo environment
                  </p>
                </div>

                <button
                  className="market-pause-button"
                  onClick={() => setMarketPaused((previous) => !previous)}
                >
                  {marketPaused ? <Play size={15} /> : <Pause size={15} />}
                  {marketPaused ? "Resume" : "Pause"}
                </button>
              </div>

              <div className="chart-pair-selector">
                {marketItems.map((market) => (
                  <button
                    key={market.symbol}
                    className={pair === market.symbol ? "selected" : ""}
                    onClick={() => setPair(market.symbol)}
                  >
                    {market.symbol}
                  </button>
                ))}
              </div>

              <div className="current-market-price">
                <span>Current simulated price</span>
                <strong>{formatPrice(pair)}</strong>
              </div>

              <MarketChart pair={pair} />
            </section>

            {/* BUY / SELL */}
            <section className="panel trading-section">
              <div className="panel-heading">
                <div>
                  <h3>Place a Demo Trade</h3>
                  <p className="chart-description">
                    Practice only · No real money involved
                  </p>
                </div>
                <span className="demo-status">DEMO</span>
              </div>

              <div className="trade-form">
                <div className="trade-input">
                  <label htmlFor="trade-pair">Trading pair</label>
                  <select
                    id="trade-pair"
                    value={pair}
                    onChange={(event) => setPair(event.target.value)}
                  >
                    {marketItems.map((market) => (
                      <option key={market.symbol} value={market.symbol}>
                        {market.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="trade-input">
                  <label htmlFor="lot-size">Lot size</label>
                  <input
                    id="lot-size"
                    type="number"
                    min="0.01"
                    max="10"
                    step="0.01"
                    value={lots}
                    onChange={(event) => setLots(event.target.value)}
                  />
                </div>

                <div className="trade-input">
                  <label>Entry price</label>
                  <h3>{formatPrice(pair)}</h3>
                </div>
              </div>

              <div className="trade-buttons">
                <button
                  className="buy-button"
                  onClick={() => openTrade("BUY")}
                >
                  BUY
                </button>

                <button
                  className="sell-button"
                  onClick={() => openTrade("SELL")}
                >
                  SELL
                </button>
              </div>

              <p className="trade-note">
                Demo trades use simulated prices and simplified profit estimates.
              </p>
            </section>

            {/* OPEN POSITIONS */}
            <section className="panel positions-panel">
              <div className="panel-heading">
                <h3>Open Positions ({positions.length})</h3>
                <span>Demo trades</span>
              </div>

              <div className="compact-trade-list">
                {positions.length === 0 ? (
                  <p className="empty-positions">
                    You have no open demo trades. Place a BUY or SELL trade to practise.
                  </p>
                ) : (
                  positions.map((position) => {
                    const profit = calculateProfit(position);

                    return (
                      <div className="position-row" key={position.id}>
                        <div className="position-info">
                          <strong>
                            {position.pair} · {position.side}
                          </strong>
                          <small>
                            {position.lots} lots · Entry: {position.entryPrice}
                          </small>
                        </div>

                        <div className="position-result">
                          <strong className={profit >= 0 ? "profit" : "loss"}>
                            {profit >= 0 ? "+" : "-"}$
                            {Math.abs(profit).toFixed(2)}
                          </strong>

                          <button
                            className="close-trade-button"
                            onClick={() => closeTrade(position)}
                          >
                            Close trade
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN */}
          <aside className="workspace-sidebar">

            {/* MARKET WATCH - NOW FIRST */}
            <section className="panel market-panel">
              <div className="panel-heading">
                <h3>Market Watch</h3>
                <span>Demo prices</span>
              </div>

              {marketItems.map((market) => (
                <button
                  key={market.symbol}
                  className={`market-row ${
                    pair === market.symbol ? "market-selected" : ""
                  }`}
                  onClick={() => setPair(market.symbol)}
                >
                  <div>
                    <strong>{market.symbol}</strong>
                    <small>{market.name}</small>
                  </div>
                  <strong>{formatPrice(market.symbol)}</strong>
                </button>
              ))}
            </section>

            {/* AI TRADING ASSISTANT - NOW SECOND */}
            <TradingAssistant
              pair={pair}
              price={prices[pair]}
            />

            {/* QUICK INFORMATION - REMAINS THIRD */}
            <section className="panel quick-panel">
              <h3>Quick Information</h3>

              <div className="analysis-item">
                <span>Selected pair</span>
                <strong>{pair}</strong>
              </div>

              <div className="analysis-item">
                <span>Closed trades</span>
                <strong>{tradeHistory.length}</strong>
              </div>

              <p className="disclaimer">
                Prices, balances, signals and trades are simulated.
                Real trading, deposits and withdrawals are not connected.
              </p>
            </section>

          </aside>
        </section>

        {/* CLOSED TRADE HISTORY */}
        <section className="panel recent-history">
          <div className="panel-heading">
            <h3>Recent Closed Demo Trades</h3>
            <span>{tradeHistory.length} trades</span>
          </div>

          {tradeHistory.length === 0 ? (
            <p className="empty-positions">
              Your closed demo trades will appear here.
            </p>
          ) : (
            tradeHistory.slice(0, 5).map((trade) => (
              <div className="position-row" key={trade.id}>
                <div>
                  <strong>
                    {trade.pair} · {trade.side}
                  </strong>
                  <small>Closed: {trade.closedAt}</small>
                </div>

                <strong className={trade.profit >= 0 ? "profit" : "loss"}>
                  {trade.profit >= 0 ? "+" : "-"}$
                  {Math.abs(trade.profit).toFixed(2)}
                </strong>
              </div>
            ))
          )}
        </section>

        <footer className="app-footer">
          <Activity size={15} />
          <span>traders.vti · Demo environment only</span>
        </footer>

      </main>
    </div>
  );
}

export default App;
