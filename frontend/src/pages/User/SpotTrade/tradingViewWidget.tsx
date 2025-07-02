import  { useEffect, useRef } from "react";

function TradingViewWidget({ coin }: { coin: string }) {
  const container = useRef<any>();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${coin}",
        "interval": "5",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": false,
        "calendar": true,
        "hide_volume": true,
        "support_host": "https://www.tradingview.com"
      }`;

    if (container.current) {
      while (container.current.firstChild) {
        container.current.removeChild(container.current.firstChild);
      }
      container.current.appendChild(script);
    }
  }, [coin]);

  return (
    <div className="tradingview-widget-wrapper">
      <div className="tradingview-widget-container" ref={container}>
        <div className="tradingview-widget-container__widget" />
        <div className="tradingview-widget-copyright">
          <a
            href="https://www.tradingview.com/"
            rel="noopener nofollow"
            target="_blank"
          >
            <span className="blue-text">Crypto Charts by TradingView</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default TradingViewWidget;
