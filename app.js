const express = require("express");
const routes = require('./routes'); // 통신을 수행하는 Router 생성
const jwt = require('jsonwebtoken')
const { Op } = require("sequelize");
const { Users } = require("./models");
const app = express();
const port = 3000;
const authMiddleware = require('./middlewares/auth-middleware') // 미들웨어 임포트

// 최 상단에서 request로 수신되는 Post 데이터가 정상적으로 수신되도록 설정한다.
// 주소 형식으로 데이터를 보내는 방식
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", routes);

/** 
 * 1. 회원 가입 API
    - 닉네임은 `최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)`로 구성하기 ㅇ
    - 비밀번호는 `최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 실패`로 만들기 ㅇ
    - 비밀번호 확인은 비밀번호와 정확하게 일치하기 ㅇ
    - 닉네임, 비밀번호, 비밀번호 확인을 request에서 전달받기 ㅇ
    - 데이터베이스에 존재하는 닉네임을 입력한 채 회원가입 버튼을 누른 경우 "중복된 닉네임입니다." 라는 에러메세지를 response에 포함하기 ㅇ
*/

routes.post("/signup", async(req,res)=>{
  const {nickname, password, confirmPassword} = req.body;
  const {authorization} = req.headers;
  const [tokenType, tokenValue] = (authorization || "").split(' ')

  //로그인 토큰을 전달한 채로 로그인 API 또는 회원가입 API를 호출한 경우 "이미 로그인이 되어있습니다."라는 에러 메세지를 response에 포함하기
  if (tokenValue && tokenType == 'Bearer'){
    res.status(400).send({
      errorMessage : '이미 로그인이 되어있습니다.'
    })
    return;
  }

  if (password !== confirmPassword) {
      res.status(400).send({
          errorMessage : '패스워드가 패스워드 확인란과 동일하지 않습니다.'
      });
      return;
    } // 요 아래 코드는 실행하지 않겠다는 것. 이걸 안쓰면 패스워드 확인이 다른데도 더 실행됨.
      // 이렇게 "예외를 줄여나가는 것"이 좋은 코드를 짤 수 있는 방법이기도 하다.

  const regExp = new RegExp(/^[a-zA-Z0-9]{3,}$/) ;
  const result = regExp.test(nickname)
  if(!result) {
    res.status(400).send({
      errorMessage : '이름은 영문 혹은 숫자로 3자리 이상되게 지어라.'
  })
  return;
  } 

  if (password.length<4 || password.includes(nickname)){
    res.status(400).send({
      errorMessage : '비번을 좀 똑바로 지어봐라.'
  })
  return;
  }


  // nickname이 동일한게 이미 있는지 확인하기 위해 가져온다.    
  const existsUsers = await Users.findAll({
    where: {
       nickname:nickname,
    },
  });
  if (existsUsers.length) {
    res.status(400).send({
      errorMessage: "중복된 닉네임입니다.",
    });
    return;
  }

  await Users.create({ nickname, password });
  res.status(201).send({message : '회원가입이 되었다.'});

});    



/**
 * 2. 로그인 API
    - 닉네임, 비밀번호를 request에서 전달받기
    - 로그인 버튼을 누른 경우 닉네임과 비밀번호가 데이터베이스에 등록됐는지 확인한 뒤, 
    하나라도 맞지 않는 정보가 있다면 "닉네임 또는 패스워드를 확인해주세요."라는 에러 메세지를 
    response에 포함하기
  */

routes.post("/login", async(req,res)=>{
    const{nickname,password} = req.body
    const {authorization} = req.headers;
    const [tokenType, tokenValue] = (authorization || "").split(' ')
    
    //로그인 토큰을 전달한 채로 로그인 API 또는 회원가입 API를 호출한 경우 "이미 로그인이 되어있습니다."라는 에러 메세지를 response에 포함하기
    if (tokenValue && tokenType == 'Bearer'){
      res.status(400).send({
        errorMessage : '이미 로그인이 되어있습니다.'
      })
      return;
    }

    //const user = await User.findOne({email,password}).exec();
    const user = await Users.findOne({
        where: {
          nickname:nickname,
        },
      });
    
    //주의 Mongoose에서는 위 findOne() 에서 비번 일치검사도 했기 떄문에 여기에는 if(!user) 조건만 있었다.  
    if(!user || password !== user.password){
        res.status(401).send({
            errorMessage: '닉네임 또는 패스워드를 확인하라.'
        }) //401은 인증실패했다는 뜻. // NOTE: 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다
        return;
    }

    //토큰만들기 //시크릿키 노출 유의
    const token = jwt.sign({userId: user.userId}, 'LukeSkywalker')
    res.send({
        token
    })

});

//3.토큰 검증 미들웨어 api
//이 경로(/users/me)로만 미들웨어 받기! 
//항상 개발자툴 네트워크 열어서 스테이터스 봐봐. 404면 아예 안되는거고, 400이면 너가 보낸게 들어가긴 하는 거임.
// router.get("/users/me", authMiddleware, async(req, res) => {
//   console.log(res.locals);

//   const {user} = res.locals;
//   console.log(user)

//   res.send({
//       user : {
//           email : user.email,
//           nickname : user.nickname
//       }
//   });
// });


app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
