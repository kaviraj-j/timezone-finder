import { useState, useEffect } from "react";
import "./App.css";
import { FindTimezone, SetTimezone } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

function App() {
  const [resultTz, setResultTz] = useState<Array<main.TzResponse>>([]);
  const [copiedTz, setCopiedTz] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: main.TzResponse | null;
  } | null>(null);

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

  function handleRightClick(event: React.MouseEvent, item: main.TzResponse) {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, item });
  }

  function handleSetTimezone(timezone: string) {
    if (!timezone) {
      alert("Invalid Timezone!!");
      return;
    }
    SetTimezone(timezone)
      .then((data) => {
        if (data.includes("Success")) {
          alert("Timezone set successfully");
        } else {
          alert("Failed" + data);
        }
      })
      .catch((e) => {
        alert("Error in setting timezone");
      });
    return;
  }

  useEffect(() => {
    function handleGlobalClick() {
      if (contextMenu) {
        setContextMenu(null);
      }
    }

    function handleCtrlA(event: KeyboardEvent) {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName !== "INPUT") {
        event.preventDefault();
      }
    }

    document.addEventListener("click", handleGlobalClick);
    document.addEventListener("keydown", handleCtrlA);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("keydown", handleCtrlA);
    };
  }, [contextMenu]);

  return (
    <div id="App">
      <div id="result" className="result">
        <ul>
          {resultTz.length > 0 &&
            resultTz.map((item) => (
              <li
                key={item.tz_code}
                onClick={() => copyToClipboard(item.tz_code)}
                onContextMenu={(e) => handleRightClick(e, item)}
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

      {contextMenu && contextMenu.item && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div onClick={() => copyToClipboard(contextMenu.item!.tz_name)}>
            Copy Timezone Name
          </div>
          <div onClick={() => copyToClipboard(contextMenu.item!.tz_code)}>
            Copy Timezone Code
          </div>
          <div onClick={() => handleSetTimezone(contextMenu.item!.tz_code)}>
            Set System Timezone
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
