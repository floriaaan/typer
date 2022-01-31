import { AppLayout } from "../components/layouts/AppLayout";
import useTypingGame from "react-typing-game-hook";
import { useEffect, useState } from "react";
import { Octokit } from "@octokit/core";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/cjs/styles/hljs";

const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_PERSONAL_TOKEN,
});

export default function Game(props) {
  const [text, setText] = useState("Loading...");
  const [gist, setGist] = useState(null);
  const {
    states: {
      charsState,
      length,
      currIndex,
      currChar,
      correctChar,
      errorChar,
      phase,
      startTime,
      endTime,
    },
    actions: { insertTyping, resetTyping, deleteTyping },
  } = useTypingGame(text);

  const handleKey = (key) => {
    if (key === "Escape") {
      resetTyping();
    } else if (key === "Backspace") {
      deleteTyping(false);
    } else if (key.length === 1) {
      insertTyping(key);
    }
  };

  const getGist = async (type = "application/javascript") => {
    try {
      const response = await octokit.request("GET /gists/public");
      let gistRemote = response.data.find((gist) => {
        let files = Object.values(gist.files);
        return files[0]?.type === type;
      });
      console.log(gistRemote);
      setGist(gistRemote);
      let files = Object.values(gistRemote.files);
      let rawUrl = files[0]?.raw_url;
      const responseContent = await fetch(rawUrl);
      const content = await responseContent.text();
      setText(
        content
          .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")
          .replace(/^\s*[\r\n]/gm, "")
      );
    } catch (error) {
      console.log(error);
      setText(
        error.message || "An error occurred when retrieving the typing block."
      );
    }
  };

  useEffect(() => {
    if (gist)
      document.title = `Typing ${
        Object.values(gist?.files)[0].filename || "a Javascript file"
      } - Typer`;
    getGist();
  }, [gist]);

  const highlightLine = (lineNumber, markLines, color = "#FFDB81") => {
    // only works when showLineNumbers and wrapLines are both enabled
    const style = { display: "block", width: "fit-content" };
    if (markLines.includes(lineNumber)) {
      style.backgroundColor = color;
    }
    return { style };
  };

  return (
    <AppLayout>
      <div
        className="container m-4 mx-auto typing-test rounded-xl"
        onKeyDown={(e) => {
          handleKey(e.key);
          e.preventDefault();
        }}
        tabIndex={0}
      >
        <SyntaxHighlighter
          className="rounded-xl syntax-highlighter"
          language="javascript"
          style={vs2015}
          useInlineStyles={true}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={(line) =>
            highlightLine(line, [] /* markLines */, "#FFDB81")
          }
        >
          {/* {text.split("").map((char, index) => {
            let state = charsState[index];
            let color = state === 0 ? "black" : state === 1 ? "green" : "red";
            return (
              <span
                key={char + index}
                style={{ color }}
                className={currIndex + 1 === index ? "curr-letter" : ""}
              >
                {char}
              </span>
            );
          })} */}
          {text}
        </SyntaxHighlighter>
      </div>
      <pre>
        {JSON.stringify(
          {
            startTime,
            endTime,
            length,
            currIndex,
            currChar,
            correctChar,
            errorChar,
            phase,
          },
          null,
          2
        )}
      </pre>
    </AppLayout>
  );
}
