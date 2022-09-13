import React from 'react';
import { Alert, Row, Col } from 'react-bootstrap';

function AlertList({alerts, dismiss}) {
    return (
        <Row className="d-flex flex-row-reverse">
            <Col md="6">
            {
                alerts.map(alert => (
                    <Alert key={alert.id} variant={alert.kind || "danger"} onClose={() => dismiss(alert.id)} dismissible className="mt-2 mx-5">
                        {alert.message}
                    </Alert>
                ))
            }
            </Col>
        </Row>
    );
}

export default AlertList;