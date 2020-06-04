<h1 align="center" style="border-bottom: none;">*** DEPRECATED ***</h1>
<h1 align="center" style="border-bottom: none;">🚀 Language Translator Sample Application</h1>
<h1 align="center" style="border-bottom: none;">*** DEPRECATED ***</h1>
<h3 align="center">There is a new demo available for
  <a href="https://www.ibm.com/demos/live/watson-language-translator">Language Translator service</a>
</h3>
<h3 align="center">This Node.js app demonstrates some of the Language Translator service features.
</h3>
<p align="center">
  <a href="http://travis-ci.org/watson-developer-cloud/language-translator-nodejs">
    <img alt="Travis" src="https://travis-ci.org/watson-developer-cloud/language-translator-nodejs.svg?branch=master">
  </a>
  <a href="#badge">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
</p>
</p>

  The IBM Watson&trade; [Language Translator][service_url] service provides an Application Programming Interface (API) that lets you identify the language of text, and then use a custom business domain to translate the text from one supported language to another.  
  You can translate either by letting the service identify the source language or by selecting a source language and then by selecting a target language, and a business domain. In addition to text translation, you can use the API to translate full documents and preserve the file formatting!


Give it a try! Click the button below to fork into IBM DevOps Services and deploy your own copy of this application on IBM Cloud.


## Prerequisites

[![Greenkeeper badge](https://badges.greenkeeper.io/watson-developer-cloud/language-translator-nodejs.svg)](https://greenkeeper.io/)

1. Sign up for an [IBM Cloud account](https://cloud.ibm.com/registration/).
1. Download the [IBM Cloud CLI](https://cloud.ibm.com/docs/cli/index.html#overview).
1. Create an instance of the Language Translator service and get your credentials:
    - Go to the [Language Translator](https://cloud.ibm.com/catalog/services/language-translator) page in the IBM Cloud Catalog.
    - Log in to your IBM Cloud account.
    - Click **Create**.
    - Click **Show** to view the service credentials.
    - Copy the `apikey` value.
    - Copy the `url` value.

## Configuring the application

1. In the application folder, copy the *.env.example* file and create a file called *.env*

    ```
    cp .env.example .env
    ```

2. Open the *.env* file and add the service credentials that you obtained in the previous step.

    Example *.env* file that configures the `apikey` and `url` for a Language Translator service instance hosted in the US East region:

    ```
    LANGUAGE_TRANSLATOR_IAM_APIKEY=X4rbi8vwZmKpXfowaS3GAsA7vdy17Qh7km5D6EzKLHL2
    LANGUAGE_TRANSLATOR_URL=https://gateway-wdc.watsonplatform.net/language-translator/api
    ```

## Running locally

1. Install the dependencies

    ```
    npm install
    ```

1. Run the application

    ```
    npm start
    ```

1. View the application in a browser at `localhost:3000`

## Deploying to IBM Cloud as a Cloud Foundry Application

1. Login to IBM Cloud with the [IBM Cloud CLI](https://cloud.ibm.com/docs/cli/index.html#overview)

    ```
    ibmcloud login
    ```

1. Target a Cloud Foundry organization and space.

    ```
    ibmcloud target --cf
    ```

1. Edit the *manifest.yml* file. Change the **name** field to something unique.  
  For example, `- name: my-app-name`.
1. Deploy the application

    ```
    ibmcloud app push
    ```

1. View the application online at the app URL.  
For example: https://my-app-name.mybluemix.net


## License

This sample code is licensed under Apache 2.0.  
Full license text is available in [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM

Find more open source projects on the
[IBM Github Page](http://ibm.github.io/).

[service_url]: https://www.ibm.com/watson/services/language-translator/
[docs]: https://cloud.ibm.com/docs/language-translator?topic=language-translator-about#about
