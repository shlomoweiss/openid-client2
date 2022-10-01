const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const fs = require ('fs');
const passport = require('passport');
const http    = require("http");
const https = require('https');
const { v4: uuidv4 } = require('uuid');

  

const { Issuer,Strategy ,custom} = require('openid-client');
const axios = require('axios').default;

const path = require("path");
const map1 = new Map();

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({
  extended: true,
}));


app.use(express.json({ limit: '15mb' }));
app.use(session({secret: 'secret', 
                 resave: false, 
                 saveUninitialized: true,}));
app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    console.log('-----------------------------');
    console.log('serialize user');
    console.log(user);
    console.log('-----------------------------');
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    console.log('-----------------------------');
    console.log('deserialize user');
    console.log(user);
    console.log('-----------------------------');
    done(null, user);
});

const cert = fs.readFileSync("fredFlintstone.crt")
const key = fs.readFileSync("fredFlintstone.key")
const ca = fs.readFileSync("rootCA.crt")



Issuer.discover('https://10.100.102.135:8443/auth/realms/test') 
  .then(function (oidcIssuer) {
    var client = new oidcIssuer.Client({
      client_id: 'client1',
      token_endpoint_auth_method: 'self_signed_tls_client_auth',
      tls_client_certificate_bound_access_tokens: true,
      redirect_uris: ["http://10.100.102.105:8080/login/callback"],
      response_types: ['code'], 
      
    });
    
    client[custom.http_options] = () => ({ key, cert });    
    passport.use(
      'oidc',
      new Strategy({ client,passReqToCallback: true}, (req, tokenSet, userinfo, done) => {
        console.log("tokenSet",tokenSet);
        console.log("userinfo",userinfo);
        console.log("oidckey",req.cookies.oidckey);
        map1.set(req.cookies.oidckey,{tokenSet,userinfo})
        return done(null, tokenSet.claims());
      }
      
      )
    );
  });



app.get('/login',
function (req, res, next) {
    console.log('-----------------------------');
    console.log('/Start login handler');
    res.cookie("oidckey",uuidv4());
    next();
},
passport.authenticate('oidc',{scope:"openid"}));

app.get('/login/callback',(req,res,next) =>{
  
  passport.authenticate('oidc',{ successRedirect: '/user',
  failureRedirect: '/' })(req, res, next)
}
  
)

app.get('/client',(req,res,next) =>{
  
    const agent = new https.Agent({
        cert: cert,
        key: key,
        ca: ca
        
    });

    const querystring =  new URLSearchParams({
        client_id: "client1",
        grant_type: "client_credentials",
        scope: "email"
    });
    const options = {
        url: `https://10.100.102.135:8443/auth/realms/test/protocol/openid-connect/token`,  
        method: "POST",
        httpsAgent : agent,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: querystring.toString()
    };

        axios(options).then(response => {
          payload = response.data ;
          return res.status(200).send({"status":1});
        }).catch(err => {
            console.log(err);
            return false
       });

    


  });
  

app.get("/",(req,res) =>{
   res.send(" <a href='http://10.100.102.105:8080/login'>Log In with OAuth 2.0 shlomo Provider </a>")
})
app.get ("/user",(req,res) =>{
    res.header("Content-Type",'application/json');
    str = JSON.stringify(map1.get(req.cookies.oidckey));
    res.end(str);

})

  const httpServer = http.createServer(app)
  //const server= https.createServer(options,app).listen(3003);
  httpServer.listen(8080,() =>{
      console.log(`Http Server Running on port 8080`)
    })