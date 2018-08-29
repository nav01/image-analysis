import React, { Component } from 'react';

import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/logo/Logo';
import Navigation from './components/navigation/Navigation';
import Particles from 'react-particles-js';
import Rank from './components/rank/Rank';
import Register from './components/register/Register';
import SignIn from './components/signin/SignIn';

import Clarifai from 'clarifai';
import 'tachyons';

import './App.css';

const app = new Clarifai.App({
 apiKey: 'e4f00eb104f841a79a4c916394ce7f1b'
});

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
class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
    }
  }

  calculateFaceLocation = (data) => {
    const face = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      left: face.left_col * width,
      topRow: face.top_row * height,
      right: width - (face.right_col * width),
      bottomRow: height - (face.bottom_row * height),
    };
  }

  displayFaceBox = (box) => {
      this.setState({box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input).then(
      response => this.displayFaceBox(this.calculateFaceLocation(response))
    ).catch( err => console.log(err));
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
        this.setState({isSignedIn: false});
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  render() {
    return (
      <div className="App">
      <Particles className='particles'
            params={particlesOptions}
        />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
            </div>
          : (
              this.state.route === 'signin'
              ? <SignIn onRouteChange={this.onRouteChange}/>
              : <Register onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }
}

export default App;
