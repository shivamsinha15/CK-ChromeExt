import React, {Component} from 'react';
import {connect} from 'react-redux';

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {



    document.addEventListener('click', () => {
       this.props.dispatch({
        type: 'ADD_COUNT'
      });

      let addressDiv = document.getElementById("address")

      if(addressDiv){
       var campaignAddress = addressDiv.getAttribute("value");

      this.props.dispatch({
        type: 'SELECTED_CAMPAIGN',
        value: campaignAddress
      });
    }


 
    });


  }

  render() {
    return ( <div/>
/*       <div>
        Count: {this.props.count} <br/>
        Url: {this.props.url} <br/>
        Method: {this.props.method} <br/>
      </div> */
    );
  }
}

const mapStateToProps = (state) => {
  return {
    count: state.chrome.count,
    url: state.chrome.url,
    method: state.chrome.method
  };
};

export default connect(mapStateToProps)(App);
