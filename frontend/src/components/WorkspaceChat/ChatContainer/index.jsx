import { useState, useEffect, useContext } from "react";
import useUser from "@/hooks/useUser";
import showToast from "@/utils/toast";
import ChatHistory from "./ChatHistory";
import { CLEAR_ATTACHMENTS_EVENT, DndUploaderContext } from "./DnDWrapper";
import PromptInput, { PROMPT_INPUT_EVENT } from "./PromptInput";
import Workspace from "@/models/workspace";
import handleChat, { ABORT_STREAM_EVENT } from "@/utils/chat";
import { isMobile } from "react-device-detect";
import { SidebarMobileHeader } from "../../Sidebar";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import handleSocketResponse, {
  websocketURI,
  AGENT_SESSION_END,
  AGENT_SESSION_START,
} from "@/utils/chat/agent";
import DnDFileUploaderWrapper from "./DnDWrapper";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default function ChatContainer({ workspace, knownHistory = [] }) {
  const { threadSlug = null } = useParams();
  const [message, setMessage] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState(knownHistory);
  const [socketId, setSocketId] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const { files, parseAttachments } = useContext(DndUploaderContext);
  const { user } = useUser();
  const { createTask } = useCreateClickupTask(
    import.meta.env.VITE_CLICKUP_API_KEY
  );

  // Maintain state of message from whatever is in PromptInput
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const { listening, resetTranscript } = useSpeechRecognition({
    clearTranscriptOnListen: true,
  });

  // Emit an update to the state of the prompt input without directly
  // passing a prop in so that it does not re-render constantly.
  function setMessageEmit(messageContent = "") {
    setMessage(messageContent);
    window.dispatchEvent(
      new CustomEvent(PROMPT_INPUT_EVENT, { detail: messageContent })
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message || message === "") return false;
    const prevChatHistory = [
      ...chatHistory,
      {
        content: message,
        role: "user",
        attachments: parseAttachments(),
      },
      {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: message,
        animate: true,
      },
    ];

    if (listening) {
      // Stop the mic if the send button is clicked
      endTTSSession();
    }
    setChatHistory(prevChatHistory);
    setMessageEmit("");
    setLoadingResponse(true);
  };

  function endTTSSession() {
    SpeechRecognition.stopListening();
    resetTranscript();
  }

  const regenerateAssistantMessage = (chatId) => {
    const updatedHistory = chatHistory.slice(0, -1);
    const lastUserMessage = updatedHistory.slice(-1)[0];
    Workspace.deleteChats(workspace.slug, [chatId])
      .then(() =>
        sendCommand(
          lastUserMessage.content,
          true,
          updatedHistory,
          lastUserMessage?.attachments
        )
      )
      .catch((e) => console.error(e));
  };

  const sendCommand = async (
    command,
    submit = false,
    history = [],
    attachments = []
  ) => {
    if (!command || command === "") return false;
    if (!submit) {
      setMessageEmit(command);
      return;
    }

    let prevChatHistory;
    if (history.length > 0) {
      // use pre-determined history chain.
      prevChatHistory = [
        ...history,
        {
          content: "",
          role: "assistant",
          pending: true,
          userMessage: command,
          attachments,
          animate: true,
        },
      ];
    } else {
      prevChatHistory = [
        ...chatHistory,
        {
          content: command,
          role: "user",
          attachments,
        },
        {
          content: "",
          role: "assistant",
          pending: true,
          userMessage: command,
          animate: true,
        },
      ];
    }

    setChatHistory(prevChatHistory);
    setMessageEmit("");
    setLoadingResponse(true);
  };

  useEffect(() => {
    async function fetchReply() {
      const promptMessage =
        chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
      const remHistory = chatHistory.length > 0 ? chatHistory.slice(0, -1) : [];
      var _chatHistory = [...remHistory];

      // Override hook for new messages to now go to agents until the connection closes
      if (websocket) {
        if (!promptMessage || !promptMessage?.userMessage) return false;
        websocket.send(
          JSON.stringify({
            type: "awaitingFeedback",
            feedback: promptMessage?.userMessage,
          })
        );
        return;
      }

      if (!promptMessage || !promptMessage?.userMessage) return false;

      // If running and edit or regeneration, this history will already have attachments
      // so no need to parse the current state.
      const attachments = promptMessage?.attachments ?? parseAttachments();
      window.dispatchEvent(new CustomEvent(CLEAR_ATTACHMENTS_EVENT));

      await Workspace.multiplexStream({
        workspaceSlug: workspace.slug,
        threadSlug,
        prompt: promptMessage.userMessage,
        chatHandler: (chatResult) =>
          handleChat(
            chatResult,
            setLoadingResponse,
            setChatHistory,
            remHistory,
            _chatHistory,
            setSocketId
          ),
        attachments,
      });
      return;
    }
    loadingResponse === true && fetchReply();
  }, [loadingResponse, chatHistory, workspace]);

  // TODO: Simplify this WSS stuff
  useEffect(() => {
    function handleWSS() {
      try {
        if (!socketId || !!websocket) return;
        const socket = new WebSocket(
          `${websocketURI()}/api/agent-invocation/${socketId}`
        );

        window.addEventListener(ABORT_STREAM_EVENT, () => {
          window.dispatchEvent(new CustomEvent(AGENT_SESSION_END));
          websocket.close();
        });

        socket.addEventListener("message", (event) => {
          setLoadingResponse(true);
          try {
            handleSocketResponse(event, setChatHistory);
          } catch (e) {
            console.error("Failed to parse data");
            window.dispatchEvent(new CustomEvent(AGENT_SESSION_END));
            socket.close();
          }
          setLoadingResponse(false);
        });

        socket.addEventListener("close", (_event) => {
          window.dispatchEvent(new CustomEvent(AGENT_SESSION_END));
          setChatHistory((prev) => [
            ...prev.filter((msg) => !!msg.content),
            {
              uuid: v4(),
              type: "statusResponse",
              content: "Agent session complete.",
              role: "assistant",
              sources: [],
              closed: true,
              error: null,
              animate: false,
              pending: false,
            },
          ]);
          setLoadingResponse(false);
          setWebsocket(null);
          setSocketId(null);
        });
        setWebsocket(socket);
        window.dispatchEvent(new CustomEvent(AGENT_SESSION_START));
        window.dispatchEvent(new CustomEvent(CLEAR_ATTACHMENTS_EVENT));
      } catch (e) {
        setChatHistory((prev) => [
          ...prev.filter((msg) => !!msg.content),
          {
            uuid: v4(),
            type: "abort",
            content: e.message,
            role: "assistant",
            sources: [],
            closed: true,
            error: e.message,
            animate: false,
            pending: false,
          },
        ]);
        setLoadingResponse(false);
        setWebsocket(null);
        setSocketId(null);
      }
    }
    handleWSS();
  }, [socketId]);

  const handleBadFeedback = async (chatId) => {
    const systemChat = chatHistory.find(
      (history) => history.chatId === chatId && history.role === "assistant"
    );
    const userChat = chatHistory.find(
      (history) => history.chatId === chatId && history.role === "user"
    );
    if (systemChat && userChat) {
      const formattedSources = systemChat.sources
        .map((src, index) => {
          return `
Chunk Name N. ${index + 1}: ${src.chunkSource}
Score: ${src.score}
Text:
\`\`\`html
${src.text};
\`\`\`
\n\n`;
        })
        .join("\n");
      let description = `
### User Question
${userChat.content}
### vBot Answer:
${systemChat.content}
#### Sources

${formattedSources}
---

Username: ${user?.username}
  `;

      createTask({
        listId: "901507029452",
        name: userChat.content,
        description,
      });
      showToast("Feedback submitted successfully", "success");
    }
  };

  return (
    <div
      style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
      className="transition-all duration-500 relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-main-gradient w-full h-full overflow-y-scroll border-2 border-outline no-scroll"
    >
      {isMobile && <SidebarMobileHeader />}
      <DnDFileUploaderWrapper>
        <ChatHistory
          history={chatHistory}
          workspace={workspace}
          sendCommand={sendCommand}
          updateHistory={setChatHistory}
          regenerateAssistantMessage={regenerateAssistantMessage}
          hasAttachments={files.length > 0}
          onBadFeedback={handleBadFeedback}
        />
        <PromptInput
          submit={handleSubmit}
          onChange={handleMessageChange}
          inputDisabled={loadingResponse}
          buttonDisabled={loadingResponse}
          sendCommand={sendCommand}
          attachments={files}
        />
      </DnDFileUploaderWrapper>
    </div>
  );
}

const useCreateClickupTask = (token) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [task, setTask] = useState(null);

  const createTask = async ({ listId, name, description }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.clickup.com/api/v2/list/${listId}/task`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            markdown_description: description,
            status: "open",
          }),
        }
      );

      if (!response.ok) {
        showToast(
          "Failed to submit feedback. Try again Please. if the issue persist, contact IT.",
          "error"
        );
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setTask(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { createTask, loading, error, task };
};
