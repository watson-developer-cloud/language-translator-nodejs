# Language Translator Nodejs Starter Application

  The IBM Watson&trade; [Language Translator][service_url] service provides an Application Programming Interface (API) that lets you identify the language of text, and then use a custom business domain to translate the text from one supported language to another.  
  You can translate either by letting the service identify the source language or by selecting a source language and then by selecting a target language, and a business domain. Domain translation is linguistically targeted these business domains:
  *  *The News domain* – targeted at news articles and transcripts, it translates English to and from French, Spanish, Portuguese or Arabic.
  *  *The Conversational domain* – targeted at conversational colloquialisms, it translates English to and from French, Spanish, Portuguese or Arabic.
  *  *The Patent domain* – targeted at technical and legal terminology, it translates Spanish, Portuguese, Chinese, or Korean to English.

Give it a try! Click the button below to fork into IBM DevOps Services and deploy your own copy of this application on Bluemix.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/watson-developer-cloud/language-translator-nodejs)

## Getting started

1. You need a Bluemix account. If you don't have one, [sign up][sign_up]. Experimental Watson Services are free to use.

1. Download and install the [Cloud-foundry CLI][cloud_foundry] tool if you haven't already.

1. Edit the `manifest.yml` file and change `<application-name>` to something unique. The name you use determines the URL of your application. For example, `<application-name>.mybluemix.net`.

    ```
    applications:
    - services:
      - language-translator-service
      name: <application-name>
      command: node app.js
      path: .
      memory: 128M
    ```

1. Connect to Bluemix with the command line tool.

    ```sh
    $ cf api https://api.ng.bluemix.net
    $ cf login -u <your user ID>
    ```

1. Create the Language Translator service in Bluemix.

    ```sh
    $ cf create-service language_translator standard language-translator-service
    ```

1. Push your app to make it live:

    ```sh
    $ cf push
    ```

  For more details about developing applications that use Watson Developer Cloud services in Bluemix, see [Getting started with Watson Developer Cloud and Bluemix][getting_started].


## Running locally
1. Download and install [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.com/).

1. Configure the code to connect to your service:

    1. Copy the credentials from your `language-translator-service` service in Bluemix. Run the following command:

        ```sh
        $ cf env <application-name>
        ```

        Example output:

        ```sh
        System-Provided:
        {
          "VCAP_SERVICES": {
            "language_translator": [
              {
                "credentials": {
                  "password": "<password>",
                  "url": "<url>",
                  "username": "<username>"
                }
                "label": "language-translator",
                "name": "language-translator-service",
                "plan": "standard",
                "tags": [
                  ...
                ]
              }
            ]
          }
        }
        ```

    1. Copy `username`, `password`, and `url` from the credentials.
    1. Open the `app.js` file and paste the username, password, and url credentials for the service.
    1. Save the `creds.js` file.


1. Install the Language Translator Node.js package:
    1. Change to the new directory that contains the project.
    2. Run the following command:node

    ```node
    $ npm install
    ```

1. Run the following command to start the application:

    ```node
    node app.js
    ```

1. Point your browser to [http://localhost:3000](http://localhost:3000).


## Troubleshooting

* The main source of troubleshooting and recovery information is the Bluemix log. To view the log, run the following command:

  ```sh
  $ cf logs <application-name> --recent
  ```

* For more details about the service, see the [documentation][docs] for the Language Translator.

## License

  This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).  
  This sample code is using jQuery which is licensed under MIT.  
  This sample code is using bootstrap which is licensed under MIT.

## Contributing

  See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM
  Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

[cloud_foundry]: https://github.com/cloudfoundry/cli
[service_url]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/language-translation.html
[getting_started]: https://www.youtube.com/watch?v=X95CMuQys-g
[sign_up]: https://apps.admin.ibmcloud.com/manage/trial/bluemix.html?cm_mmc=WatsonDeveloperCloud-_-LandingSiteGetStarted-_-x-_-CreateAnAccountOnBluemixCLI
[docs]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/language-translation
