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
        
/*           console.log("IS A POST Request")
          console.log(JSON.stringify(details)) */

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

/*    try {
     store.dispatch({ 
      type: 'CONFIRMED_PARTICIPATION',
      payload: 'Worked!'
    }); 


  } catch (e){
    console.log(e);
  }  */
  
  return {responseHeaders: newHeaders};
},
networkFilters,
['blocking', 'responseHeaders']
);

const userEngagementNotification = async (postRequest,postRequestBody) => {
  console.log("userEngagementNotification");

  let storeState = store.getState();
  let address  = storeState.chrome.selectedCampaign;
  let jwtToken = storeState.chrome.jwtToken;

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
        const URL = "http://52.20.224.32:3000/api/campaign/participate";

        try {
              let confirmedParticipation  = await postPromise(URL,{ participationKey, address },jwtToken);
              console.log("CONFIRMING PARTICIPATION.......");
              console.log(confirmedParticipation);
              
              store.dispatch({ 
                type: 'UPDATE_REACT_APP_CONFIRMED_PARTICIPATION',
                payload: confirmedParticipation
              }); 

            } catch (e) {
                console.log("Error Occurred",e);
                let payload = {
                  message: 'Error Occurred', 
                  errorID: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                }
                console.log("Sending ERROR Payload:",payload);

                store.dispatch({ 
                  type: 'UPDATE_REACT_APP_ERROR',
                  payload: payload
                }); 
            }
          
        console.log("Participation CALLLED");

    }
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
    chrome.notifications.create(id, opt, function(id) { console.log("Last error:", chrome.runtime.lastError); });

*/