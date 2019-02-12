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
          userEngagementNotification(details);
        }  
    }


},networkFilters,extraInfoSpec);

const userEngagementNotification = async (postRequest,postRequestBody) => {
  console.log("userEngagementNotification");

  let storeState = store.getState();
  let address  = storeState.chrome.selectedCampaign;
  console.log("storeState",storeState);
  if(address){
     alert(address)
    console.log("**************TESTING*************")
    const URL = "http://localhost:3000/api/campaign/cbt/test"
    await postPromise(URL,{test:10, address});
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

 

/* const isTwitter = (postRequest,postRequestBody) => {
   console.log({ postRequest });
   console.log({ postRequestBody });
}
 */

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