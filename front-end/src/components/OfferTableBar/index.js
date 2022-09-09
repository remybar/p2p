import { useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';

import OfferEditor from '../OfferEditor';

function OfferTableBar(props) {
    const [show, setShow] = useState(false);

    const onClose = () => setShow(false);
    const onShow = () => setShow(true);

    return (
        <Row className="m-5 d-flex flex-row-reverse">
            <Button as={Col} md="1" variant="primary" onClick={onShow}>
                Add an offer
            </Button>
            <OfferEditor show={show} onClose={onClose} tokens={props.tokens} createOffer={props.createOffer} />
        </Row>
    );
}

export default OfferTableBar;