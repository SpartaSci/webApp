import { React, useState } from 'react';
import {Row, Col, Button, Modal, Alert, Container} from 'react-bootstrap';
import { Outlet, Link} from 'react-router-dom';
import { Toast } from 'react-bootstrap';

import { Navigation } from './Navigation';
import { SummaryLayout } from './Summary';
import { LoginForm } from './Auth';
import { TableLayout } from './Configuration.jsx';
import {StaticLayout} from "./StaticHome.jsx";

//import API from '../API.js';

function NotFoundLayout(props) {
    return (
      <>
        <h2>This route is not valid!</h2>
        <Link to="/">
          <Button variant="primary">Go back to the main page!</Button>
        </Link>
      </>
    );
  }


function LoginLayout(props) {
    return (
      <Row>
        <Col>
            <LoginForm login={props.login} />
        </Col>
      </Row>
    );
  }

function HomeLayout({ models, accessories, loggedIn }) {
    return (
      <>
        <Row>
          <Col>
            <StaticLayout models={models} accessories={accessories} loggedIn={loggedIn}/>
          </Col>
        </Row>
      </>
    );

}

// wrap to home, to
function ConfigurationLayout({
                                 accessories, // all accessories information
                                 models, // all model information
                                 setAccessories, // to change clickability
                                 selectedAccessories, // IDs of current selected Access
                                 selectedModel, //  current selected Model
                                 setSelectedAccessories, // callback to change accessories
                                 setSelectedModel, // callback to change model
                                 userConf,
                                 estimationTime,
                                 saveConfiguration,// callback to save configuration
                                 deleteConfiguration, // callback to delete configuration
                                 cancelConfiguration, // callback to cancel configuration
                             }) {
    return (
        <>
            <Container>
            <Row>

                <Col xs={8} >
                    <TableLayout models={models} accessories={accessories}
                                selectedModel={selectedModel} selectedAccessories={selectedAccessories} userConf={userConf}
                                setSelectedModel={setSelectedModel} setSelectedAccessories={setSelectedAccessories}  />
                </Col>
                <Col xs={1}></Col>
                <Col xs={3}>
                    <SummaryLayout models={models} accessories={accessories}
                                   selectedModel={selectedModel} selectedAccessories={selectedAccessories}
                                   estimationTime={estimationTime}
                                   saveConfiguration={saveConfiguration} deleteConfiguration={deleteConfiguration} cancelConfiguration={cancelConfiguration}/>
                </Col>
            </Row>
            </Container>
        </>
    );
}

function GenericLayout(props) {
  
    return (
      <>
        <Row>
          <Col>
            <Navigation newConfiguration={props.newConfiguration} loggedIn={props.loggedIn}  user={props.user} logout={props.logout}  />
          </Col>
        </Row>

        <Row><Col>
          {props.message ?  <Alert className='my-1' variant={props.succMess? 'success':'danger'} dismissible>

              {props.message}</Alert> : <Alert className='my-1' variant='secondary'>{''}</Alert>}

        </Col></Row>

        <Row>
          <Col>
            <Outlet />
  
          </Col>
        </Row>
      </>
    );
  }
  
  
  export { NotFoundLayout, LoginLayout, HomeLayout, ConfigurationLayout,GenericLayout };
