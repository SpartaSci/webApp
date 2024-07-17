
import {Table, Row, Col, Alert} from 'react-bootstrap';
import {useState} from 'react';
import Card from 'react-bootstrap/Card';

//import './element.css'


function StaticModelElement ( {model} ) {

    const cardStyle  = {
        width: 'auto',
        boxShadow: 'none',
    };

    return (
        <>
            <Card
                style={ cardStyle}

            >
                <Card.Body>
                    <Card.Title>Model with Power {model.power}KW </Card.Title>
                    <Card.Text>
                        Price: {model.cost}€ <br />
                        Max Accessories: {model.maxAcc} <br />
                    </Card.Text>
                </Card.Body>
            </Card>

        </>
    );
}
function StaticModelLayout({models}) {

    return (
        <Table className="no-border">
            <thead>
            <tr>
                <th> Models</th>
            </tr>
            </thead>
            <tbody>
            <tr>
            {models.map((model,index) => (
                <td key={index}>
                    <StaticModelElement model={model}/>
                </td>
            ))}
            </tr>
            </tbody>
        </Table>
    );

}


function StaticAccessoryElement( {accessory} )  {

    const cardStyle = {
        width: 'auto',
   };

    return (
        <>
            <Card
                style= {cardStyle}
            >
                <Card.Body>
                    <Card.Title> {/*accessory.accessory_id*/} {accessory.name}</Card.Title>
                    <Card.Text>
                        Price: {accessory.price}€ <br />
                        Available: {accessory.quantity} <br />
                    </Card.Text>
                </Card.Body>
            </Card>

        </>
    );
};
function StaticAccessoriesLayout({accessories}) {


    const chunks = accessories.reduce((acc, item, index) => {
        const chunkIndex = Math.floor(index / 3);
        if (!acc[chunkIndex]) {
            acc[chunkIndex] = [];
        }
        acc[chunkIndex].push(item);
        return acc;
    }, []);


    return (
        <Table className="no-border">
            <thead>
            <tr>
                <th>Accessories</th>
            </tr>
            </thead>
            <tbody>
            {chunks.map((chunk, index) => (
                <tr key={index}>
                    {chunk.map((accessory,index) => (
                        <td key={index}>
                            <StaticAccessoryElement accessory={accessory}/>
                        </td>
                    ))}
                </tr>
            ))}

            </tbody>
        </Table>
    );

}
function StaticLayout({
                          accessories, // all accessories information
                          models, // all model information
                          loggedIn
                      }) {

    const [errorMessage, setErrorMessage] = useState('');

    return (
        <>
            {errorMessage? <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">{errorMessage}</Alert> : null}
            <Col xs={{span:7, offset:2}} onClick={() => loggedIn ? setErrorMessage("Go to Configuration"):setErrorMessage("Login")}>
            <Row>
               <Col> <StaticModelLayout models={models} /> </Col>
            </Row>

            <Row>
                <Col> <StaticAccessoriesLayout accessories={accessories} /> </Col>
            </Row>

            </Col>
        </>
    );
}


export {StaticLayout}