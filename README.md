# SockJS client for node

## status: production ready
[![Build Status](https://travis-ci.org/humanchimp/node-sockjs-client.svg?branch=master)](https://travis-ci.org/humanchimp/node-sockjs-client)

## in brief:

It's a fork of the SockJS client library that doesn't rely on DOM primitives, while still retaining the same interface as the original, making it suitable as a drop-in replacement in code meant originally to run in the browser.  It uses websocket as its only transport for now.
