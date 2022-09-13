import React from 'react';
import { Container, Button, Table, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';

class OfferTable extends React.Component {

  tooltip(component, text) {
    return (
      <OverlayTrigger
        delay={{ hide: 450, show: 300 }}
        overlay={(props) => (
          <Tooltip {...props}>{text}</Tooltip>
        )}
        placement="right"
      >
        {component}
      </OverlayTrigger>
    );
  }

  render() {
    return (
      this.props.offers.length > 0
    ? <Row className="m-5 justify-content-md-center">
        <Table as={Col} md="auto" striped bordered hover variant="dark">
          <thead>
            <tr>
              <td align="center">From Token</td>
              <td align="center">From Token Amount</td>
              <td align="center">To Token</td>
              <td align="center">To Token Amount</td>
              <td align="center">Action</td>
            </tr>
          </thead>
          <tbody>
             {this.props.offers.map((offer) => (
               <tr key={offer.id}>
                {this.tooltip(
                  <td align="center">{offer.fromTokenName}</td>,
                  `address: ${offer.fromToken}`
                )}
                <td align="center">{offer.fromTokenDisplayedAmount}</td>
                {this.tooltip(
                  <td align="center">{offer.toTokenName}</td>,
                  `address: ${offer.toToken}`
                )}
                <td align="center">{offer.toTokenDisplayedAmount}</td>
                <td align="center">
                  {
                    offer.isMine && this.props.showMine
                    ? <span className="fst-italic">mine</span>
                    : <Button onClick={() => this.props.onAction(offer.id)}>{this.props.actionName}</Button>
                  }
                </td>
              </tr>
             ))}
          </tbody>
        </Table>
      </Row>
      : <Container className="m-4 text-center text-white"><p>No offer.</p></Container>
    );
  }
}

export default OfferTable;