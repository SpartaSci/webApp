
import {Table} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import { useEffect, useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import './element.css'

const ModelElement = ({ model, onSelect, isSelected}) => {
    const [isHovered, setIsHovered] = useState(false);

    const navigate = useNavigate();


    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleClick = () => {
        onSelect(model);
        //navigate('/configuration');
    }
    const cardStyle  = {
        width: 'auto',
        boxShadow: isSelected ? '0 0 20px rgba(0, 0, 0, 0.5)' : 'none',
        transition: 'box-shadow 0.3s ease-in-out', // Smooth transition for the hover effect
    };
    const cardHoverStyle = {
        ...cardStyle,
        boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)', // Different boxShadow color or effect when hovered
    };
    return (
        <>
            <Card
                style={ isHovered ? cardHoverStyle : cardStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                <Card.Body>
                    <Card.Title>Model with Power: {model.power}KW</Card.Title>
                    <Card.Text>
                        Price: {model.cost}€ <br />
                        Max Accessories: {model.maxAcc} <br />
                    </Card.Text>
                </Card.Body>
            </Card>

        </>
    );
};
function ModelLayout({ models, onSelect, selectedModel, }) {


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
                        <ModelElement
                            model={model}
                            onSelect={onSelect}
                            isSelected={selectedModel && model.model_id===selectedModel.model_id}
                        />
                    </td>
                ))}
            </tr>
            </tbody>
        </Table>
    );

}


const AccessoryElement = ({ selectedModel, accessory,accessories, selectedAccessories, onSelect, userConf }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isHovered2, setIsHovered2] = useState(false); // per gestire il tooltip

    const isSelected =  selectedAccessories.includes(accessory.accessory_id);

    const [isSelectable, setIsSelectable] = useState(false);
    const [isNeeded, setIsNeeded] = useState(false); // usato per elementi selezionati, ma che non possono essere deselezionati perche necessari

    const [message, setMessage] = useState('Errore');



    const handleMouseEnter = () => {
        if(isSelectable) setIsHovered(true);
        setIsHovered2(true);
    };

    const handleMouseLeave = () => {
        if(isSelectable) setIsHovered(false);
        setIsHovered2(false)
    };

    const handleClick = () => {
        if(isSelectable && !isNeeded ) {
            onSelect(accessory.accessory_id);
        }
    }
    /*una card può essere in 4 stati
    * 1- non è selezionato e può essere cliccato -> style classico + hover
    * 2- non è selezionato e NON puo esserlo -> style classico + opacità
    * 3- è selezionato e può essere cliccato -> style selezionato + hover
    * 4- è selezionato e NON può essere cliccato -> style selezionato + opacità
    * */



    useEffect(()=>{
        const isNeeded = () => { // in caso sia selezionato, controlla se Non puo essere deselezionato
            if(!isSelected) return false;

            for(let id of selectedAccessories){
                if(accessories.find(a => a.accessory_id === id) && accessories.find(a => a.accessory_id === id).need === accessory.accessory_id) {
                    setMessage("Needed by "+accessories.find(a => a.accessory_id === id).name);
                    return true;
                }
            }
            return false;
        }
        setIsNeeded(isNeeded());
    },[selectedAccessories]);


    useEffect(() => {
        const checkIsSelectable = () => {

            if(!selectedModel || !selectedModel.model_id) {
                setMessage("Select a model first");
                return false;
            }
            if (isSelected) return true;


            const isAlreadyInConfiguration = userConf && userConf.accessories && userConf.accessories.includes(accessory.accessory_id);
            if (accessory.quantity <= 0 && !isAlreadyInConfiguration){
                setMessage("Not available");
                return false;
            }

            if(selectedAccessories.length >= selectedModel.maxAcc) {
                setMessage("Max accessories reached")
                return false;
            }
            if (accessory.need) {
                if(!selectedAccessories.includes(accessory.need)){
                    setMessage("Need "+accessories.find(a => a.accessory_id === accessory.need).name);
                    return false
                }
            }
            if (accessory.incompatible) {
                if(selectedAccessories.includes(accessory.incompatible)){
                    setMessage("Incompatible with "+accessories.find(a => a.accessory_id === accessory.incompatible).name);
                    return false

                }
            }
            return true;
        };

        setIsSelectable(checkIsSelectable());
    }, [selectedAccessories, selectedModel, accessories]);



    const renderToolTip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {message}
        </Tooltip>
    )

    const cardStyle = {
        width: 'auto',
        boxShadow: isSelected ? '0 0 20px rgba(0, 0, 0, 0.5)' : 'none',
        transition: 'box-shadow 0.3s ease-in-out', // Smooth transition for the hover effect
    };
    const cardHoverStyle = {
        ...cardStyle,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)', // Different boxShadow color or effect when hovered
    };
    const cardNonSelectableStyle = {
        ...cardStyle,
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none'
    };
    const cardHoverSelectedButNeeded= {
        ...cardStyle,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        cursor: 'not-allowed',
    }

    return (
        <>
            <OverlayTrigger
            placement="top"
            overlay={renderToolTip}
            show={isHovered2 && (!isSelectable || isNeeded)} // Show tooltip only when not clickable and hovered
        >
            <Card
                style={!isSelectable ? cardNonSelectableStyle : (isHovered ? (isNeeded ?  cardHoverSelectedButNeeded : cardHoverStyle ): cardStyle)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                <Card.Body>
                    <Card.Title>{accessory.name}</Card.Title>
                    <Card.Text>
                        Price: {accessory.price} € <br />
                        Available: {accessory.quantity} <br />
                    </Card.Text>
                </Card.Body>
            </Card>
        </OverlayTrigger>
        </>
    );
};
function AccessoriesLayout({ selectedModel, accessories, onSelect, selectedAccessories, userConf  }) {


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
                            <AccessoryElement selectedModel={selectedModel}
                                              accessory={accessory}
                                              accessories={accessories}
                                              selectedAccessories={selectedAccessories}
                                              onSelect={onSelect}
                                              userConf={userConf}/>
                        </td>
                    ))}
                </tr>
            ))}

            </tbody>
        </Table>
    );

}

export {ModelElement, ModelLayout, AccessoryElement, AccessoriesLayout};