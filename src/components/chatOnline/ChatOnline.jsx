import axios from "axios";
import { useEffect, useState } from "react";
import "./chatOnline.css";

export default function ChatOnline({ onlineUsers, currentId, setCurrentChat, setLoadConversations }) {
  const [friends, setFriends] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    const getFriends = async () => {
      setFriends(onlineUsers);
    };

    getFriends();
  }, [onlineUsers]);

  const handleClick = async (user) => {
    try {
      const res = await axios("http://34.202.12.23/users?email=" + user.email);
      if (Object.keys(res.data).length === 0) {
        const res2 = await axios.post("http://34.202.12.23/auth/register", {
          username: user.name + "_" + user.last_name,
          email: user.email,
          password: "123456"
        });
        if (res2.data) {
          const resFind = await axios.get(
            `http://34.202.12.23/conversations/find/${currentId}/${res2.data._id}`
          );
          if (resFind.data) {
            setCurrentChat(resFind.data);
          } else {
            await axios.post(`http://34.202.12.23/conversations`, {
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
          `http://34.202.12.23/conversations/find/${currentId}/${res.data._id}`
        );
        if (resFind.data) {
          setCurrentChat(resFind.data);
        } else {
          await axios.post(`http://34.202.12.23/conversations`, {
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
              alt="profile"
            />
            <div className="chatOnlineBadge"></div>
          </div>
          <span className="chatOnlineName">{o?.name}</span>
        </div>
      ))}
    </div>
  );
}
