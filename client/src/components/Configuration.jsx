import {Row} from "react-bootstrap";
import {AccessoriesLayout, ModelLayout} from "./Object.jsx";
import {React} from "react";

function TableLayout({
                         accessories, // all accessories information
                         models, // all model information
                         selectedAccessories, // IDs of current selected Access
                         selectedModel, // ID of current selected Model
                         setSelectedAccessories, // callback to change accessories
                         setSelectedModel, // callback to change model
                         userConf,
                     }) {

    // è solo uno, posso salvare tutto l'oggetto invece del solo ID
    const handleModelSelect = (model) => {
        if(selectedModel && selectedModel.model_id && selectedModel.model_id===model.model_id  ) return;
        setSelectedModel(model);
        setSelectedAccessories([]);
    };

    const handleAccessorySelect = (accessoryId) => {
        // Aggiorna selectedAccessories in base alla selezione
        if (selectedAccessories.includes(accessoryId)) {
            setSelectedAccessories(selectedAccessories.filter(id => id !== accessoryId));
        }else {
            setSelectedAccessories([...selectedAccessories, accessoryId]);
        }
    };
    return (
        <>
            <Row>
                <ModelLayout models={models} onSelect={handleModelSelect} selectedModel={selectedModel} />
            </Row>
            <Row>
                <AccessoriesLayout selectedModel={selectedModel} accessories={accessories} onSelect={handleAccessorySelect} selectedAccessories={selectedAccessories} userConf={userConf} />
            </Row>
        </>
    );
}

export {TableLayout};