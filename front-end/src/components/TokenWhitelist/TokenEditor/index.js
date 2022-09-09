import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

function TokenEditor(props) {
  const [address, setAddress] = useState(null);

  const whitelist = () => {
    props.whitelist(address);
    onClose();
  }

  const isWhitelistingAllowed = () => {
    return address !== null;
  }

  const onAddressChange = (event) => {
    setAddress(event.target.value);
  }

  const onClose = () => {
    setAddress(null);
    props.onClose();
  }

  return (
    <>
      <Modal show={props.show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Whitelist a token</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Row} className="mb-3" controlId="formAddress">
              <Form.Label column sm={2}>Address</Form.Label>
              <Col sm={10}>
                <Form.Control type="text" onChange={onAddressChange} />
              </Col>
            </Form.Group>
            {/*
           {this.state.errorMsg && (
             <div className="row mb-3">
              <p className="text-danger text-center">{this.state.errorMsg}</p>
            </div>
           )}
           */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={whitelist} disabled={!isWhitelistingAllowed()}>
            Whitelist
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TokenEditor;