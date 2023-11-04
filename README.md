
# Secure Chat Application

This project is a secure chat application built with React and PeerJS. It utilizes WebRTC for peer-to-peer communication and ECDH for key exchange to establish a secure channel.

## Features

- Peer-to-peer communication using WebRTC.
- Secure key exchange with Elliptic-curve Diffie–Hellman (ECDH).
- Encryption and decryption of messages using AES-GCM.
- Unique chat room links for initiating a chat.
- Short Authentication String (SAS) for confirming the identity of participants.

## Installation

To run this project, you will need Node.js and npm installed on your machine.

1. Clone the repository to your local machine.
2. Navigate to the cloned directory and run `npm install` to install dependencies.
3. Start the development server with `npm start`.

## Usage

To host a chat room:
1. Navigate to the root path `/` to create a new room.
2. Share the unique chat link with another party.

To join a chat room:
1. Receive a unique chat link from the host.
2. Navigate to the provided link to join the chat.

Once connected, both parties should confirm the SAS displayed at the top of the chat interface to ensure the security of the communication channel.

## Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is open-sourced under the MIT license. See the LICENSE file for more details.

## Hosting
This project is also hosted on Cloudflare at the following URL: [one-time-chat.pages.dev](https://one-time-chat.pages.dev). You can use this hosted version as well.
