import React, { Component } from 'react';

import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/logo/Logo';
import Navigation from './components/navigation/Navigation';
import Particles from 'react-particles-js';
import Rank from './components/rank/Rank';
import Register from './components/register/Register';
import SignIn from './components/signin/SignIn';
import Modal from './components/modal/Modal';
import Profile from './components/profile/Profile';

import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 300,
      density: {
        enable: true,
        value_area: 2000
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  boxes: [],
  route: 'signin', // CHANGE BEFORE PUSH
  isSignedIn: false, //CHANGE BEFORE PUSH
  isProfileOpen: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  },
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    const token = window.localStorage.getItem('token');
    if (token) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/signin`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      })
      .then(resp => resp.json())
      .then(userId => {
        if (userId && userId.id)
          fetch(`${process.env.REACT_APP_BACKEND_URL}/profile/${userId.id}`, {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
            }
          })
          .then(resp => resp.json())
          .then(user => {
              if (user) {
                this.loadUser(user)
                this.onRouteChange('home');
              }
          })
      })
      .catch(console.log);
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined,
    }});
  }
  calculateFaceLocations = (data) => {
    if (data && data.outputs) {
      const faces = data.outputs[0].data.regions; //[0].region_info.bounding_box;
      const image = document.getElementById('inputImage');
      const width = Number(image.width);
      const height = Number(image.height);
      return faces.map((f, i) => {
        let face = f.region_info.bounding_box;
        return {
          key: i,
          left: face.left_col * width,
          topRow: face.top_row * height,
          right: width - (face.right_col * width),
          bottomRow: height - (face.bottom_row * height),
        };
      });
    }
  }

  displayFaceBoxes = (boxes = null) => {
    if (boxes)
      this.setState({boxes})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch(`${process.env.REACT_APP_BACKEND_URL}/imageurl`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': window.localStorage.getItem('token'),
      },
      body: JSON.stringify({
        input: this.state.input,
      })
    })
    .then(response => response.json())
    .then(response => {
      if (response) {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/image`, {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': window.localStorage.getItem('token'),
          },
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log);
      }
      this.displayFaceBoxes(this.calculateFaceLocations(response))
    })
    .catch( err => console.log(err));
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/signout`, {
          method: 'post',
          headers: {
            'Authorization': window.localStorage.getItem('token'),
          }
        })
        .then(resp => resp.json())
        .then(logout => {
          if (logout.success === 'true')
            return this.setState(initialState);
        })
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  toggleModal = () => {
    this.setState(prevState => ({
      isProfileOpen: !prevState.isProfileOpen
    }));
  }

  render() {
    return (
      <div className="App">
      <Particles className='particles'
            params={particlesOptions}
        />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} toggleModal={this.toggleModal}/>
          {this.state.isProfileOpen &&
            <Modal>
              <Profile 
                user={this.state.user} 
                isProfileOpen={this.state.isProfileOpen} 
                toggleModal={this.toggleModal} 
                loadUser={this.loadUser} />
              {'Hello'}
            </Modal>
          }
        { this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
            <FaceRecognition boxes={this.state.boxes} imageUrl={this.state.imageUrl}/>
            </div>
          : (
              this.state.route === 'signin'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }
}

export default App;
