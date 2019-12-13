import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import { Header } from '../components';

import { HomeView, PageNotFoundView, GalleryView, Viewer, ObjectView } from '../pages';

class Routes extends React.Component {
	render() {
		return (
			<Router>
				<Header />
				<Switch>
					<Redirect exact path="/" to="home" />
					<Route exact path="/home" component={HomeView} />
					<Route exact path="/gallery" component={GalleryView} />
					<Route exact path="/viewer" component={Viewer} />
					<Route exact path="/objects" component={ObjectView} />
					<Route component={PageNotFoundView} />
				</Switch>
			</Router>
		);
	}
}

export default Routes;
