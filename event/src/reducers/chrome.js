const initialState = {
  count: 0
};

let opt = {
  type: 'basic',
  title: 'Cultural King:',
  message: '100 Market Tokens Earned',
  priority: 1,
  iconUrl:'./noun_king.png'
};

const testNotificationOnClick = () => {
    let id = "notify" + new Date().getTime();
    chrome.notifications.create(id, opt, function(id) { console.log("Last error:", chrome.runtime.lastError); });
}


export default (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_COUNT': {
   //   testNotificationOnClick();
      return Object.assign({}, state, {
        count: ++state.count,
      }); 
    }
    case 'REQUEST_DETAILS':
    return Object.assign({}, state, {
      method: action.payload.method,
      url: action.payload.url
    });      
    case 'SELECTED_CAMPAIGN':
      return Object.assign({}, state, {
        selectedCampaign: action.value
      });  
    default:
      return state;
  }
}