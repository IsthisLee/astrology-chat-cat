const userMessages = [];
const assistantMessages = [];

async function sendMessage() {
  const inputText = document.getElementById("inputText");
  const messageText = inputText.value.trim();

  if (messageText.length === 0) return;

  addChatMessage("user-message", messageText);
  // Memory에 유저 대화 내역 저장
  userMessages.push(messageText);

  inputText.value = "";

  try {
    const response = await fetch("http://localhost:8080/fortuneTell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userMessages,
        assistantMessages
      })
    }).then((res) => res.json());

    if (response.success) {
      addChatMessage("assistant-message", response.data.assistant);

      // Memory에 챗루피 대화 내역 저장
      assistantMessages.push(response.data.assistant);
    } else {
      addChatMessage("assistant-message", "운세 요청에 실패하였습니다.");
      userMessages.pop(); // 챗루피 응답 실패 시 마지막 유저 대화 내역 삭제
    }
  } catch (error) {
    addChatMessage("assistant-message", "네트워크 오류");
    userMessages.pop(); // 챗루피 응답 실패 시 마지막 유저 대화 내역 삭제
  }
}

function addChatMessage(className, text) {
  const chatContainer = document.getElementById("chatContainer");
  const newMessage = document.createElement("div");
  newMessage.className = `message ${className}`;

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = text;
  newMessage.appendChild(messageContent);

  const messageTail = document.createElement("div");
  messageTail.className = "message-tail";
  newMessage.appendChild(messageTail);

  chatContainer.appendChild(newMessage);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

document.getElementById("inputText").addEventListener("keypress", (event) => {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    sendMessage();
  }
});

addChatMessage(
  "assistant-message",
  "안녕, 나는 운세보는 루피. 이름을 입력해줘"
);
