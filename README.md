# portal-auth

portal-auth is an authentication module for dashboard 2, 
designed specifically for Portal, the instance manager for Node-RED

# setup
The module is prepared to work with subdomains and passes cookies accordingly.

To connect to the external application with users, you must create an endpoint at `http://yourportal/auth-endpoint` that returns object with `username` and optional user permissions. Make sure to check the `portal-perms-key` header in the incoming request and verify that it matches your configured key `PORTAL_PERMS_KEY=SECRETKEY`. If the key does not match, the endpoint should return an appropriate error response (e.g., HTTP 403 Forbidden).

### node-red .env file
```
PORTAL_PERMS_URL=http://yourportal/auth-endpoint
PORTAL_PERMS_KEY=SECRETKEY
```

### beta node-red settings.js dashboard middlewares config
```
  // beta
  // todo find better solution for display error on client. Now is "There was an error loading the Dashboard.".
  // todo remove console logs
  dashboard: {
    path: "dashboard",
    middleware: async (req, res, next) => {
      console.log("middleware request");

      const cookies = req.headers.cookie;
      if (!cookies) {
        return res.status(403).send("Authorization Required");
      }

      try {
        let perms = null;

        const response = await fetch(process.env.PORTAL_PERMS_URL, {
          method: "GET",
          headers: {
            Cookie: cookies,
            "portal-perms-key": process.env.PORTAL_PERMS_KEY || "DEFAULTKEY",
          },
        });

        perms = await response.json();
        const isUser = perms !== null && perms.hasOwnProperty("username");

        if (!isUser) {
          return res.status(403).send("Authorization Required");
        }

        res.portal = perms;
        next();
      } catch (error) {
        return res.status(403).send("Authorization Required");
      }
    },

    ioMiddleware: [
      async (socket, next) => {
        console.log("ioMiddleware request");

        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
          next(new Error("Authorization Required"));
        }

        try {
          let perms = null;

          const response = await fetch(process.env.PORTAL_PERMS_URL, {
            method: "GET",
            headers: {
              Cookie: cookies,
              "portal-perms-key": process.env.PORTAL_PERMS_KEY || "DEFAULTKEY",
            },
          });

          perms = await response.json();
          const isUser = perms !== null && perms.hasOwnProperty("username");

          if (!isUser) {
            next(new Error("Authorization Required"));
            return;
          }

          socket.handshake.portal = perms;
          next();
        } catch (error) {
          next(new Error("Authorization Required"));
        }
      },
    ],
  },
```
