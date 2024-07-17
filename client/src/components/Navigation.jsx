import 'bootstrap-icons/font/bootstrap-icons.css';

import { Navbar, Nav, Form, Button} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";

import { LoginButton, LogoutButton } from './Auth';

const Navigation = (props) => {
    const navigate = useNavigate();
    return (
        <Navbar bg="primary" expand="md" variant="dark" className="navbar-padding">
            <Navbar.Brand className="mx-2" onClick={ () => {navigate('/')}}>
                <i className="bi bi-car-front-fill mx-2" />
                Car Configurator
            </Navbar.Brand>
            <Nav variant="underline">
                <Nav.Link onClick={() => {navigate('/')}}>Home</Nav.Link>
                <Nav.Link onClick={() => {props.newConfiguration()}}>Configuration</Nav.Link>
            </Nav>
           <Nav className="w-100">
               <Navbar.Collapse className="justify-content-end">
                   <Navbar.Text>
                       {props.user && props.user.name && `Logged in as: ${props.user.name}`}
                   </Navbar.Text>
                   <Form className="mx-5">
                       {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
                   </Form>
               </Navbar.Collapse>

            </Nav>
        </Navbar>
    );
}

export { Navigation };
