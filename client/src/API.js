
const SERVER_URL = 'http://localhost:3001/api/';

const SERVER_URL2 = 'http://localhost:3002/api/';


function getJson(httpResponsePromise) {
    // server API always return JSON, in case of error the format is the following { error: <message> } 
    return new Promise((resolve, reject) => {
      httpResponsePromise.then((response) => {
          if (response.ok) {
              if(response.status === 204) resolve({}); // no content

           // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
           response.json()
              .then( json => resolve(json) )
              .catch( err => reject({ error: "a parse server response" }))
  
          } else {
            // analyzing the cause of error
            response.json()
              .then(obj => 
                reject(obj)
                ) // error msg in the response body
              .catch(err => reject({ error: "Cannot  server response" })) // something else
          }
        })
        .catch(err => 
          reject({ error: "Cannot communicate"  })
        ) // connection error
    });
  }

const getModels = async () =>  {
    const jsonResponse = await getJson(fetch(SERVER_URL + 'models', {credentials: 'include'}));
    return jsonResponse.map((model) => {
                return {
                    model_id: model.model_id,
                    power: model.power,
                    cost: model.cost,
                    maxAcc: model.maxAcc,
                }
            });
}
const getAccessories = async () => {
    const jsonResponse = await getJson(fetch(SERVER_URL + 'accessories', {credentials: 'include'}));
    return jsonResponse.map((accessory) => {
                 return {
                     accessory_id: accessory.accessory_id,
                     name: accessory.name,
                     price: accessory.price,
                     quantity: accessory.quantity,
                     need: accessory.needed_id,
                     incompatible: accessory.incompatible_id
                 }});
};
const getCurrentConfiguration = async () => {
    const jsonResponse = await getJson(fetch(SERVER_URL + 'configuration/', {credentials: 'include'}));

    if (Object.keys(jsonResponse).length > 0) {
        return {
            model_id: jsonResponse.model_id,
            accessories: jsonResponse.accessories,
        };
    } else {
        return {};
    }
}


// per salvare una configurazione
const saveConfiguration = async (configuration) => {
    return getJson(fetch(SERVER_URL + 'configuration/', {
      method: 'POST',
      headers: {
        'content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(configuration),
    })
    )
}

const updateConfiguration = async (configuration) => {
    return getJson(fetch(SERVER_URL + 'configuration/', {
      method: 'PUT',
      headers: {
        'content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(configuration),
    })
    )

}

const deleteConfiguration = async () => {
    const response = await getJson( fetch(SERVER_URL + 'configuration/', {
      method: 'DELETE',
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    }));

}




/*** Authentication functions ***/

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
    return getJson(fetch(SERVER_URL + 'sessions', {
      method: 'POST',
      headers: {
        'content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(credentials),
    })
    )
  };
  
  /**
   * This function is used to verify if the user is still logged-in.
   * It returns a JSON object with the user info.
   */
  const getUserInfo = async () => {
    return getJson(fetch(SERVER_URL + 'sessions/current', {
      // this parameter specifies that authentication cookie must be forwared
      credentials: 'include'
    })
    )
  };
  
  /**
   * This function destroy the current user's session and execute the log-out.
   */
  const logOut = async() => {
    return getJson(fetch(SERVER_URL + 'sessions/current', {
      method: 'DELETE',
      credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
    })
    )
  }
  
  
  async function getAuthToken() {
    return getJson(fetch(SERVER_URL + 'auth-token', {
      // this parameter specifies that authentication cookie must be forwared
      credentials: 'include'
    })
    )
  }

  async function getEstimationTime(authToken, accessories) {
      return getJson(fetch(SERVER_URL2+'estimation', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({accessories: accessories}),
          })
      );
  }

const API = { getModels, getAccessories, getCurrentConfiguration, saveConfiguration, updateConfiguration, deleteConfiguration, logIn, getUserInfo, logOut, getAuthToken, getEstimationTime };
export default API;