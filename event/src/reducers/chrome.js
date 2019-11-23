const initialState = {
  count: 0
};


export default (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_COUNT': {
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
    case 'SELECTED_JWT_TOKEN':
      return Object.assign({}, state, {
        jwtToken: action.value
      });  
    case 'UPDATE_REACT_APP_CONFIRMED_PARTICIPATION':

      let updateRequest = JSON.stringify({ 
        type:'SUCCESS',
        payload: action.payload
      });
      return Object.assign({}, state, {
        updateReactApp: updateRequest
      });
    case 'UPDATE_REACT_APP_ERROR':
      //console.log("ERROR REDUCER IS CALLED!!!!");
      let errorResponse = JSON.stringify({ 
        type:'ERROR',
        payload: action.payload
      });
      return Object.assign({}, state, {
        updateReactAppWithError: errorResponse
      }); 

    default:
      return state;
  }
}