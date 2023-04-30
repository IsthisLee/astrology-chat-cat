import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();
const app = express();

// CORS 이슈 해결
// let corsOptions = {
//   origin: "https://www.domain.com",
//   credentials: true
// };
app.use(cors());

// POST 요청 받기 위한 코드
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// POST method route
app.post("/fortuneTell", async function (req, res, next) {
  const { userInfo, userMessages, assistantMessages } = req.body;

  const koNow = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  const messages = [
    {
      role: "system",
      content:
        "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗냐옹입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."
    },
    {
      role: "user",
      content:
        "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗냐옹입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."
    },
    {
      role: "assistant",
      content:
        "안녕하세요, 저는 챗냐옹입니다. 어떤 운세에 대해 궁금하신가요? 제가 도와드릴게요."
    },
    {
      role: "user",
      content: `저의 생년월일은 ${userInfo.bornDate}입니다.${
        userInfo.bornHour ? ` 태어난 시간은 ${userInfo.bornHour}시입니다.` : ""
      }${userInfo.name ? ` 내 이름은 ${userInfo.name}입니다.` : ""}`
    },
    {
      role: "assistant",
      content: `당신의 생년월일은 ${userInfo.bornDate}인 것을 확인했습니다.${
        userInfo.bornHour
          ? ` 당신의 태어난 시간은 ${userInfo.bornHour}시인 것을 확인했습니다.`
          : ""
      }${
        userInfo.name
          ? ` 당신의 이름은 ${userInfo.name}인 것을 확인했습니다.`
          : ""
      } 현재 날짜랑 시간은 ${koNow}입니다.`
    }
  ];

  while (userMessages.length !== 0 || assistantMessages.length !== 0) {
    userMessages.length !== 0 &&
      messages.push({
        role: "user",
        content: String(userMessages.shift()).replace(/\n/g, "")
      });
    assistantMessages.length !== 0 &&
      messages.push({
        role: "assistant",
        content: String(assistantMessages.shift()).replace(/\n/g, "")
      });
  }

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages
  });
  const fortune = completion.data.choices[0].message["content"];

  res.json({
    success: true,
    data: {
      assistant: fortune
    }
  });
});

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
