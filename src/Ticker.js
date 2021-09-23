import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

function Ticker() {
  const [Volume, setVolume] = useState(null);
  const [low, setlow] = useState(null);
  const [high, sethigh] = useState(null);
  const [changePercent, setchangePercent] = useState(null);
  const [change, setchange] = useState(null);
  const [rate, setrate] = useState(null);
  const [isConnected, setisConnected] = useState(false);
  const [isNetConnected, setisNetConnected] = useState(false);

  const dispatch = useDispatch();

  let msg = JSON.stringify({
    event: "subscribe",
    channel: "ticker",
    symbol: "tBTCUSD",
  });

  let ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://api-pub.bitfinex.com/ws/2");

    setisNetConnected(navigator.onLine);

    let id;

    ws.current.addEventListener("open", () => {
      console.log("Connected.");
      setisConnected(true);
      ws.current.send(msg);
    });

    ws.current.addEventListener("message", (msg) => {
      msg = JSON.parse(msg.data);

      if (msg[1] === "hb" || msg.chanId) {
        id = msg[0] || msg.chanId;
        msg = [];
      }

      if (msg.length && msg[0] === id) {
        setVolume(msg[1][7].toFixed(3));
        sethigh(
          Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(msg[1][8].toFixed(2))
        );

        setlow(
          Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(msg[1][9].toFixed(2))
        );

        setchangePercent((msg[1][5] * 100).toFixed(2));

        setchange(msg[1][4].toFixed(2));

        setrate(
          Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(msg[1][2].toFixed(2))
        );

        dispatch({ type: "AddData", payload: msg });
      }
    });

    ws.current.addEventListener("close", () => {
      console.log("Connection lost.");
      setisConnected(false);
    });

    ws.current.addEventListener("error", (err) => console.log("ERROR : ", err));

    window.addEventListener("online", () => {
      console.log(
        "============================================online================================================="
      );
      window.location.reload();
      handleConnectionChange();
    });

    window.addEventListener("offline", () => {
      console.log(
        "============================================offline================================================="
      );
      ws.current.close();
      handleConnectionChange();
    });

    return () => {
      ws.current.close();
      window.removeEventListener("online", handleConnectionChange);
      window.removeEventListener("offline", handleConnectionChange);
    };
  }, [msg, dispatch]);

  const startConnection = () => {
    window.location.reload();
  };

  const closeConnection = () => {
    ws.current.close();
  };

  const handleConnectionChange = () => {
    if (navigator.onLine) setisNetConnected(true);
    else setisNetConnected(false);
  };

  return (
    <div className="ticker">
      <div className="ticker-body">
        <span>
          {isConnected && isNetConnected ? (
            <i className="fas fa-wifi rise fa-2x"></i>
          ) : (
            <i className="fas fa-wifi drop fa-2x"></i>
          )}
        </span>

        <div className="ticker-currency-icon">
          <img
            src="https://www.nicepng.com/png/full/436-4367241_bellswhitejonny-bitcoin-b-white-png.png"
            alt="currency-icon"
            width="35px"
            height="60px"
          />
          <div className="ticker-left">
            <div>
              <h2>BTC/USD</h2>
            </div>
            <div>
              <h3>VOL {Volume} BTC</h3>
            </div>
            <div>
              <h3>LOW {low} </h3>
            </div>
          </div>
        </div>
        <div>
          <div>
            <h3>{rate}</h3>
          </div>
          <div className={change < 0 ? "drop" : "rise"}>
            <h3>
              {change < 0 ? change * -1 : change}{" "}
              {change < 0 ? (
                <i className="fas fa-caret-down"></i>
              ) : (
                <i className="fas fa-caret-up"></i>
              )}{" "}
              ({changePercent < 0 ? changePercent * -1 : changePercent}%)
            </h3>
          </div>
          <div>
            <h3>HIGH {high}</h3>
          </div>
        </div>
      </div>
      <div className="button-box">
        <button onClick={startConnection}>Connect</button>
        <button onClick={closeConnection}>Disconnect</button>
      </div>
    </div>
  );
}

export default Ticker;
