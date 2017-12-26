import React, { PropTypes } from 'react';
import Globe from './Globe';
import Tooltip from './Tooltip';
import './app.scss';

class AppComponent extends React.Component {

  render() {
    return (
      <div className="index" id="index">
        <Tooltip
          craft={this.props.craft}
          tooltip={this.props.tooltip}
          toggleTooltipVisibility={this.props.actions.toggleTooltipVisibility}
        />
        <Globe
          width={100}
          height={100}
          toggleTooltipVisibility={this.props.actions.toggleTooltipVisibility}
          tooltip={this.props.tooltip}
          setCraft={this.props.actions.setCraft}/>
      </div>
    );
  }
}

AppComponent.defaultProps = {
  craft: {}
};
AppComponent.propTypes = {
  craft: PropTypes.object
};

export default AppComponent;
