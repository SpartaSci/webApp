import {useState} from "react";
import {Alert, Button, ButtonGroup, Col, Container, Modal, Row} from "react-bootstrap";

function SummaryLayout({ selectedModel, selectedAccessories, models, accessories, saveConfiguration,estimationTime, deleteConfiguration, cancelConfiguration}) {
    const selectedModelDetails = selectedModel;
    const selectedModelPrice = selectedModelDetails ? selectedModelDetails.cost : 0;
    const selectedAccessoriesDetails = selectedAccessories.map(accessory_id =>
        accessories.find(accessory => accessory.accessory_id === accessory_id)
    );
    const selectedAccessoriesTotalPrice = selectedAccessoriesDetails.reduce((total, accessory) =>
        total + (accessory ? accessory.price : 0), 0
    );
    const totalPrice = selectedModelPrice + selectedAccessoriesTotalPrice;

    // save Modal
    const [showModal, setShowModal] = useState(false);
    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleConfirm = () => {
        saveConfiguration();
        handleCloseModal();
    };
    // Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const handleDeleteConfiguration = async () => {
        deleteConfiguration();
        handleCloseDeleteModal();
    };

    const handleCancelConfiguration = () => {
        cancelConfiguration();
    };

    return (
        <>
            <h1>Configuration</h1>
            {selectedModelDetails && (
                <p>Model: {selectedModelDetails.power}Kw - Price: {selectedModelPrice} €</p>
            )}
            <h4>Selected accessories</h4>
            {selectedAccessoriesDetails.map((accessory, index) => (
                accessory ? <p key={index}>{index + 1}: {accessory.name} - {accessory.price} €</p> : null
            ))}
            <p><strong>Total: {totalPrice?totalPrice:0} €</strong></p>

            <ButtonGroup>

                <Button variant="primary" onClick={handleShowModal}>Confirm Configuration</Button>
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Configuration</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to confirm this configuration?
                        This action will overwrite saved configuration.</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleConfirm}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Button variant="danger" onClick={handleShowDeleteModal}><i className="bi bi-ban"></i>Delete
                    Configuration</Button>
                <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Configuration</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>This will erase the saved configuration. Are you sure you want to delete it? This is not
                        reversible </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfiguration}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Button variant="warning" onClick={handleCancelConfiguration}>Reset Configuration</Button>
            </ButtonGroup>


            <Container className="mt-3">
                <Row className="justify-content-center">
                    <Col >{
                        estimationTime ? <Alert variant="light" className="text-center">
                            Estimated delivery time for the saved configuration: {estimationTime} days
                        </Alert> : null}
                    </Col>
                </Row>
            </Container>
        </>
    );

}


export {SummaryLayout};