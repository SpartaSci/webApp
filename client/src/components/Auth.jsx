import {useEffect, useState} from 'react';
import { Form, Button, Alert, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import validator from "validator";

function LoginForm(props) {
  const [username, setUsername] = useState('a@gmail.com');
  const [password, setPassword] = useState('pwd');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const delayMessage = () => {
      if (errorMessage) {
        setTimeout(() => { setErrorMessage('')  }, 4000);
      }
    }
    delayMessage();
  },[errorMessage])




  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };


    const validEmail = !validator.isEmpty(username) && validator.isEmail(username);

    const validPassword = !validator.isEmpty(password);

    if (!validEmail) {
      setErrorMessage('Email must be a valid email address');
    } else if (!validPassword) {
      setErrorMessage('Password cannot be empty');
    } else {
      props.login(credentials)
        .then( () => navigate( "/" ) )
        .catch((err) => {
            setErrorMessage(err.error? err.error : JSON.stringify(err));
        });
    }
  };

  return (
    <Row>
      <Col xs={4}></Col>
      <Col xs={4}>
        <h1 className="pb-3">Login</h1>

        <Form onSubmit={handleSubmit}>
          {errorMessage? <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">{errorMessage}</Alert> : null}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={username} placeholder="Example: john.doe@polito.it"
              onChange={(ev) => setUsername(ev.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password} placeholder="Enter your password"
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </Form.Group>
          <Button className="mt-3" type="submit">Login</Button>
          <Button className="mt-3 mx-3" variant="secondary" onClick={()=>{navigate('/')}}>Home</Button>
        </Form>
      </Col>
      <Col xs={4}></Col>
    </Row>

  )
};

function LogoutButton(props) {
  return (
      <Button variant="outline-light" onClick={props.logout}>Logout<i className="bi bi-person-fill-slash"></i></Button>
  )
}

function LoginButton(props) {
  const navigate = useNavigate();
  return (
      <Button variant="outline-light" onClick={() => navigate('/login')}>Login

        <i className="bi bi-person-fill"></i>

      </Button>
  )
}

export {LoginForm, LogoutButton, LoginButton };
