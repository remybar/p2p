import { useState } from 'react';
import { Button } from 'react-bootstrap';

import TokenEditor from '../TokenEditor';

function TokenBar(props) {
    const [show, setShow] = useState(false);

    const onClose = () => setShow(false);
    const onShow = () => setShow(true);

    return (
        <div className="d-flex flex-row-reverse">
            <Button variant="primary" onClick={onShow}>
                Whitelist a token
            </Button>
            <TokenEditor show={show} onClose={onClose} whitelist={props.whitelist} />
        </div>
    );
}

export default TokenBar;