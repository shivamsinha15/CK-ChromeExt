import {createStore} from 'redux';
import rootReducer from './reducers';

import {wrapStore} from 'react-chrome-redux';

const store = createStore(rootReducer, {});

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
/*        
          console.log("IS A POST Request")
         console.log(JSON.stringify(details))
*/
          userEngagementNotification(details);
        }  
    }


},networkFilters,extraInfoSpec);

/* 
  Important for iFrame to work:
  https://stackoverflow.com/questions/51847996/ignoring-x-frame-options-in-firefox-webextension
*/
chrome.webRequest.onHeadersReceived.addListener((details) => {
/* 
  console.log("Header Received Request")
  console.log(JSON.stringify(details))
*/

  let newHeaders = details.responseHeaders.filter(
      header => !header.name.toLowerCase().endsWith('frame-options')
  );
  return {responseHeaders: newHeaders};
},
networkFilters,
['blocking', 'responseHeaders']
);

const userEngagementNotification = async (postRequest,postRequestBody) => {
  console.log("userEngagementNotification");

  let storeState = store.getState();
  let address  = storeState.chrome.selectedCampaign;

  let requestBody = postRequest.requestBody;

  if(requestBody.formData){
    var variables = requestBody.formData.variables;
  }

  if(requestBody && variables && variables[0]){
    let postedVariables = variables[0];
    let jsonAsObject = JSON.parse(postedVariables);


    if(jsonAsObject.input && 
      jsonAsObject.input.feedback_reaction && jsonAsObject.input.feedback_reaction === 1 && //isLike
      jsonAsObject.input.tracking && jsonAsObject.input.tracking[0]){    //isParticipationKey
        let trackingVariables = JSON.parse(jsonAsObject.input.tracking[0]);
        let participationKey = trackingVariables['mf_story_key'];
        const URL = "http://localhost:3000/api/campaign/participate"
        await postPromise(URL,{ participationKey, address });
    }
  }


}




export const  postPromise = (URL,data) => {
  return fetch(URL, {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  });
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

wrapStore(store, {
  portName: 'example'
});



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
    chrome.notifications.create(id, opt, function(id) { console.log("Last error:", chrome.runtime.lastError); });

*/