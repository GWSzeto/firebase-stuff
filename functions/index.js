require('dotenv').config();
const functions = require('firebase-functions');
const cors = require('cors')
const app = require('express')()
const { JwtGenerator } = require('virgil-sdk');
const { VirgilCrypto, VirgilAccessTokenSigner } = require('virgil-crypto');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const ChatGrant = AccessToken.ChatGrant;
const request = require('request-promise')

app.use(cors({ origin: true }));

const getTwilioToken = identity => {
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID, 
    process.env.TWILIO_API_KEY, 
    process.env.TWILIO_API_SECRET
  );
  token.identity = identity

  // create the grants
  const videoGrant = new VideoGrant({
    room: 'pharm'
  });
  const chatGrant = new ChatGrant({
    serviceSid: process.env.TWILIO_CHAT_SERVICE_SID
  })

  // Add the grant to the token
  token.addGrant(videoGrant);
  token.addGrant(chatGrant);

  return token
}

const getVirgilToken = identity => {
  const virgilCrypto = new VirgilCrypto();

  const generator = new JwtGenerator({
    appId: process.env.VIRGIL_APP_ID,
    apiKeyId: process.env.VIRGIL_APP_KEY_ID,
    apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_APP_KEY),
    accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto)
  });

  const token = generator.generateToken(identity)

  return token
}

const twilioSanboxFunciton = async () => {
  const rawChannels = await request
    .get(`https://chat.twilio.com/v2/Services/${process.env.TWILIO_CHAT_SERVICE_SID}/Channels`)
    .auth(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, false)
  const channels = JSON.parse(rawChannels)

  await Promise.all(channels.channels.map(async ({ sid }) => {
    await request
      .del(`https://chat.twilio.com/v2/Services/${process.env.TWILIO_CHAT_SERVICE_SID}/Channels/${sid}`)
      .auth(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, false)
  }))

  return 'should be delete?'
}

app.post('/getTwilioToken', (request, response) => {
  const identity = request.body.identity
  const token = getTwilioToken(identity)
  response.send({
    identity: token.identity,
    twilioToken: token.toJwt(),
  })
})

app.post('/getVirgilToken', (request, response) => {
  const identity = request.body.identity
  const token = getVirgilToken(identity)

  response.send({
    identity: token.identity,
    virgilToken: token.toString(),
  })
})

app.get('/twilioSandbox', async (request, response) => {
  const thing = await twilioSanboxFunciton()
  response.send({
    thing
  })
})

exports.widgets = functions.https.onRequest(app)
