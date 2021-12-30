# Westar Demand Rate Calculator

Developed for Westar in 2018 by Hot Sauce (www.hotsauceatl.com)

## Getting Started

This project is built using the [Vue](https://github.com/vuejs/vue) framework. 

The majority of the source files are contained within the src/ directory. You can also edit public/index.html to modify the template for the main HTML index file that will be generated when the project is built.

#### To run the project locally:

```
npm run serve
```
This will spin up a local webserver - typically at localhost:8080 - where any changes you make to the source files will be updated in real-time within the app in your browser.


#### To build the project for distribution:

```
npm run build
```
This will optimize and compile the project into a stand-alone set of files within the dist/ folder. 


### Prerequisites

The various prerequisites for this project can be installed using [npm](https://www.npmjs.com/)

### Installing

Once you have installed npm (if you don't already have it), you can install the prerequisites using the standard npm syntax:

```
npm install
```
This will read the prerequisites from the package.json file and install them for your project.

## Deployment

Run ```npm run build``` to build the project into the dist/ directory. This will contain all of the required files to deploy the project; you can take code from the generated dist/index.html to get the appropriate script code to insert into another web page of your choosing.

Note that you should not modify css or javascript code within the dist/ folder; if you need to make changes to the code, do so within the src/ folders and then re-build the project.

## Authors

Contact Hot Sauce - www.hotsauceatl.com - at 678.869.5466 for any questions about this project.