import { useState, useEffect } from "react";
import "./App.css";
import { FindTimezone } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

function App() {
  const [resultTz, setResultTz] = useState<Array<main.TzResponse>>([]);
  const [copiedTz, setCopiedTz] = useState<string | null>(null);

  function findTimezone(keyword: string) {
    FindTimezone(keyword)
      .then((data) => {
        setResultTz(data);
      })
      .catch();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedTz(text);

    setTimeout(() => setCopiedTz(null), 500);
  }

  useEffect(() => {
    function handleCtrlA(event: KeyboardEvent) {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName !== "INPUT") {
        event.preventDefault();
      }
    }

    document.addEventListener("keydown", handleCtrlA);
    return () => document.removeEventListener("keydown", handleCtrlA);
  }, []);

  return (
    <div id="App">
      <div id="result" className="result">
        <ul>
          {resultTz.length > 0 &&
            resultTz.map((item) => (
              <li
                key={item.tz_code}
                onClick={() => copyToClipboard(item.tz_code)}
                className="timezone-item"
              >
                {copiedTz === item.tz_code ? (
                  <span className="copied">Copied!</span>
                ) : (
                  <>
                    {item.tz_name} - {item.tz_code}
                  </>
                )}
              </li>
            ))}
        </ul>
      </div>
      <div id="input" className="input-box">
        <input
          id="name"
          className="input"
          onChange={(e) => findTimezone(e.target.value ?? "")}
          autoComplete="off"
          name="input"
          type="text"
          autoFocus={true}
        />
      </div>
    </div>
  );
}

export default App;
