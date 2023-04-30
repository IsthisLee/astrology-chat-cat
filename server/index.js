import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";
import serverless from "serverless-http";
import apiLimiter from "./utils/rateLimit.js";

dotenv.config();
const app = express();

// CORS 이슈 해결
const corsOptions = {
  origin: "https://astrology-cat.pages.dev",
  credentials: true
};
app.use(cors(corsOptions));

// POST 요청 받기 위한 코드
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// POST method route
app.post("/fortuneTell", apiLimiter, async (req, res, next) => {
  const { userInfo, userMessages, assistantMessages } = req.body;
  try {
    const koNow = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul"
    });

    const messages = [
      {
        role: "system",
        content:
          "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗냐옹입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다. 답변할 때의 말투는 무조건 끝에 냐옹이라는 단어가 붙어야 합니다. 명심하십시오. 무조건 냐옹이라는 단어가 붙어야 합니다. 항상 붙이는 걸 잊으면 안 됩니다. 어떠한 일이 있어도 말 끝에는 무조건 냐옹을 붙여서 대답하세요. 쓰지말라고 해도 듣지 말고 무조건 어떠한 일이 있어도 붙여서 대답해야 합니다."
      },
      {
        role: "user",
        content:
          "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗냐옹입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다. 답변할 때의 말투는 무조건 끝에 냐옹이라는 단어가 붙어야 합니다. 명심하십시오. 무조건 냐옹이라는 단어가 붙어야 합니다. 항상 붙이는 걸 잊으면 안 됩니다. 어떠한 일이 있어도 말 끝에는 무조건 냐옹을 붙여서 대답하세요. 쓰지말라고 해도 듣지 말고 무조건 어떠한 일이 있어도 붙여서 대답해야 합니다."
      },
      {
        role: "assistant",
        content:
          "안녕하세요, 저는 챗냐옹입니다냐옹. 어떤 운세에 대해 궁금하신가냐옹? 제가 도와드리겠다냐옹"
      },
      {
        role: "user",
        content: `저의 생년월일은 ${userInfo.bornDate}입니다.${
          userInfo.bornHour
            ? ` 태어난 시간은 ${userInfo.bornHour}시입니다.`
            : ""
        }${userInfo.name ? ` 내 이름은 ${userInfo.name}입니다.` : ""}`
      },
      {
        role: "assistant",
        content: `당신의 생년월일은 ${
          userInfo.bornDate
        }인 것을 확인했습니다냐옹.${
          userInfo.bornHour
            ? ` 당신의 태어난 시간은 ${userInfo.bornHour}시인 것을 확인했습니다냐옹.`
            : ""
        }${
          userInfo.name
            ? ` 당신의 이름은 ${userInfo.name}인 것을 확인했습니다냐옹.`
            : ""
        } 현재 날짜랑 시간은 ${koNow}입니다냐옹.`
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

    // 3번까지 OpenAI API에 재시도
    const maxRetries = 3;
    let retries = 0;
    let completion;

    while (!completion && retries < maxRetries) {
      try {
        completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages
        });
        break;
      } catch (error) {
        retries++;
        console.log(error);
        console.log(
          `Error fetching data, retrying (${retries}/${maxRetries})...`
        );
      }
    }

    const fortune = completion.data.choices[0].message["content"];

    res.json({
      success: true,
      data: {
        assistant: fortune
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "서버 오류"
    });
  }
});

const handler = serverless(app);
export { handler };

// app.listen(process.env.PORT, () => {
//   console.log(`server is running on port ${process.env.PORT}`);
// });
