const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

function queryStringify(data: Record<string, string>) {
  if (typeof data !== "object" || data === null) {
    throw new Error("Data must be a non-null object");
  }

  const keys = Object.keys(data);

  if (keys.length === 0) {
    return "";
  }

  return keys.reduce((result, key, index) => {
    if (data[key] === undefined || data[key] === null) {
      return result;
    }

    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(data[key]);

    const separator = index < keys.length - 1 ? "&" : "";

    return `${result}${encodedKey}=${encodedValue}${separator}`;
  }, "?");
}

type HTTPHeaders = Record<string, string>;

type RequestOptions = {
  method: string;
  data?: Record<string, string>;
  headers?: HTTPHeaders;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
};

export type HTTPTransportOptions = Omit<RequestOptions, "method">;

export type HTTPRequestRejected = {
  reason: string;
  status?: number;
  response?: string;
  request?: string;
  timeout?: number;
};

class HTTPTransport {
  private baseUrl: string = "";

  constructor(baseUrl = "") {
    this.setBaseUrl(baseUrl);
  }

  public getBaseUrl() {
    return this.baseUrl;
  }

  public setBaseUrl(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  public get = (url: string, options: HTTPTransportOptions = {}) => {
    return this.request(
      url,
      { ...options, method: METHODS.GET },
      options.timeout,
    );
  };

  public post = (url: string, options: HTTPTransportOptions = {}) => {
    return this.request(
      url,
      { ...options, method: METHODS.POST },
      options.timeout,
    );
  };

  public put = (url: string, options: HTTPTransportOptions = {}) => {
    return this.request(
      url,
      { ...options, method: METHODS.PUT },
      options.timeout,
    );
  };

  public delete = (url: string, options: HTTPTransportOptions = {}) => {
    return this.request(
      url,
      { ...options, method: METHODS.DELETE },
      options.timeout,
    );
  };

  private request(url: string, options: RequestOptions, timeout = 5000) {
    const { headers = {}, method, data, responseType } = options;

    return new Promise((resolve, reject) => {
      if (!method) {
        reject({ reason: "HTTP method is required" });
        return;
      }

      const requestUrl = this.baseUrl + url;

      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      const isGet = method === METHODS.GET;

      xhr.open(
        method,
        isGet && data ? `${requestUrl}${queryStringify(data)}` : requestUrl,
      );

      if (responseType) {
        xhr.responseType = responseType;
      }

      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });

      xhr.onload = function () {
        let response;

        if (xhr.responseType) {
          response = xhr.response;
        } else {
          try {
            const contentType = xhr.getResponseHeader("Content-Type");
            if (contentType && contentType.includes("application/json")) {
              response = JSON.parse(xhr.responseText);
            } else {
              response = xhr.responseText;
            }
          } catch (e) {
            response = xhr.responseText;
          }
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject({
            status: xhr.status,
            reason: response?.reason ? response.reason : xhr.statusText,
            response: xhr.responseText,
            request: xhr,
          });
        }
      };

      xhr.onabort = () =>
        reject({
          reason: "Request aborted",
          request: xhr,
        });

      xhr.onerror = () =>
        reject({
          reason: "Network error",
          request: xhr,
        });

      xhr.timeout = timeout;

      xhr.ontimeout = () =>
        reject({
          reason: "Request timeout",
          timeout: timeout,
          request: xhr,
        });

      if (isGet || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else if (typeof data === "object") {
        if (!headers["Content-Type"]) {
          xhr.setRequestHeader("Content-Type", "application/json");
        }
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send(data);
      }
    });
  }
}

export default HTTPTransport;
