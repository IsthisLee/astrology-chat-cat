const userMessages = [];
const assistantMessages = [];
const userInfo = {
  name: null,
  bornDate: null,
  bornHour: null
};

function afterGetChat() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("inputText").style.display = "block";
  document.getElementById("inputText").focus();
}

async function sendMessage() {
  const inputText = document.getElementById("inputText");
  const messageText = inputText.value.trim();

  if (messageText.length === 0) return;

  addUserMessage(messageText);
  // Memory에 유저 대화 내역 저장
  userMessages.push(messageText);

  inputText.value = "";

  document.getElementById("loader").style.display = "block";
  document.getElementById("inputText").style.display = "none";

  try {
    const response = await fetch(
      "https://wec3lbcetgayya5zrr7bftelni0fjxwy.lambda-url.ap-northeast-2.on.aws/fortuneTell",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userInfo,
          userMessages,
          assistantMessages
        })
      }
    ).then((res) => res.json());

    if (response.success) {
      addAssistantMessage(response.data.assistant);
      afterGetChat();

      // Memory에 챗냐옹 대화 내역 저장
      assistantMessages.push(response.data.assistant);
    } else {
      addAssistantMessage(`운세 요청에 실패했다냐옹. ${response.message}`);
      afterGetChat();

      userMessages.pop(); // 챗냐옹 응답 실패 시 마지막 유저 대화 내역 삭제
    }
  } catch (error) {
    addAssistantMessage("네트워크 오류");
    userMessages.pop(); // 챗냐옹 응답 실패 시 마지막 유저 대화 내역 삭제
  }
}

function addAssistantMessage(text) {
  const chatTextContainer = document.getElementById("chatTextContainer");
  const newMessage = document.createElement("div");
  newMessage.className = "message assistant-message";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = text;

  if (assistantMessages.length >= 1) {
    const p = document.createElement("p");
    p.innerHTML =
      "그리고 참치캔 값을 내놓으면 더욱 좋은 운이 찾아올 것이다냐옹 => ";
    const link = document.createElement("a");
    link.href = "https://toss.me/comecome";
    link.innerHTML = "참치캔 값 내놓기";
    p.appendChild(link);
    messageContent.appendChild(p);
  }
  newMessage.appendChild(messageContent);

  chatTextContainer.appendChild(newMessage);
  chatTextContainer.scrollTop = chatTextContainer.scrollHeight;
}

function addUserMessage(text) {
  const chatTextContainer = document.getElementById("chatTextContainer");
  const newMessage = document.createElement("div");
  newMessage.className = "message user-message";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = text;

  newMessage.appendChild(messageContent);

  chatTextContainer.appendChild(newMessage);
  chatTextContainer.scrollTop = chatTextContainer.scrollHeight;
}

const parseNull = (value) => {
  if (value === "null") return null;
  if (value === "undefined") return undefined;
  return value;
};

function start() {
  userInfo.name = document.getElementById("name").value.trim();
  userInfo.bornDate = document.getElementById("bornDate").value.trim();
  userInfo.bornHour = document.getElementById("bornHour").value.trim();

  userInfo.bornHour = parseNull(userInfo.bornHour);

  if (userInfo.bornDate.length === 0) {
    swal({
      title: "Meow!",
      text: "생년월일을 입력해주라냐옹",
      icon: "error",
      button: "냐옹"
    });
    return;
  }

  document.querySelector(".intro-container").style.display = "none";
  document.querySelector(".chat-wrapper").style.display = "block";
  document.getElementById("chat-top-img").style.display = "block";
  document.getElementById("inputText").value = "오늘 운세 알려줘라냐옹";
}

const selectBox = document.getElementById("bornHour");

for (let i = -1; i <= 23; i++) {
  let option = document.createElement("option");
  option.value = i;
  option.text = `${i} 시`;

  if (i === -1) {
    option.value = null;
    option.text = "모르겠다냐옹";
  }

  selectBox.appendChild(option);
}

document.getElementById("inputText").addEventListener("keypress", (event) => {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    sendMessage();
  }
});

addAssistantMessage(
  "냐옹, 나는 운세보는 냐옹이다냐옹. 궁금한 것을 물어보라냐옹! (ex. 오늘 운세 알려줘라냐옹)"
);
