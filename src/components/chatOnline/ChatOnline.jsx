import axios from "axios";
import { useEffect, useState } from "react";
import "./chatOnline.css";

export default function ChatOnline({ onlineUsers, currentId, setCurrentChat, setLoadConversations }) {
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    const getFriends = async () => {
      setFriends(onlineUsers);
    };

    getFriends();
  }, [onlineUsers]);

  useEffect(() => {
    setOnlineFriends(friends.filter((f) => onlineUsers.includes(f.codigo)));
  }, [friends, onlineUsers]);

  const handleClick = async (user) => {
    try {
      const res = await axios("/users?email=" + user.email);
      if (Object.keys(res.data).length === 0) {
        const res2 = await axios.post("/auth/register", {
          username: user.name + "_" + user.last_name,
          email: user.email,
          password: "123456"
        });
        if (res2.data) {
          const resFind = await axios.get(
            `/conversations/find/${currentId}/${res2.data._id}`
          );
          if (resFind.data) {
            setCurrentChat(resFind.data);
          } else {
            await axios.post(`/conversations`, {
              "senderId": currentId,
              "receiverId": res2.data._id + ""
            });
            setLoadConversations(true)
          }
        } else {
          alert("No se ha podido crear el usuario")
        }
      } else {
        const resFind = await axios.get(
          `/conversations/find/${currentId}/${res.data._id}`
        );
        if (resFind.data) {
          setCurrentChat(resFind.data);
        } else {
          await axios.post(`/conversations`, {
            "senderId": currentId,
            "receiverId": res.data._id + ""
          });
          setLoadConversations(true)
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chatOnline bg-white">
      {friends.map((o) => (
        <div className="chatOnlineFriend p-1" onClick={() => handleClick(o)}>
          <div className="chatOnlineImgContainer">
            <img
              className="chatOnlineImg"
              src={
                o?.profilePicture
                  ? PF + o.profilePicture
                  : PF + "person/noAvatar.png"
              }
              alt=""
            />
            <div className="chatOnlineBadge"></div>
          </div>
          <span className="chatOnlineName">{o?.name}</span>
        </div>
      ))}
    </div>
  );
}
