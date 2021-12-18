import "./messenger.css";
import {
  PermMedia, Cancel
} from "@material-ui/icons";
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [loadConversations, setLoadConversations] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [visibleConversations, setVisibleConversations] = useState([]);
  const [file, setFile] = useState(null);
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();

  useEffect(() => {
    socket.current = io("ws://44.201.137.13:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", user._id);
  }, [user]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await axios.post("http://18.235.152.56/students", {
          "api_token": "5TDk48EiKiKMTaUyRAWNTz35Dilk4XS2LYrDDJmG36AoQq8TzFhjfGZCpw0L1wF0mlxp0BXfwbcjbKxXhAaBHDv9bhH6l4qudsCJ6zT4wcHv9pBHEVS1X2tEgXF5GulcCrA9Hic8jCZcECVpfl4yvK"
        });
        setUsers(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    if (users.length === 0) {
      getUsers();
    } else {
      setVisibleUsers(users.slice(0, 5));
    }
  }, [users]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/conversations/" + user._id);
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    if (loadConversations) {
      getConversations();
      setLoadConversations(false)
    } else {
      setVisibleConversations(conversations);
    }
  }, [user._id, conversations, loadConversations]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    if (newMessage === "" && !file) {
      return
    }
    if (file) {
      const data = new FormData();
      const fileName = Date.now() + file.name;
      data.append("name", fileName);
      data.append("file", file);
      try {
        await axios.post("/upload", data);
        message.text = fileName
        const receiverId = currentChat.members.find(
          (member) => member !== user._id
        );

        socket.current.emit("sendMessage", {
          senderId: user._id,
          receiverId,
          text: fileName,
        });
        setFile(null)
      } catch (err) { }
    } else {
      const receiverId = currentChat.members.find(
        (member) => member !== user._id
      );

      socket.current.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        text: newMessage,
      });
    }

    try {
      const res = await axios.post("/messages", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlerSearch = (e) => {
    const search = e.target.value.toLowerCase();
    if (!search || search.length < 2) {
      setVisibleUsers(users.slice(0, 5));
      return;
    }
    setVisibleUsers(users.filter((user) =>
      user.email.toLowerCase().includes(search) || user.name.toLowerCase().includes(search) || user.last_name.toLowerCase().includes(search)))
  }

  const handlerSearchConversations = (e) => {
    const search = e.target.value.toLowerCase();
    if (!search || search.length < 2) {
      console.log(conversations)
      setVisibleConversations(conversations);
      return;
    }
    setVisibleConversations(conversations.filter((conversation) =>
      conversation.userName.toLowerCase().includes(search)))
  }

  return (
    <>
      <main className="messenger py-12 mx-auto w-5/6 bg-gray-100 flex">
        {/* <div className="chatMenu"> */}
        <aside className="chatMenu w-3/12 mr-4">
          <div className="rounded-md p-2 flex items-center bg-red-700 mb-4">
            <p className="mr-4 text-white">Buscar:</p>
            <input onChange={handlerSearchConversations} placeholder="Search for friends" className="rounded-md resize-none h-8 py-1 px-3 w-full" />
          </div>
          <h4 className="bg-white pt-2 text-center font-bold mt-4">Chats</h4>
          <div className="bg-white p-4">
            {visibleConversations.map((c) => (
              <div onClick={() => setCurrentChat(c)}>
                <Conversation conversation={c} currentUser={user} />
              </div>
            ))}
          </div>
        </aside>
        <section className="chatBox w-9/12 flex">
          <article className="chatBoxWrapper bg-red-100 p-6 rounded-md w-5/6 mr-4">
            {currentChat ? (
              <>
                <div className="chatBoxTop chat-scroll mt-6 h-96 overflow-y-scroll">
                  {messages.map((m) => (
                    <div className="mr-4" ref={scrollRef}>
                      <Message message={m} own={m.sender === user._id} />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom flex items-center w-full justify-between mt-4">
                  <textarea
                    className="chatMessageInput h-10 w-full resize-none py-1 px-2"
                    placeholder="write something..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  {file && (
                    <div className="shareImgContainer ml-2">
                      <img className="shareImg w-60" src={URL.createObjectURL(file)} alt="" />
                      <Cancel className="shareCancelImg" onClick={() => setFile(null)} />
                    </div>
                  )}
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    <i class="cursor-pointer hover:text-black transform duration-200 hover:scale-110 text-red-800 text-2xl fas fa-paper-plane mx-2"></i>
                  </button>
                  <label htmlFor="file" className="shareOption">
                    <PermMedia htmlColor="black" className="cursor-pointer shareIcon transform duration-200 hover:scale-110" />
                    {/* <span className="shareOptionText">Photo or Video</span> */}
                    <input
                      style={{ display: "none" }}
                      type="file"
                      id="file"
                      accept=".png,.jpeg,.jpg"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </label>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start a chat.
              </span>
            )}
          </article>

          <article className="chatOnline w-3/12 mr-4">
            <div className="chatOnlineWrapper rounded-md p-2 flex items-center bg-red-700 mb-4">
              <p className="mr-4 text-white">Agregar:</p>
              <input onChange={handlerSearch} placeholder="Buscar personas" className="chatMenuInput rounded-md resize-none h-8 py-1 px-3 w-full" />
            </div>
            <ChatOnline
              onlineUsers={visibleUsers}
              currentId={user._id}
              setCurrentChat={setCurrentChat}
              setLoadConversations={setLoadConversations}
            />
          </article>

        </section>
      </main>
    </>
  );
}
