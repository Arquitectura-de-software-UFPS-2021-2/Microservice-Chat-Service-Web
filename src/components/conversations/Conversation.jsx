import axios from "axios";
import { useEffect, useState } from "react";
import "./conversation.css";

export default function Conversation({ conversation, currentUser }) {
  const [user, setUser] = useState(null);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser._id);

    const getUser = async () => {
      try {
        const res = await axios("/users?userId=" + friendId);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation]);

  return (
    <>
    <ul className="rounded-md">
      <li className="cursor-pointer bg-red-100 hover:bg-red-300 p-2 rounded-md mb-2 flex items-center">
        <img className="conversationImg" src={ user?.profilePicture ? PF + user.profilePicture : PF + "person/noAvatar.png"}/>
        <span>{user?.username}</span>
      </li>
    </ul>
    </>
  );
}
