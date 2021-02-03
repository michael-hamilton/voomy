# voomy
A simple personal media management platform.


## Installation
Run `npm install` to install dependencies. `npm build` will bundle the frontend in `/dist`.


## Usage
The vidserve server can be started with `npm start` (note that this will launch the server using PM2).
The app is served at port `3000` by default. vidserve is a PWA, so it is optimized for use when added to the homescreen.

By default there is no pincode, but one can be setup on the config page.

External drives will appear in the drive list on the config page. Selecting a drive will set it as the media root.
The files page will list all the files present in the media root, with support for navigating to subdirectories.

Currently only video files are supported.


## License
Released under the MIT license.



## Acknowledgement
Made with love by [Michael Hamilton](http://hamblest.one).
