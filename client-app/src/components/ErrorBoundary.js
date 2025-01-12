import React, { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    this.setState({ errorMessage: error.message });
    console.error("Error caught in ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Error: {this.state.errorMessage}</h2>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
