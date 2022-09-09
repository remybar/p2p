import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

function OfferEditor(props) {
    const [fromToken, setFromToken] = useState(null);
    const [fromTokenAmount, setFromTokenAmount] = useState(0);
    const [toToken, setToToken] = useState(null);
    const [toTokenAmount, setToTokenAmount] = useState(0);

    const onClose = () => {
        setFromToken(null);
        setFromTokenAmount(0);
        setToToken(null);
        setToTokenAmount(0);
        props.onClose();
    }

    const onFromTokenChange = (e) => { setFromToken(e.target.value); }
    const onFromTokenAmountChange = (e) => { setFromTokenAmount(e.target.value); }
    const onToTokenChange = (e) => { setToToken(e.target.value); }
    const onToTokenAmountChange = (e) => { setToTokenAmount(e.target.value); }

    const createOffer = () => {
        props.createOffer(fromToken, fromTokenAmount, toToken, toTokenAmount);
        onClose();
    }

    return (
        <>
            <Modal show={props.show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add an offer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group as={Row} className="mb-3" controlId="fromToken">
                            <Form.Label column sm={3}>Token to sell</Form.Label>
                            <Col >
                                <Form.Select sm={9} onChange={onFromTokenChange} >
                                    <option>Select a token</option>
                                    {props.tokens.map(t => <option key={t.addr} value={t.addr}>{t.symbol}</option>)}
                                </Form.Select>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="fromTokenAmount">
                            <Form.Label column sm={3}>Amount</Form.Label>
                            <Col sm={9}>
                                <Form.Control type="text" onChange={onFromTokenAmountChange} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="toToken">
                            <Form.Label column sm={3}>Token to receive</Form.Label>
                            <Col >
                                <Form.Select sm={9} onChange={onToTokenChange} >
                                    <option>Select a token</option>
                                    {props.tokens.map(t => <option key={t.addr} value={t.addr}>{t.symbol}</option>)}
                                </Form.Select>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="toTokenAmount">
                            <Form.Label column sm={3}>Amount</Form.Label>
                            <Col sm={9}>
                                <Form.Control type="text" onChange={onToTokenAmountChange} />
                            </Col>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Close
          </Button>
                    <Button variant="primary" onClick={createOffer}>
                        Create
          </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default OfferEditor;