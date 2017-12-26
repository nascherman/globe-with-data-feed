import React, { PropTypes } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import './tooltip.scss';


class Tooltip extends React.Component {

  componentWillUpdate(newProps, newState) {
    // console.log('PROPS', newProps);
  }

  render() {
    const { craft, tooltip } = this.props;
    const colWidth = {
      width: '100px'
    };

    return (
      <div className={`tooltip-container  ${!tooltip ? 'is-hidden' : ''}`}>
        <Table>
          <TableHeader
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
              <TableRowColumn>{`${craft.Engines} / ${craft.EngType}`}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={colWidth}>GPS Location</TableRowColumn>
              <TableRowColumn>{`${craft.Lat} Lat ${craft.Long} Long`}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={colWidth}>Heading</TableRowColumn>
              <TableRowColumn>{craft.Trak}</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }
}

Tooltip.defaultProps = {};
Tooltip.proptypes = {
  craft: PropTypes.object
};

export default Tooltip;
