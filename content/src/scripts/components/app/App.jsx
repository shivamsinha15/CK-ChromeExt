import React, {Component} from 'react';
import {connect} from 'react-redux';


class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {  
    //todo: Shouldnt happen for every click
    document.addEventListener('click', () => {
       this.props.dispatch({
        type: 'ADD_COUNT'
      });

      let hiddenAddressDiv = document.getElementById("hiddenAddress");
      let hiddenJwtToken = document.getElementById("jwtToken");


          if(hiddenAddressDiv){

            var campaignAddress = hiddenAddressDiv.getAttribute("value");
            this.props.dispatch({
                type: 'SELECTED_CAMPAIGN',
                value: campaignAddress
              });

          }

        if(hiddenJwtToken){

          var jwtToken = hiddenJwtToken.getAttribute("value");
          this.props.dispatch({
            type: 'SELECTED_JWT_TOKEN',
            value: jwtToken
          });

      }

 
    });

    this.updateDom = this.updateDom.bind(this);
    this.updateReactAppWithError = this.updateReactAppWithError.bind(this);

  }

  /*The objective of this method is to update the dom to prop*/
  componentDidUpdate(prevProps) {    
    //console.log("componentDidUpdate:START--------------------------------");
    console.log("prevProps",prevProps);
    console.log("this.props.updateReactApp",this.props.updateReactApp)
    this.handleUpdateReactApp(prevProps);
    this.updateReactAppWithError(prevProps);
    //console.log("componentDidUpdate:end--------------------------------");
  }

  updateReactAppWithError(prevProps) {
/*  
    //console.log("*****CHECKING:updateReactAppWithError ******");
    //console.log("*****updateReactAppWithERRROE******: NTH Time1: this.props.updateReactAppWithError",this.props.updateReactAppWithError);
    //console.log("*****updateReactAppWithERRROE******: NTH Time1: prevProps",prevProps);
    //console.log("*****updateReactAppWithERRROE******: NTH Time1 prevProps.updateReactAppWithError",prevProps.updateReactAppWithError)
*/

    if(this.props.updateReactAppWithError && (!prevProps || !prevProps.updateReactAppWithError)){
      //console.log("*****updateReactAppWithERRROE******:Calling First Time");
      this.updateDom(JSON.parse(this.props.updateReactAppWithError));
      return;
    } 
;
    if(this.props.updateReactAppWithError && prevProps && prevProps.updateReactAppWithError){
      //console.log("*****updateReactAppWithERRROE******: NTH Time1");
       let currentPayload = JSON.parse(this.props.updateReactAppWithError).payload;
       let prevPayload =  JSON.parse(prevProps.updateReactAppWithError).payload;
       //console.log("currentPayload",currentPayload);
       //console.log("prevPayload",prevPayload);

       if(currentPayload.errorID != prevPayload.errorID){
        //console.log("*****updateReactAppWithERRROE******: NTH Time3");
        this.updateDom(JSON.parse(this.props.updateReactAppWithError));
      }
    }
  }

  handleUpdateReactApp(prevProps) {
    if(this.props.updateReactApp
       && (
            ((!prevProps || !prevProps.updateReactApp) )
              || (prevProps && prevProps.updateReactApp && (prevProps.updateReactApp != this.props.updateReactApp))
          )){
      this.updateDom(JSON.parse(this.props.updateReactApp));
      return;
    }

    //console.log("componentDidUpdate:called:nthTime");

    if(this.props.updateReactApp && prevProps.updateReactApp ){
       let prevUpdateReactApp = JSON.parse(prevProps.updateReactApp)
       let currentUpdateReactApp = JSON.parse(this.props.updateReactApp)
       //console.log("componentDidUpdate:called:prepayloadCheck");
       if(currentUpdateReactApp.payload && prevUpdateReactApp.payload
              && (currentUpdateReactApp.payload.txHash != prevUpdateReactApp.payload.txHash)){
                //console.log("componentDidUpdate:calling update dom");
                this.updateDom(currentUpdateReactApp)
       } 
    }
  }


  //errorResponse
  
  //Note this triggers the update on the client side REACT APP.
  updateDom(props) {
    if(document.getElementById("chrome")){
      let updateRequestFromBackgroundScript = { 
                                                type: props.type,
                                                payload: props.payload
                                              };
      //console.log("UPDATING DOM!!!!!!!!!",updateRequestFromBackgroundScript);
      document.getElementById("chrome").innerHTML= JSON.stringify(updateRequestFromBackgroundScript);
    }
  }

  render() {
    
    return ( 
        <div>
{/*       
          Count: {this.props.count} <br/>
          Url: {this.props.url} <br/>
          Method: {this.props.method} <br/> 
          Test Output <br/>
          ConfirmedParticipation: {this.props.updateReactApp} <br/>
*/}
       </div> 
    );
  }
}

const mapStateToProps = (state) => {
  return {
    count: state.chrome.count,
    url: state.chrome.url,
    method: state.chrome.method,
    updateReactApp: state.chrome.updateReactApp,
    updateReactAppWithError: state.chrome.updateReactAppWithError
  };
};

export default connect(mapStateToProps)(App);
