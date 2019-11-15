import {createStore} from 'redux';
import rootReducer from './reducers';

import {wrapStore} from 'react-chrome-redux';
import {Store} from 'react-chrome-redux';

const store = createStore(rootReducer, {});

wrapStore(store, {
  portName: 'example'
});


const networkFilters = {
  urls: [
    "http://*/*",
    "https://*/*",
    "*://*/*",
    "<all_urls>",
  ]
};



const extraInfoSpec = ['requestBody']


chrome.webRequest.onBeforeRequest.addListener((details) => {
 
  store.dispatch({
    type: 'REQUEST_DETAILS',
    payload: details
  });


  if(details.method=="POST") {


       if(details.requestBody){
        
/*           //console.log("IS A POST Request")
          //console.log(JSON.stringify(details)) */

          userEngagementNotification(details);
        }  
    }


},networkFilters,extraInfoSpec);



chrome.webRequest.onSendHeaders.addListener((details) => {


  /*

  frameId: -1
  initiator: "https://twitter.com"
  method: "POST"
  parentFrameId: -1
  requestHeaders: Array(15)
  0: {name: "Origin", value: "https://twitter.com"}
  1: {name: "x-twitter-client-language", value: "en"}
  2: {name: "x-csrf-token", value: "233bb0b8b94384ebbd42edc4d4254838"}
  3: {name: "authorization", value: "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCO…puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA"}
  4: {name: "content-type", value: "application/x-www-form-urlencoded"}

  6: {name: "User-Agent", value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) Ap…ML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"}
  7: {name: "x-twitter-auth-type", value: "OAuth2Session"}
  8: {name: "x-twitter-active-user", value: "yes"}
  9: {name: "Sec-Fetch-Site", value: "same-site"}
  10: {name: "Sec-Fetch-Mode", value: "cors"}
  11:
  name: "Referer"
  value: "https://twitter.com/eriktorenberg/status/1194714476148166656"
  __proto__: Object
  12: {name: "Accept-Encoding", value: "gzip, deflate, br"}
  13: {name: "Accept-Language", value: "en-US,en;q=0.9"}
  14: {name: "Cookie", value: "_ga=GA1.2.1616583146.1540989435; kdt=OvUaaH7j7MYnq…audQDSQ0hjklT6T81b6ig%3D|0|8e8t2xd8A2w%3D; _gat=1"}
  length: 15
  __proto__: Array(0)
  requestId: "151050"
  tabId: -1
  timeStamp: 1573677278412.7678
  type: "xmlhttprequest"
  url: "https://api.twitter.com/1.1/statuses/retweet.json"

  */
  

    if(details.method=== "POST" && details.url &&
          details.requestHeaders ){

            //url: "https://api.twitter.com/1.1/statuses/retweet.json"
            //retweet
            if(details.url.includes('retweet') && !details.url.includes('unretweet')){
              details.requestHeaders.forEach( header => {
                if(header.name === 'Referer' && header.value.includes('status')){
                  let referer = header.value;
                  let participationKey = referer.split('status')[1].replace('/', '');
                  if(participationKey){
                    sendParticipation(participationKey);
                  }
                }

              })
          }


          //follow
          if(details.url.includes('friendships') && details.url.includes('create')){
            details.requestHeaders.forEach( header => {
              if(header.name === 'Referer'){
                console.log("REFER");
                console.log(details);
              }
              if(header.name === 'Referer' && header.value.includes('cultural_kings')){
                console.log('SEND FOLLOWED');
                sentCustomParticipation('FOLLOWED')
              }

            })
        }

    }
  

  },
  networkFilters,
  ['requestHeaders','extraHeaders']
  );



/* 
  Important for iFrame to work:
  https://stackoverflow.com/questions/51847996/ignoring-x-frame-options-in-firefox-webextension
*/
chrome.webRequest.onHeadersReceived.addListener((details) => {


  let newHeaders = details.responseHeaders.filter(
      header => !header.name.toLowerCase().endsWith('frame-options')
  );

  return {responseHeaders: newHeaders};
},
networkFilters,
['blocking', 'responseHeaders']
);

const userEngagementNotification = async (postRequest,postRequestBody) => {

  let requestBody = postRequest.requestBody;
  if(requestBody.formData){
    var variables = requestBody.formData.variables;
  }

  //Facebook
  if(requestBody && variables && variables[0]){
    let postedVariables = variables[0];
    let jsonAsObject = JSON.parse(postedVariables);

    if(jsonAsObject.input && 
      jsonAsObject.input.feedback_reaction && jsonAsObject.input.feedback_reaction === 1 && //isLike
      jsonAsObject.input.tracking && jsonAsObject.input.tracking[0]){    //isParticipationKey
        let trackingVariables = JSON.parse(jsonAsObject.input.tracking[0]);
        let participationKey = trackingVariables['mf_story_key'];
        sendParticipation(participationKey);
    }
  }
}

const MAIN_TWEET_KEY = "1194954985747996672";


const sentCustomParticipation = async (eventType) => {

  let dispatchPayload;

  switch (eventType) {
    case 'MAIN_RETWEET':
        dispatchPayload = { 
          type: 'UPDATE_REACT_APP_CONFIRMED_PARTICIPATION',
          payload: {event: eventType, message: "Awesome the extension is working!\n Now lets try out the follow button.", id: Date.now()}
        };
      break;
     case 'FOLLOWED':
        dispatchPayload = { 
          type: 'UPDATE_REACT_APP_CONFIRMED_PARTICIPATION',
          payload: {event: eventType, message: "You are now officially a member of Cultural Kings!", id: Date.now()}
        }; 

       break;
  }

  if(dispatchPayload){
    console.log("SENDING",eventType);
    console.log("PAYLOAD",dispatchPayload);
    store.dispatch(dispatchPayload);
  }

}

const sendParticipation= async (participationKey) =>{
  console.log("participationKey", participationKey);
  if(participationKey.toString()==='1194954985747996672'){
    console.log("customParticipation");
    sentCustomParticipation('MAIN_RETWEET')
    return;
  }
  
  let storeState = store.getState();
  let address  = storeState.chrome.selectedCampaign;
  let jwtToken = storeState.chrome.jwtToken;
 
  const URL = "http://52.20.224.32:3000/api/campaign/participate";

  try {
        let confirmedParticipation  = await postPromise(URL,{ participationKey, address },jwtToken);
        //console.log("CONFIRMING PARTICIPATION.......");
        //console.log(confirmedParticipation);
        
        store.dispatch({ 
          type: 'UPDATE_REACT_APP_CONFIRMED_PARTICIPATION',
          payload: confirmedParticipation
        }); 

      } catch (e) {
          //console.log("Error Occurred",e);
          let payload = {
            message: 'Error Occurred', 
            errorID: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          }
          //console.log("Sending ERROR Payload:",payload);

          store.dispatch({ 
            type: 'UPDATE_REACT_APP_ERROR',
            payload: payload
          }); 
      }
}




export const  postPromise = (URL,data,jwtToken) => {
  let authHeader = "Bearer " + jwtToken;
  return fetch(URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify(data)
               }).then(response=>response.json())
}



const checkFb = (postRequest) => {
   return (postRequest.initiator 
      && postRequest.initiator === "https://www.facebook.com");
}

const checkAction = (postBodyRequest) => {
  return postBodyRequest.includes("reaction_type=1")
    && postBodyRequest.includes("mf_story_key");
}

const isFacebook = (postRequest,postRequestBody) => {
  return checkFb(postRequest) && checkAction(postRequestBody);
}




/*

  Client Trigged

  if (isFacebook(postRequest,postRequestBody)){
    let id = "notify" + new Date().getTime();
    let opt = {
      type: 'basic',
      title: 'Cultural King:',
      message: '100 Market Tokens Earned',
      priority: 1,
      iconUrl:'./noun_king.png'
    };
    chrome.notifications.create(id, opt, function(id) { //console.log("Last error:", chrome.runtime.lastError); });

*/