import rateLimit from "express-rate-limit";

//* 사용량 제한 미들웨어. 도스 공격 방지
const ONE_MINUTE = 60 * 1000;
const MAX_REQUEST_COUNT = 4;

const apiLimiter = rateLimit({
  windowMs: ONE_MINUTE,
  max: MAX_REQUEST_COUNT, // windowMs동안 최대 호출 횟수
  // keyGenerator: (req) => req.ip, // 클라이언트 IP 주소를 기반으로 식별자 생성 -> default IP
  handler(req, res) {
    // 제한 초과 시 콜백 함수
    res.status(this.statusCode).json({
      success: false,
      code: this.statusCode, // statusCode 기본값 429
      message: `1분에 ${MAX_REQUEST_COUNT}번만 요청 할 수 있습니다냐옹.`
    });
  }
});

export default apiLimiter;
