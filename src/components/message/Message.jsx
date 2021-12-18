import "./message.css";
import { format } from "timeago.js";
import { useState, useEffect } from "react";

export default function Message({ message, own }) {

  const [haveImage, setHaveImage] = useState(false)
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    console.log(message);
    const split = message.text.split(".")
    const ext = split[split.length - 1]
    if (ext && (ext === "jpg" || ext === "png")) {
      setHaveImage(true);
    }
  }, [message])

  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        {
          haveImage ?
            <img className="postImg w-52" src={PF + message.text} alt="" />
            : <p className="messageText w-3/6 mb-2 p-2 rounded-md bg-red-300">{message.text}</p>
        }

      </div>
      <div className="messageBottom text-xs">{format(message.createdAt)}</div>
    </div>
  );
}
