import React, { useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Box } from "@mui/material";
import styled from "@emotion/styled";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],

  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],

  ["clean"],
];

const Component = styled.div`
  background: #f5f5f5;
  flex-grow: 1; 
  padding: 10px;

  @media (max-width: 768px) {
    padding: 5px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh; 
`;

const Editor = () => {
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const { id } = useParams();

  useEffect(() => {
    const quillServer = new Quill("#editor-container", {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
    });
    quillServer.disable();
    quillServer.setText("Loading document...");
    setQuill(quillServer);
  }, []);

  useEffect(() => {
    const socketServer = io("https://real-time-doceditor.onrender.com");
    setSocket(socketServer);
    return () => {
      socketServer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket === null && quill === null) return;

    const handleChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket && socket.emit("send-changes", delta);
    };
    quill && quill.on("text-change", handleChange);

    return () => {
      quill && quill.off("text-change", handleChange);
    };
  }, [quill, socket]);

  useEffect(() => {
    if (socket === null && quill === null) return;

    const handleChange = (delta) => {
      quill.updateContents(delta);
    };
    socket && socket.on("recieve-changes", handleChange);

    return () => {
      socket && socket.off("recieve-changes", handleChange);
    };
  }, [quill, socket]);

  useEffect(() => {
    if (quill === null || socket === null) return;

    socket &&
      socket.once("load-document", (document) => {
        quill && quill.setContents(document);
        quill && quill.enable();
      });

    socket && socket.emit("get-document", id);
  }, [quill, socket, id]);

useEffect(()=>{
  if(socket===null || quill===null)return;
  const interval = setInterval(()=>{
socket.emit('save-document',quill.getContents())
  },2000)

  return ()=>{
    clearInterval(interval)
  }
},[socket,quill])

  return (
    <Container>
    <Component>
<Box id="editor-container" className="editor-wrapper" style={{ maxWidth: '800px' }}></Box>
    </Component>
    </Container>
  );
};

export default Editor;
