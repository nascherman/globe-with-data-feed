import React from 'react';
import Globe from './Globe';
import './app.css';

class AppComponent extends React.Component {

  render() {
    return (
      <div className="index">
        <Globe width="1000" height="1000"/>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
