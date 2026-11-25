class FXMLHttpRequest {
  constructor(network) {
    this.method = "";
    this.url = "";
    this.status = 0;
    this.readyState = 0;
    this.responseText = "";
    this.onload = null;
    this.onerror = null;
    this.onreadystatechange = null;
    this.network = network;
  }

  open(method, url, async = true) {
    this.method = method.toUpperCase();
    this.url = url;
    this.readyState = 1;

    if (this.onreadystatechange) {
      this.onreadystatechange();
    }
  }

  send(data = null) {
    this.readyState = 2;

    if (this.onreadystatechange) {
      this.onreadystatechange();
    }

    const request = {
      method: this.method,
      url: this.url,
      data: data ? (typeof data === "string" ? JSON.parse(data) : data) : null,
    };

    const delay = Math.random() * 800 + 1000;

    setTimeout(() => {
      this.readyState = 3;

      if (this.onreadystatechange) {
        this.onreadystatechange();
      }

      const response = this.network.sendToServer(request);
      this.status = response.status;
      this.readyState = 4;
      this.responseText = JSON.stringify(response.data);

      if (this.onreadystatechange) {
        this.onreadystatechange();
      }

      if (this.onload) {
        this.onload();
      }
    }, delay);
  }
}
