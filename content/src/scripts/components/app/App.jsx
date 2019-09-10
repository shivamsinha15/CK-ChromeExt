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

      let hiddenAddressDiv = document.getElementById("hiddenAddress")


      if(hiddenAddressDiv){

       var campaignAddress = hiddenAddressDiv.getAttribute("value");
       this.props.dispatch({
          type: 'SELECTED_CAMPAIGN',
          value: campaignAddress
        });

    }
 
    });

    this.updateDom = this.updateDom.bind(this);

  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    
    console.log("componentDidUpdate");
    if(this.props.updateReactApp && (!prevProps || !prevProps.updateReactApp)){
      console.log("componentDidUpdate:Calling First Time");
      this.updateDom(JSON.parse(this.props.updateReactApp))
    }
    if(this.props.updateReactApp && prevProps.updateReactApp ){
       let currentUpdateReactApp = JSON.parse(prevProps.updateReactApp)
       let prevUpdateReactApp = JSON.parse(this.props.updateReactApp.updateReactApp)
       console.log("componentDidUpdate:Calling nTh Time");
       if(currentUpdateReactApp.payload && prevProps.updateReactApp
              && (currentUpdateReactApp.payload.txHash != currentUpdateReactApp.payload.txHash)){
                console.log("componentDidUpdate:calling update dome");
                this.updateDom(currentUpdateReactApp)
       } 
    }

  }

  
  //Note this triggers the update on the client side REACT APP.
  updateDom(props) {
    console.log("Checkin If element exist!!!!!!!!!");
    if(document.getElementById("chrome")){
      console.log("UPDATING DOM!!!!!!!!!");
      let updateRequestFromBackgroundScript = { 
                                                type: props.type,
                                                payload: props.payload
                                              };
      document.getElementById("chrome").innerHTML= JSON.stringify(updateRequestFromBackgroundScript);
    }
  }

  render() {

    console.log("Calling Render...........",this.props);

/*     if(this.props.updateReactApp){
         console.log("Checkin If element exist!!!!!!!!!");
         if(document.getElementById("chrome")){
          console.log("UPDATING DOM!!!!!!!!!");
          let updateReactAppObj = JSON.parse(this.props.updateReactApp);
          let updateRequestFromBackgroundScript = { 
                                                    type: updateReactAppObj.type,
                                                    payload: updateReactAppObj.payload
                                                  };
          document.getElementById("chrome").innerHTML= JSON.stringify(updateRequestFromBackgroundScript);
         }
         
    } */

    
    return ( 
        <div>
{/*           Count: {this.props.count} <br/>
          Url: {this.props.url} <br/>
          Method: {this.props.method} <br/> */}
          Test Output <br/>
          ConfirmedParticipation: {this.props.updateReactApp} <br/>
       </div> 
    );
  }
}

const mapStateToProps = (state) => {
  return {
    count: state.chrome.count,
    url: state.chrome.url,
    method: state.chrome.method,
    updateReactApp: state.chrome.updateReactApp
  };
};

export default connect(mapStateToProps)(App);
