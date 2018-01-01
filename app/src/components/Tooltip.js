import React, { PropTypes } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import CloseIcon from '-!babel-loader!svg-react-loader?name=CloseIcon!../static/close-icon.svg';

import './tooltip.scss';


class Tooltip extends React.Component {

  componentWillUpdate(newProps, newState) {
    // console.log('PROPS', newProps);
  }

  _getEngineType(type) {
    switch (type) {
      case 0:
        return 'None';
      case 1:
        return 'Piston Engine';
      case 2:
        return 'Turboprop Engine';
      case 3:
        return 'Jet Engine';
      case 4:
        return 'Electric Engine';
      default:
        return 'Unknown Type Engine';
    }
  }

  render() {
    const { craft, tooltip, toggleTooltipVisibility } = this.props;
    const colWidth = {
      width: '100px'
    };

    return (
      <div className={`tooltip-container  ${!tooltip ? 'is-hidden' : ''}`} >
        <CloseIcon className="close-icon"
          onClick={toggleTooltipVisibility.bind(null, false)}/>
        <Table>
          <TableHeader
            className="table-header"
            displaySelectAll={false}
            adjustForCheckbox={false}
          >
            <TableRow>
              <TableHeaderColumn>Aircraft Information</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            <TableRow>
              <TableRowColumn style={colWidth}>Id number</TableRowColumn>
              <TableRowColumn>{craft.Id}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={colWidth}>Country of Origin</TableRowColumn>
              <TableRowColumn>{craft.Cou || 'Unknown'}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={colWidth}>Operator</TableRowColumn>
              <TableRowColumn>{craft.Op || 'Unknown'}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={colWidth}>Type</TableRowColumn>
              <TableRowColumn>{craft.Mdl || 'Uknown'}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={colWidth}>Engines</TableRowColumn>
              <TableRowColumn>{`${craft.Engines || ''} ${this._getEngineType(craft.EngType) || ''}${craft.Engines > 1 ? 's' : ''}`}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={colWidth}>GPS Location</TableRowColumn>
              <TableRowColumn>{craft.Lat && craft.Long ? `${craft.Lat}Lat ${craft.Long} Long` : ''}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={colWidth}>Heading</TableRowColumn>
              <TableRowColumn>{craft.Trak || ''}</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}

Tooltip.defaultProps = {};
Tooltip.propTypes = {
  craft: PropTypes.object
};

export default Tooltip;
