import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { React, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import {  GenericLayout, HomeLayout, ConfigurationLayout, NotFoundLayout, LoginLayout} from './components/Layout';

import API from './API.js'


function App() {
    return (
      <BrowserRouter>
        <AppWithRouter />
      </BrowserRouter>
    );
  }
function AppWithRouter() {

    const navigate = useNavigate();

    const [loggedIn, setLoggedIn] = useState(false); // This state keeps track if the user is currently logged-in.
    const [user, setUser] = useState(null);// This state contains the user's info.
    const [userConf, setUserConf] = useState({});

    const [models, setModels] = useState([]);
    const [accessories, setAccessories] = useState([]);

    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedAccessories, setSelectedAccessories] = useState([]);

    const [message, setMessage] = useState('');
    const [messageSuccess, setMessageSuccess] = useState(false);

    //const [dirty, setDirty] = useState(true);
    const [authToken, setAuthToken] = useState(undefined);
    const [estimationTime, setEstimationTime] = useState(undefined);

    // auto hide message
    const showMessage = (newMessage, variant) => {
        setMessage(newMessage);
        setMessageSuccess(variant)
        setTimeout(() => setMessage(''), 2000);
    };

    const handleErrors = (err) => {
        console.log('DEBUG: err: '+JSON.stringify(err));
        let msg = '';
        if (err.error)
            msg = err.error;
        else if (err.errors) {
            if (err.errors[0].msg)
                msg = err.errors[0].msg + " : " + err.errors[0].path;
        } else if (Array.isArray(err))
            msg = err[0].msg + " : " + err[0].path;
        else if (typeof err === "string") msg = String(err);
            else msg = "Unknown Error";
        showMessage(msg, false);
        console.log(err);
        //setTimeout( ()=> setDirty(true), 2000);
    } // If an error occurs, the error message will be shown in a toast.

    const refetchModelsAndAccessories = async () => {
        const modelsData  = await API.getModels().then((modelsData) => setModels(modelsData)).catch((err) => {err.status!==304?setModels([]):null; handleErrors(err) } );
        const accessoriesData = await API.getAccessories().then((accessoriesData) => setAccessories(accessoriesData)).catch((err) => {err.status!==304?setAccessories([]):null; handleErrors(err)});
        await Promise.all([modelsData, accessoriesData]);
    }
    const fetchUserConfiguration = async () => {
        API.getCurrentConfiguration().then((conf) => setUserConf(conf)).catch((err) => handleErrors(err));
    }


    // initial fetch of models and accessories and check if the user is already logged in
    useEffect(() => {
        const checkAuth = async() => {
            try {
                // here you have the user info, if already logged in
                const user = await API.getUserInfo();
                setLoggedIn(true);
                setUser(user);
                // API.getAuthToken().then((res) => setAuthToken(res.token));
            } catch(err) {
                // NO need to do anything: user is simply not yet authenticated
            }
        };
        refetchModelsAndAccessories().then(() => checkAuth()).catch((err) => handleErrors(err)); //
    }, []);

    // fetch estimation time when user configuration is loaded
    useEffect(() => {
        if(loggedIn && userConf && userConf.model_id){
            const confNameAccessories =  () => accessories.filter( (p) => userConf.accessories.includes(p.accessory_id)).map(p => p.name) ;

            API.getAuthToken().then((res)=>{
                setAuthToken(res.token);
                API.getEstimationTime(res.token, confNameAccessories())
                    .then((json) => setEstimationTime(json.time))
            }).catch((err) => handleErrors(err));

            setSelectedModel(models.find(m => m.model_id === userConf.model_id));
            setSelectedAccessories(userConf.accessories);
        }
    }, [userConf]);



    const handleLogin = async (credentials) => {
        try {
            const user = await API.logIn(credentials);
            setUser(user);
            setLoggedIn(true);
            await fetchUserConfiguration();
            navigate('/');
        } catch (err) {
            throw err;
        }
    };
    const handleLogout = async () => {
        try {
            await API.logOut();
            setUser(null);
            setSelectedModel({});
            setSelectedAccessories([]);
            setUserConf({});
            setEstimationTime(undefined);
            setLoggedIn(false);
            navigate('/');
        } catch (err) {
            handleErrors(err);
        }
    };

    const handleConfiguration = async () =>{
        await refetchModelsAndAccessories();
        if(userConf.model_id && userConf.accessories){ // se c'è carichiamo la configurazione
            setSelectedModel(models.find(m => m.model_id === userConf.model_id));
            setSelectedAccessories(userConf.accessories );
        } else {
            setSelectedModel({});
            setSelectedAccessories([]);
        }
        navigate('/configuration');
    } // this the configuration button, if the user is logged in, it will navigate to the configuration page


    const handleSaveConfiguration = async () => {
        try {
            if(!selectedModel.model_id){ showMessage("Select a model first", false); return; }
            if(!userConf.model_id){ // if the user has not a configuration yet, we send a POST request
                await API.saveConfiguration({ model_id: selectedModel.model_id, accessories: selectedAccessories });
                showMessage("Configuration saved correctly",true);
            }else { // if the user has already a configuration, we send a PUT request
                if(userConf.model_id === selectedModel.model_id){
                    const accessoriesChanged = userConf.accessories.length !== selectedAccessories.length ||
                        !userConf.accessories.every(accessory => selectedAccessories.includes(accessory));
                    if(accessoriesChanged){
                        await API.updateConfiguration({ model_id: selectedModel.model_id, accessories: selectedAccessories });
                        showMessage("Configuration updated correctly",true);
                    } else {
                        showMessage("No changes to save",false);
                        await handleConfiguration();
                        return;
                    }
                } else{
                    showMessage("You can't change the model, delete the configuration first",false)
                    await handleConfiguration();
                    return;
                }
            }
            await refetchModelsAndAccessories();
            await fetchUserConfiguration();
        } catch (err) {
            await refetchModelsAndAccessories();
            await handleConfiguration();
            handleErrors(err);
        }
    }
    const handleDeleteConfiguration = async () => {
        if(!userConf.model_id) {
            showMessage("No configuration to delete",false);
            return;
        }
        try {
            await API.deleteConfiguration();
            await refetchModelsAndAccessories();
            setUserConf({});
            setSelectedAccessories([]);
            setSelectedModel({});
            showMessage("Configuration deleted correctly", true);
            setEstimationTime(undefined);
        } catch (err) {
            handleErrors(err);
        }

    }





    return (
        <>
    <Container fluid>
        <> {/*JSON.stringify({userConf})}{JSON.stringify({ciao:user})} {JSON.stringify({loggato:loggedIn})*/}</>
        <Routes>
            <Route path="/" element={<GenericLayout newConfiguration={handleConfiguration}  loggedIn={loggedIn} user={user} logout={handleLogout}
                                                    message={message} setMessage={setMessage} succMess={messageSuccess} setMessageSuccess={setMessageSuccess}/>} >
                <Route index element={<HomeLayout models={models} accessories={accessories} loggedIn={loggedIn}/>} />

                <Route path="configuration" element={ loggedIn? <ConfigurationLayout models={models} accessories={accessories} setAccessories={setAccessories}
                                                                                     selectedModel={selectedModel} selectedAccessories={selectedAccessories}
                                                                                     setSelectedModel={setSelectedModel} setSelectedAccessories={setSelectedAccessories}
                                                                                     userConf={userConf} estimationTime={estimationTime}
                                                                                     saveConfiguration={handleSaveConfiguration} deleteConfiguration={handleDeleteConfiguration}
                                                                                     cancelConfiguration={handleConfiguration} /> : <Navigate replace to = "/login"/>} />

                <Route path="*" element={<NotFoundLayout />} />
            </Route>
            <Route path="/login" element={!loggedIn ? <LoginLayout login={handleLogin} /> : <Navigate replace to='/' />} />
        </Routes>
    </ Container>
        </>
  )
}


export default App
